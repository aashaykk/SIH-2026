const issueModel = require('../models/issueModel');
const aiService = require('../services/aiService');
const duplicateService = require('../services/duplicateService');
const priorityService = require('../services/priorityService');
const routingService = require('../services/routingService');
const slaService = require('../services/slaService');
const wardService = require('../services/wardService');

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

    if (!description || latitude === undefined || longitude === undefined) {
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
      const masterIssue = await issueModel.findById(duplicate.matchedIncidentId);
      if (!masterIssue) throw new Error('Duplicate master incident no longer exists');
      console.log(`Matching duplicate issue found for category ${category}. ID: ${masterIssue.id}`);

      const newReportCount = masterIssue.reportCount + 1;

      // Recalculate priority based on new report count and severity
      const priorityDetails = priorityService.calculatePriorityDetails(masterIssue.severity, newReportCount);

      // Update existing issue
      const updatedIssue = await issueModel.incrementReportCountAndRecalculatePriority(
        masterIssue.id,
        newReportCount,
        priorityDetails
      );

      return res.status(200).json({
        success: true,
        message: 'Duplicate issue detected. Report count incremented.',
        data: formatIssueResponse(req, updatedIssue),
        duplicate: { matchedIncidentId: masterIssue.id, score: duplicate.duplicateScore, metrics: duplicate.metrics },
      });
    }

    // 4. Otherwise, route department, calculate SLA, and create master issue
    const department = aiResult.department || await routingService.routeToDepartment(category);
    const ward = await wardService.findWardForLocation(latitude, longitude);
    const slaDeadline = await slaService.calculateSlaDeadline(category, new Date());
    const priorityDetails = priorityService.calculatePriorityDetails(severity, 1);

    const title = `${category.replace('_', ' ')} Incident`;

    const newIssue = await issueModel.createIssue({
      title,
      description,
      category,
      severity,
      priority: priorityDetails.priority,
      status: 'REPORTED',
      imageUrl: relativeImageUrl,
      latitude,
      longitude,
      reportCount: 1,
      department,
      aiConfidence: confidence,
      slaDeadline,
      wardId: ward?.id,
      nagarsevakId: ward?.nagarsevak_id,
      civicSignalScore: 2.5,
      priorityScore: priorityDetails.priorityScore,
      priorityReasons: priorityDetails.reasons,
      aiReasons: aiResult.reasons,
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
    const { status, category, assignedOfficer, department, nagarsevakId } = req.query;

    const issues = await issueModel.findAll({
      status,
      category,
      assignedOfficer,
      department,
      nagarsevakId: nagarsevakId,
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

const getStats = async (req, res) => {
  try {
    const db = require('../config/db');

    // 1. General Metrics
    const totalQuery = await db.query('SELECT COUNT(*)::integer AS total FROM issues');
    const unresolvedQuery = await db.query("SELECT COUNT(*)::integer AS count FROM issues WHERE status NOT IN ('RESOLVED', 'VERIFIED')");
    const inProgressQuery = await db.query("SELECT COUNT(*)::integer AS count FROM issues WHERE status = 'IN_PROGRESS'");
    const resolvedQuery = await db.query("SELECT COUNT(*)::integer AS count FROM issues WHERE status IN ('RESOLVED', 'VERIFIED')");
    const highPriorityQuery = await db.query("SELECT COUNT(*)::integer AS count FROM issues WHERE priority IN ('HIGH', 'CRITICAL') AND status NOT IN ('RESOLVED', 'VERIFIED')");

    // 2. Counts by Status
    const statusQuery = await db.query('SELECT status, COUNT(*)::integer AS count FROM issues GROUP BY status');
    const statusBreakdown = {};
    statusQuery.rows.forEach(r => {
      statusBreakdown[r.status] = r.count;
    });

    // 3. Counts by Category
    const categoryQuery = await db.query('SELECT category, COUNT(*)::integer AS count FROM issues GROUP BY category');
    const categoryBreakdown = {};
    categoryQuery.rows.forEach(r => {
      categoryBreakdown[r.category] = r.count;
    });

    // 4. Counts by Severity
    const severityQuery = await db.query('SELECT severity, COUNT(*)::integer AS count FROM issues GROUP BY severity');
    const severityBreakdown = {};
    severityQuery.rows.forEach(r => {
      severityBreakdown[r.severity] = r.count;
    });

    // 5. Time trends (issues reported in the last 7 days)
    const trendsQuery = await db.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, COUNT(*)::integer as count 
      FROM issues 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `);

    // 6. Ward breakdown (joining wards to get ward_number or name if available)
    const wardQuery = await db.query(`
      SELECT COALESCE(w.ward_number, 'Unknown') as ward, COUNT(i.id)::integer as count
      FROM issues i
      LEFT JOIN wards w ON w.id = i.ward_id
      GROUP BY w.ward_number
    `);
    const wardBreakdown = {};
    wardQuery.rows.forEach(r => {
      wardBreakdown[r.ward] = r.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        total: totalQuery.rows[0].total,
        unresolved: unresolvedQuery.rows[0].count,
        inProgress: inProgressQuery.rows[0].count,
        resolved: resolvedQuery.rows[0].count,
        highPriority: highPriorityQuery.rows[0].count,
        statusBreakdown,
        categoryBreakdown,
        severityBreakdown,
        trends: trendsQuery.rows,
        wardBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching statistics',
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
  getStats,
};
