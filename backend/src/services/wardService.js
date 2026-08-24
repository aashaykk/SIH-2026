const db = require('../config/db');

// Wards are stored as geographic bounding boxes. This keeps routing queryable
// today and can be swapped for PostGIS polygons without changing the API.
const findWardForLocation = async (latitude, longitude) => {
  const result = await db.query(
    `SELECT w.id, w.ward_number, w.name, w.nagarsevak_id,
            u.name AS nagarsevak_name
       FROM wards w
       LEFT JOIN users u ON u.id = w.nagarsevak_id
      WHERE $1 BETWEEN w.min_latitude AND w.max_latitude
        AND $2 BETWEEN w.min_longitude AND w.max_longitude
      ORDER BY (w.max_latitude - w.min_latitude) * (w.max_longitude - w.min_longitude)
      LIMIT 1`,
    [Number(latitude), Number(longitude)]
  );
  return result.rows[0] || null;
};

module.exports = { findWardForLocation };
