const db = require('../config/db');
const bcrypt = require('bcryptjs');

const initDatabase = async () => {
  try {
    console.log('Initializing database schema...');
    
    // Enable pgcrypto extension for gen_random_uuid()
    await db.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('CITIZEN', 'OFFICER', 'ADMIN')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✔ Users table checked/created.');

    // Create issues table
    await db.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        severity VARCHAR(50) NOT NULL,
        priority VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        image_url TEXT,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        report_count INTEGER DEFAULT 1,
        department VARCHAR(100),
        assigned_officer UUID REFERENCES users(id) ON DELETE SET NULL,
        ai_confidence DOUBLE PRECISION,
        sla_deadline TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✔ Issues table checked/created.');

    // Seed default users if empty
    const userCountResult = await db.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(userCountResult.rows[0].count, 10);

    if (userCount === 0) {
      console.log('Seeding default users...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const seedUsers = [
        { name: 'NagarX Citizen', email: 'citizen@nagarx.gov', role: 'CITIZEN' },
        { name: 'NagarX Officer', email: 'officer@nagarx.gov', role: 'OFFICER' },
        { name: 'NagarX Admin', email: 'admin@nagarx.gov', role: 'ADMIN' },
      ];

      for (const u of seedUsers) {
        await db.query(
          'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
          [u.name, u.email, hashedPassword, u.role]
        );
      }
      console.log('✔ Default users seeded successfully:');
      console.log('  - Citizen: citizen@nagarx.gov / password123');
      console.log('  - Officer: officer@nagarx.gov / password123');
      console.log('  - Admin:   admin@nagarx.gov / password123');
    } else {
      console.log('Database already seeded with users.');
    }
    
    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('✘ Error initializing database:', error);
    throw error;
  }
};

module.exports = { initDatabase };
