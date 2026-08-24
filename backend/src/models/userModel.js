const db = require('../config/db');

const createUser = async (name, email, hashedPassword, role) => {
  const result = await db.query(
    `INSERT INTO users (name, email, password, role) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, name, email, role, created_at AS "createdAt"`,
    [name, email, hashedPassword, role.toUpperCase()]
  );
  return result.rows[0];
};

const findByEmail = async (email) => {
  const result = await db.query(
    `SELECT id, name, email, password, role, created_at AS "createdAt" 
     FROM users 
     WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};

const findById = async (id) => {
  const result = await db.query(
    `SELECT id, name, email, role, created_at AS "createdAt" 
     FROM users 
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findByEmail,
  findById,
};
