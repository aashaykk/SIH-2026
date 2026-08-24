/**
 * Upgraded Priority Engine for NAGAR-X.
 * Computes an explainable priority score (0-100) and maps it to a standard priority tier.
 */

const calculatePriorityDetails = (severity, reportCount = 1, options = {}) => {
  const normalizedSeverity = (severity || 'LOW').toUpperCase();
  const count = parseInt(reportCount, 10) || 1;

  // 1. Severity points (Max 80 pts)
  let severityPoints = 10;
  if (normalizedSeverity === 'MEDIUM') {
    severityPoints = 35;
  } else if (normalizedSeverity === 'HIGH') {
    severityPoints = 55;
  } else if (normalizedSeverity === 'CRITICAL') {
    severityPoints = 80;
  }

  // 2. Civic Signal points (Max 20 pts)
  // Dynamic scaling based on number of duplicate reports/reporters
  const civicSignalPoints = Math.min(count * 2.5, 20);

  // 3. Duration points (Max 15 pts)
  // Penalizes issues that stay open longer
  const ageDays = parseFloat(options.ageDays || 0);
  const durationPoints = Math.min(ageDays * 3.0, 15);

  // 4. Sensitive location points (Max 15 pts)
  // E.g., schools, hospitals, commercial markets, high-impact transit hubs
  const isSensitiveLocation = !!options.isSensitiveLocation;
  const locationPoints = isSensitiveLocation ? 15 : 0;

  // 5. Affected Area / Spatial Spread (Max 10 pts)
  const spreadMeters = parseFloat(options.spreadMeters || 0);
  const areaPoints = Math.min(Math.floor(spreadMeters / 15), 10);

  // 6. Recurrence history (Max 5 pts)
  const isRecurrent = !!options.isRecurrent;
  const recurrencePoints = isRecurrent ? 5 : 0;

  // 7. Report trend acceleration (Max 10 pts)
  const reportsLast24h = parseInt(options.reportsLast24h || 0, 10);
  const trendPoints = Math.min(reportsLast24h * 2.0, 10);

  // Total Score Calculation (capped at 100)
  const totalScore = severityPoints + civicSignalPoints + durationPoints + locationPoints + areaPoints + recurrencePoints + trendPoints;
  const priorityScore = Math.min(Math.round(totalScore), 100);

  // Tier mapping
  let priority = 'LOW';
  if (priorityScore >= 75) {
    priority = 'CRITICAL';
  } else if (priorityScore >= 50) {
    priority = 'HIGH';
  } else if (priorityScore >= 30) {
    priority = 'MEDIUM';
  }

  // Compile explainable justification reasons
  const reasons = [];
  reasons.push(`Base visual severity classified as ${normalizedSeverity} (${severityPoints} pts).`);

  if (count > 1) {
    reasons.push(`${count} citizens collectively reported this issue (+${civicSignalPoints} pts).`);
  }
  if (ageDays > 0) {
    reasons.push(`Issue unresolved for ${ageDays.toFixed(1)} days (+${durationPoints} pts).`);
  }
  if (isSensitiveLocation) {
    reasons.push(`Located near a sensitive or high-density public zone (+15 pts).`);
  }
  if (spreadMeters > 0) {
    reasons.push(`Spanning a visual area of ${spreadMeters.toFixed(0)} meters (+${areaPoints} pts).`);
  }
  if (isRecurrent) {
    reasons.push(`Occurring in a known recurring grievance hotspot (+5 pts).`);
  }
  if (reportsLast24h > 1) {
    reasons.push(`Increasing reporting trend with ${reportsLast24h} filings today (+${trendPoints} pts).`);
  }

  return {
    priority,
    priorityScore,
    reasons
  };
};

/**
 * Backward compatibility helper for standard routes.
 */
const calculatePriority = (severity, reportCount = 1) => {
  const details = calculatePriorityDetails(severity, reportCount);
  return details.priority;
};

module.exports = {
  calculatePriority,
  calculatePriorityDetails,
};
