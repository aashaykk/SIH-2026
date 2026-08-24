/**
 * Routes an issue to the correct department based on its category.
 * 
 * Rules:
 * - ROAD_DAMAGE -> ROADS
 * - GARBAGE -> SANITATION
 * - STREETLIGHT -> ELECTRICAL
 * - WATER_LEAKAGE -> WATER
 * - OTHER -> GENERAL
 */
const routeToDepartment = (category) => {
  const normalizedCategory = (category || 'OTHER').toUpperCase();

  switch (normalizedCategory) {
    case 'ROAD_DAMAGE':
      return 'ROADS';
    case 'GARBAGE':
      return 'SANITATION';
    case 'STREETLIGHT':
      return 'ELECTRICAL';
    case 'WATER_LEAKAGE':
      return 'WATER';
    case 'OTHER':
    default:
      return 'GENERAL';
  }
};

module.exports = {
  routeToDepartment,
};
