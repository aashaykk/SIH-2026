const { Pool } = require('pg');
require('dotenv').config({ override: true });

let pool;

if (process.env.DATABASE_URL) {
  console.log('Connecting to database using connection string...');
  const connectionString = process.env.DATABASE_URL.trim().replace(/^["']|["']$/g, '');
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false, // Required for Supabase external SSL connections
    },
  });
} else {
  console.log('Connecting to database using individual host parameters...');
  const useSSL = process.env.DB_SSL === 'true';
  pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
  });
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
