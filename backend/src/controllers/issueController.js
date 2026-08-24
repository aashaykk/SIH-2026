const issueModel = require('../models/issueModel');
const aiService = require('../services/aiService');
const duplicateService = require('../services/duplicateService');
const priorityService = require('../services/priorityService');
const routingService = require('../services/routingService');
const slaService = require('../services/slaService');

const VALID_STATUSES = ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'REOPENED'];

const VALID_TRANSITIONS = {
  'REPORTED': ['ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'],
  'ACKNOWLEDGED': ['IN_PROGRESS', 'RESOLVED'],
  'IN_PROGRESS': ['RESOLVED'],
  'RESOLVED': ['VERIFIED', 'REOPENED'],
  'VERIFIED': ['REOPENED'],
  'REOPENED': ['IN_PROGRESS', 'RESOLVED']
};

/**
 * Helper to dynamically append host to image path
 */
const formatIssueResponse = (req, issue) => {
  if (!issue) return null;
  const formatted = { ...issue };
  if (formatted.imageUrl && !formatted.imageUrl.startsWith('http')) {
    formatted.imageUrl = `${req.protocol}://${req.get('host')}${formatted.imageUrl}`;
  }
  return formatted;
};

const createIssue = async (req, res) => {
  try {
    const { description, latitude, longitude } = req.body;

    if (!description || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Description, latitude, and longitude are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Issue image is required',
      });
    }

    const relativeImageUrl = `/uploads/issues/${req.file.filename}`;

    // 1. Analyze issue with AI Service (or Fallback Mock)
    const aiResult = await aiService.analyzeIssue(
      req.file,
      description,
      latitude,
      longitude
    );

    const { category, severity, confidence } = aiResult;

    // 2. Fetch candidates for duplicate check
    const activeSameCategoryIssues = await issueModel.findActiveByCategory(category);

    // 3. Perform duplicate search
    const duplicate = await duplicateService.findDuplicate(
      activeSameCategoryIssues,
      {
        latitude,
        longitude,
        category,
        imageFile: req.file,
        createdAt: new Date()
      }
    );

    if (duplicate) {
      console.log(`Matching duplicate issue found for category ${category}. ID: ${duplicate.id}`);

      const newReportCount = duplicate.reportCount + 1;

      // Recalculate priority based on new report count and severity
      const escalatedPriority = priorityService.calculatePriority(duplicate.severity, newReportCount);

      // Update existing issue
      const updatedIssue = await issueModel.incrementReportCountAndRecalculatePriority(
        duplicate.id,
        newReportCount,
        escalatedPriority
      );

      return res.status(200).json({
        success: true,
        message: 'Duplicate issue detected. Report count incremented.',
        data: formatIssueResponse(req, updatedIssue),
      });
    }

    // 4. Otherwise, route department, calculate SLA, and create master issue
    const department = await routingService.routeToDepartment(category);
    const slaDeadline = await slaService.calculateSlaDeadline(category, new Date());
    const basePriority = priorityService.calculatePriority(severity, 1);

    const title = `${category.replace('_', ' ')} Incident`;

    const newIssue = await issueModel.createIssue({
      title,
      description,
      category,
      severity,
      priority: basePriority,
      status: 'REPORTED',
      imageUrl: relativeImageUrl,
      latitude,
      longitude,
      reportCount: 1,
      department,
      aiConfidence: confidence,
      slaDeadline,
    });

    console.log(`New issue successfully created: ${newIssue.id}`);

    return res.status(201).json({
      success: true,
      data: formatIssueResponse(req, newIssue),
    });
  } catch (error) {
    console.error('Error in createIssue:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating issue',
    });
  }
};

const getIssues = async (req, res) => {
  try {
    const { status, category, assignedOfficer, department } = req.query;

    const issues = await issueModel.findAll({
      status,
      category,
      assignedOfficer,
      department,
    });

    const formattedIssues = issues.map(issue => formatIssueResponse(req, issue));

    return res.status(200).json({
      success: true,
      data: formattedIssues,
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching issues',
    });
  }
};

const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await issueModel.findById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: formatIssueResponse(req, issue),
    });
  } catch (error) {
    console.error('Error fetching issue by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching issue',
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const targetStatus = status.toUpperCase();
    if (!VALID_STATUSES.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid options are: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const issue = await issueModel.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Validate status transitions
    const currentStatus = issue.status;
    const allowed = VALID_TRANSITIONS[currentStatus];

    if (!allowed || !allowed.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${targetStatus}`,
      });
    }

    const updatedIssue = await issueModel.updateStatus(id, targetStatus);
    return res.status(200).json({
      success: true,
      data: formatIssueResponse(req, updatedIssue),
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating status',
    });
  }
};

const assignIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedOfficer } = req.body;

    if (!assignedOfficer) {
      return res.status(400).json({
        success: false,
        message: 'assignedOfficer (Officer User ID) is required',
      });
    }

    const issue = await issueModel.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // If issue is in REPORTED or REOPENED status, assign transitions it to ACKNOWLEDGED
    let newStatus = null;
    if (issue.status === 'REPORTED' || issue.status === 'REOPENED') {
      newStatus = 'ACKNOWLEDGED';
    }

    const updatedIssue = await issueModel.updateAssignment(id, assignedOfficer, newStatus);
    return res.status(200).json({
      success: true,
      data: formatIssueResponse(req, updatedIssue),
    });
  } catch (error) {
    console.error('Error assigning officer:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while assigning officer',
    });
  }
};

const verifyIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    if (verified === undefined) {
      return res.status(400).json({
        success: false,
        message: 'verified (boolean) is required',
      });
    }

    const issue = await issueModel.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const currentStatus = issue.status;
    const targetStatus = verified ? 'VERIFIED' : 'REOPENED';

    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${targetStatus}`,
      });
    }

    const updatedIssue = await issueModel.updateStatus(id, targetStatus);
    return res.status(200).json({
      success: true,
      data: formatIssueResponse(req, updatedIssue),
    });
  } catch (error) {
    console.error('Error verifying issue:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while verifying issue',
    });
  }
};

const reopenIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await issueModel.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const currentStatus = issue.status;
    const targetStatus = 'REOPENED';

    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${targetStatus}`,
      });
    }

    const updatedIssue = await issueModel.updateStatus(id, targetStatus);
    return res.status(200).json({
      success: true,
      data: formatIssueResponse(req, updatedIssue),
    });
  } catch (error) {
    console.error('Error reopening issue:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while reopening issue',
    });
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateStatus,
  assignIssue,
  verifyIssue,
  reopenIssue,
};
