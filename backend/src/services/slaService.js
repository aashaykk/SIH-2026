const db = require('../config/db');

/**
 * Calculates the SLA deadline for a given issue category.
 * Queries the database rules for configurations, and falls back to static rules.
 */
const calculateSlaDeadline = async (category, baseDate = new Date()) => {
  let hoursToAdd = 72; // Default fallback (72 hours)

  try {
    const result = await db.query(
      `SELECT sla_hours 
       FROM department_rules 
       WHERE UPPER(category) = $1`,
      [(category || '').toUpperCase()]
    );

    if (result.rows.length > 0) {
      hoursToAdd = parseInt(result.rows[0].sla_hours, 10);
    } else {
      hoursToAdd = getStaticSlaHours(category);
    }
  } catch (error) {
    console.warn(`[SLA SERVICE WARNING] DB lookup failed (${error.message}). Using static SLA fallback.`);
    hoursToAdd = getStaticSlaHours(category);
  }

  const deadline = new Date(baseDate.getTime());
  deadline.setMilliseconds(deadline.getMilliseconds() + hoursToAdd * 60 * 60 * 1000);
  return deadline;
};

/**
 * Static SLA fallback provider
 */
const getStaticSlaHours = (category) => {
  const normalizedCategory = (category || 'OTHER').toUpperCase();
  switch (normalizedCategory) {
    case 'WATER_LEAKAGE':
      return 4; // Water pipe leaks are high priority: 4 hours
    case 'GARBAGE':
    case 'ILLEGAL_DUMPING':
      return 24; // Garbage: 24 hours
    case 'STREETLIGHT':
      return 48; // Lights: 48 hours
    case 'ROAD_DAMAGE':
    case 'POTHOLE':
      return 168; // Road patches: 7 days (168 hours)
    case 'SEWAGE':
    case 'DRAINAGE':
      return 24; // Sewer backup: 24 hours
    case 'OTHER':
    default:
      return 72; // General: 3 days (72 hours)
  }
};

/**
 * Synchronous fallback wrapper
 */
const calculateSlaDeadlineSync = (category, baseDate = new Date()) => {
  const hoursToAdd = getStaticSlaHours(category);
  const deadline = new Date(baseDate.getTime());
  deadline.setMilliseconds(deadline.getMilliseconds() + hoursToAdd * 60 * 60 * 1000);
  return deadline;
};

module.exports = {
  calculateSlaDeadline,
  calculateSlaDeadlineSync,
};
