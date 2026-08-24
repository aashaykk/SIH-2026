const aiService = require('./aiService');

/**
 * Haversine formula to compute the distance between two GPS coordinates in meters.
 */
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

/**
 * Advanced multi-signal duplicate detection.
 * Computes a weighted score based on:
 * 1. Geographic distance (35%)
 * 2. Image similarity (40%)
 * 3. Category similarity (15%)
 * 4. Time proximity (10%)
 */
const evaluateDuplicate = async (candidate, currentReport) => {
  const { latitude, longitude, category, createdAt, imageFile } = currentReport;

  // 1. Geographic Similarity (35%)
  const dist = getDistance(
    parseFloat(latitude),
    parseFloat(longitude),
    parseFloat(candidate.latitude),
    parseFloat(candidate.longitude)
  );

  let geoScore = 0.0;
  if (dist <= 15) {
    geoScore = 1.0;
  } else if (dist <= 150) {
    // Linear decay from 15m to 150m
    geoScore = 1.0 - (dist - 15) / (150 - 15);
  }

  // 2. Image Similarity (40%)
  // Call Python FastAPI to compare candidate image with incoming image
  let imageScore = 0.0;
  if (imageFile && candidate.imageUrl) {
    try {
      imageScore = await aiService.getImageSimilarity(candidate.imageUrl, imageFile);
    } catch (e) {
      console.warn('[DUPLICATE DETECTOR WARNING] Image similarity failed:', e.message);
      // Fallback: if geo is extremely close, assume moderate image similarity
      imageScore = geoScore > 0.8 ? 0.6 : 0.0;
    }
  }

  // 3. Category Similarity (15%)
  const categoryScore = (candidate.category || '').toUpperCase() === (category || '').toUpperCase() ? 1.0 : 0.0;

  // 4. Time Proximity (10%)
  let timeScore = 0.0;
  const timeDiffMs = Math.abs(new Date(candidate.createdAt).getTime() - new Date(createdAt).getTime());
  const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);
  if (timeDiffDays <= 1) {
    timeScore = 1.0;
  } else if (timeDiffDays <= 7) {
    // Linear decay from 1 day to 7 days
    timeScore = 1.0 - (timeDiffDays - 1) / (7 - 1);
  }

  // Calculate weighted total score
  const totalScore = (geoScore * 0.35) + (imageScore * 0.40) + (categoryScore * 0.15) + (timeScore * 0.10);

  // Return evaluation decisions
  let decision = 'NEW_INCIDENT';
  if (totalScore >= 0.85) {
    decision = 'SAME_INCIDENT';
  } else if (totalScore >= 0.60) {
    decision = 'POSSIBLE_DUPLICATE';
  }

  return {
    duplicateScore: floatRound(totalScore),
    decision,
    matchedIncidentId: candidate.id,
    metrics: {
      geoScore: floatRound(geoScore),
      imageScore: floatRound(imageScore),
      categoryScore: floatRound(categoryScore),
      timeScore: floatRound(timeScore),
      distanceMeters: floatRound(dist)
    }
  };
};

/**
 * Searches a list of candidates and returns the best duplicate match if one meets the criteria.
 */
const findDuplicate = async (candidates, currentReport) => {
  let bestMatch = null;
  let highestScore = 0.0;

  for (const candidate of candidates) {
    const evaluation = await evaluateDuplicate(candidate, currentReport);
    if (evaluation.duplicateScore > highestScore) {
      highestScore = evaluation.duplicateScore;
      bestMatch = evaluation;
    }
  }

  return bestMatch && bestMatch.duplicateScore >= 0.60 ? bestMatch : null;
};

const floatRound = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

module.exports = {
  findDuplicate,
  evaluateDuplicate,
  getDistance,
};
