/**
 * Determines issue priority based on severity and report count.
 * 
 * Rules:
 * - Base priority equals the severity level.
 * - If reportCount >= 3 and < 5, bump the priority up by 1 tier (LOW -> MEDIUM -> HIGH -> CRITICAL).
 * - If reportCount >= 5, escalate the priority to CRITICAL.
 */
const calculatePriority = (severity, reportCount = 1) => {
  const normalizedSeverity = (severity || 'LOW').toUpperCase();
  const count = parseInt(reportCount, 10) || 1;

  const severityOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  let baseIndex = severityOrder.indexOf(normalizedSeverity);
  
  if (baseIndex === -1) {
    baseIndex = 0; // Default to LOW if invalid
  }

  let finalIndex = baseIndex;

  if (count >= 5) {
    finalIndex = 3; // Escalated directly to CRITICAL
  } else if (count >= 3) {
    finalIndex = Math.min(baseIndex + 1, 3); // Escalated by 1 tier (capped at CRITICAL)
  }

  return severityOrder[finalIndex];
};

module.exports = {
  calculatePriority,
};
