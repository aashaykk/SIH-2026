const db = require('../config/db');

/**
 * Routes an issue to the correct department.
 * Queries the database rules first, and falls back to static mappings if database is unavailable.
 */
const routeToDepartment = async (category) => {
  try {
    const result = await db.query(
      `SELECT d.name 
       FROM department_rules r
       JOIN departments d ON r.department_id = d.id
       WHERE UPPER(r.category) = $1`,
      [(category || '').toUpperCase()]
    );

    if (result.rows.length > 0) {
      return result.rows[0].name;
    }
  } catch (error) {
    console.warn(`[ROUTING SERVICE WARNING] DB lookup failed (${error.message}). Falling back to static mappings.`);
  }

  // Static Fallbacks
  const normalizedCategory = (category || 'OTHER').toUpperCase();
  switch (normalizedCategory) {
    case 'ROAD_DAMAGE':
    case 'POTHOLE':
      return 'ROADS';
    case 'GARBAGE':
    case 'ILLEGAL_DUMPING':
      return 'SANITATION';
    case 'STREETLIGHT':
      return 'ELECTRICAL';
    case 'WATER_LEAKAGE':
      return 'WATER';
    case 'SEWAGE':
    case 'DRAINAGE':
      return 'SEWAGE_AND_DRAINAGE';
    case 'OTHER':
    default:
      return 'GENERAL';
  }
};

/**
 * Synchronous fallback wrapper for simple checks
 */
const routeToDepartmentSync = (category) => {
  const normalizedCategory = (category || 'OTHER').toUpperCase();
  switch (normalizedCategory) {
    case 'ROAD_DAMAGE':
    case 'POTHOLE':
      return 'ROADS';
    case 'GARBAGE':
    case 'ILLEGAL_DUMPING':
      return 'SANITATION';
    case 'STREETLIGHT':
      return 'ELECTRICAL';
    case 'WATER_LEAKAGE':
      return 'WATER';
    case 'SEWAGE':
    case 'DRAINAGE':
      return 'SEWAGE_AND_DRAINAGE';
    case 'OTHER':
    default:
      return 'GENERAL';
  }
};

module.exports = {
  routeToDepartment,
  routeToDepartmentSync,
};
