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
  } = issueData;

  const result = await db.query(
    `INSERT INTO issues (
      title, description, category, severity, priority, status, 
      image_url, latitude, longitude, report_count, department, 
      ai_confidence, sla_deadline
    ) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
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
    ]
  );
  
  return mapRowToIssue(result.rows[0]);
};

const findById = async (id) => {
  const result = await db.query('SELECT * FROM issues WHERE id = $1', [id]);
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

const incrementReportCountAndRecalculatePriority = async (id, newReportCount, newPriority) => {
  const result = await db.query(
    `UPDATE issues 
     SET report_count = $1, priority = $2, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $3 
     RETURNING *`,
    [parseInt(newReportCount, 10), newPriority.toUpperCase(), id]
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
  let queryStr = 'SELECT * FROM issues';
  const params = [];
  const clauses = [];

  if (filters.status) {
    params.push(filters.status.toUpperCase());
    clauses.push(`status = $${params.length}`);
  }

  if (filters.category) {
    params.push(filters.category.toUpperCase());
    clauses.push(`category = $${params.length}`);
  }

  if (filters.assignedOfficer) {
    params.push(filters.assignedOfficer);
    clauses.push(`assigned_officer = $${params.length}`);
  }

  if (filters.department) {
    params.push(filters.department.toUpperCase());
    clauses.push(`department = $${params.length}`);
  }

  if (clauses.length > 0) {
    queryStr += ' WHERE ' + clauses.join(' AND ');
  }

  queryStr += ' ORDER BY created_at DESC';

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
