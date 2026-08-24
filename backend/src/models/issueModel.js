const db = require('../config/db');

/**
 * Helper to map database rows (snake_case) to API-friendly models (camelCase)
 */
const mapRowToIssue = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    severity: row.severity,
    priority: row.priority,
    status: row.status,
    imageUrl: row.image_url,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    reportCount: parseInt(row.report_count, 10),
    department: row.department,
    assignedOfficer: row.assigned_officer,
    aiConfidence: row.ai_confidence ? parseFloat(row.ai_confidence) : null,
    slaDeadline: row.sla_deadline,
    wardId: row.ward_id,
    nagarsevakId: row.nagarsevak_id,
    wardNumber: row.ward_number || null,
    nagarsevakName: row.nagarsevak_name || null,
    civicSignalScore: Number(row.civic_signal_score || 0),
    priorityScore: Number(row.priority_score || 0),
    priorityReasons: row.priority_reasons || [],
    aiReasons: row.ai_reasons || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const createIssue = async (issueData) => {
  const {
    title,
    description,
    category,
    severity,
    priority,
    status,
    imageUrl,
    latitude,
    longitude,
    reportCount = 1,
    department,
    aiConfidence,
    slaDeadline,
    wardId, nagarsevakId, civicSignalScore = 0, priorityScore = 0, priorityReasons = [], aiReasons = [],
  } = issueData;

  const result = await db.query(
    `INSERT INTO issues (
      title, description, category, severity, priority, status, 
      image_url, latitude, longitude, report_count, department, 
      ai_confidence, sla_deadline, ward_id, nagarsevak_id, civic_signal_score, priority_score, priority_reasons, ai_reasons
    ) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
     RETURNING *`,
    [
      title,
      description,
      category.toUpperCase(),
      severity.toUpperCase(),
      priority.toUpperCase(),
      status.toUpperCase(),
      imageUrl,
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(reportCount, 10),
      department ? department.toUpperCase() : null,
      aiConfidence ? parseFloat(aiConfidence) : null,
      slaDeadline,
      wardId || null, nagarsevakId || null, Number(civicSignalScore), Number(priorityScore), JSON.stringify(priorityReasons), JSON.stringify(aiReasons),
    ]
  );
  
  return mapRowToIssue(result.rows[0]);
};

const findById = async (id) => {
  const result = await db.query(`SELECT i.*, w.ward_number, u.name AS nagarsevak_name FROM issues i LEFT JOIN wards w ON w.id = i.ward_id LEFT JOIN users u ON u.id = i.nagarsevak_id WHERE i.id = $1`, [id]);
  return mapRowToIssue(result.rows[0]);
};

const findActiveByCategory = async (category) => {
  const result = await db.query(
    `SELECT * FROM issues 
     WHERE category = $1 AND status != 'VERIFIED'`,
    [category.toUpperCase()]
  );
  return result.rows.map(mapRowToIssue);
};

const incrementReportCountAndRecalculatePriority = async (id, newReportCount, priorityDetails) => {
  const result = await db.query(
    `UPDATE issues 
     SET report_count = $1, priority = $2, civic_signal_score = $3, priority_score = $4,
         priority_reasons = $5::jsonb, updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING *`,
    [parseInt(newReportCount, 10), priorityDetails.priority.toUpperCase(), Math.min(newReportCount * 2.5, 20), priorityDetails.priorityScore, JSON.stringify(priorityDetails.reasons), id]
  );
  return mapRowToIssue(result.rows[0]);
};

const updateStatus = async (id, status) => {
  const result = await db.query(
    `UPDATE issues 
     SET status = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING *`,
    [status.toUpperCase(), id]
  );
  return mapRowToIssue(result.rows[0]);
};

const updateAssignment = async (id, assignedOfficer, status = null) => {
  let queryStr = `UPDATE issues SET assigned_officer = $1, updated_at = CURRENT_TIMESTAMP`;
  const params = [assignedOfficer, id];

  if (status) {
    queryStr += `, status = $3`;
    params.push(status.toUpperCase());
  }

  queryStr += ` WHERE id = $2 RETURNING *`;

  const result = await db.query(queryStr, params);
  return mapRowToIssue(result.rows[0]);
};

const findAll = async (filters = {}) => {
  let queryStr = 'SELECT i.*, w.ward_number, u.name AS nagarsevak_name FROM issues i LEFT JOIN wards w ON w.id = i.ward_id LEFT JOIN users u ON u.id = i.nagarsevak_id';
  const params = [];
  const clauses = [];

  if (filters.status) {
    params.push(filters.status.toUpperCase());
    clauses.push(`i.status = $${params.length}`);
  }

  if (filters.category) {
    params.push(filters.category.toUpperCase());
    clauses.push(`i.category = $${params.length}`);
  }

  if (filters.assignedOfficer) {
    params.push(filters.assignedOfficer);
    clauses.push(`i.assigned_officer = $${params.length}`);
  }

  if (filters.department) {
    params.push(filters.department.toUpperCase());
    clauses.push(`i.department = $${params.length}`);
  }

  if (filters.nagarsevakId) { params.push(filters.nagarsevakId); clauses.push(`i.nagarsevak_id = $${params.length}`); }
  if (clauses.length > 0) queryStr += ' WHERE ' + clauses.join(' AND ');
  queryStr += ' ORDER BY i.priority_score DESC, i.created_at DESC';

  const result = await db.query(queryStr, params);
  return result.rows.map(mapRowToIssue);
};

module.exports = {
  createIssue,
  findById,
  findActiveByCategory,
  incrementReportCountAndRecalculatePriority,
  updateStatus,
  updateAssignment,
  findAll,
};
