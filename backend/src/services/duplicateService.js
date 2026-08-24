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
 * Searches candidates for duplicate issues based on:
 * - Same category (pre-filtered in DB)
 * - Not VERIFIED (pre-filtered in DB)
 * - Geographic distance <= 100 meters
 */
const findDuplicate = (candidates, latitude, longitude) => {
  const maxDistanceMeters = 100;
  const currentLat = parseFloat(latitude);
  const currentLon = parseFloat(longitude);

  for (const issue of candidates) {
    const issueLat = parseFloat(issue.latitude);
    const issueLon = parseFloat(issue.longitude);

    if (isNaN(issueLat) || isNaN(issueLon)) continue;

    const distance = getDistance(currentLat, currentLon, issueLat, issueLon);
    if (distance <= maxDistanceMeters) {
      return {
        ...issue,
        distance,
      };
    }
  }

  return null;
};

module.exports = {
  findDuplicate,
  getDistance,
};
