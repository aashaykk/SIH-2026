/**
 * Calculates the SLA deadline for a given issue category relative to a base date.
 * 
 * SLA Deadlines:
 * - GARBAGE -> 24 hours
 * - WATER_LEAKAGE -> 24 hours
 * - STREETLIGHT -> 48 hours
 * - ROAD_DAMAGE -> 7 days (168 hours)
 * - OTHER -> 72 hours
 */
const calculateSlaDeadline = (category, baseDate = new Date()) => {
  const normalizedCategory = (category || 'OTHER').toUpperCase();
  let hoursToAdd = 72; // Default for OTHER (72 hours)

  switch (normalizedCategory) {
    case 'GARBAGE':
    case 'WATER_LEAKAGE':
      hoursToAdd = 24;
      break;
    case 'STREETLIGHT':
      hoursToAdd = 48;
      break;
    case 'ROAD_DAMAGE':
      hoursToAdd = 7 * 24; // 168 hours
      break;
    case 'OTHER':
    default:
      hoursToAdd = 72;
      break;
  }

  const deadline = new Date(baseDate.getTime());
  deadline.setMilliseconds(deadline.getMilliseconds() + hoursToAdd * 60 * 60 * 1000);
  return deadline;
};

module.exports = {
  calculateSlaDeadline,
};
