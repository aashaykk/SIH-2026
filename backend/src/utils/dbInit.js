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
        ward_id UUID,
        nagarsevak_id UUID REFERENCES users(id) ON DELETE SET NULL,
        civic_signal_score DOUBLE PRECISION DEFAULT 0,
        priority_score DOUBLE PRECISION DEFAULT 0,
        priority_reasons JSONB DEFAULT '[]'::jsonb,
        ai_reasons JSONB DEFAULT '[]'::jsonb,
        duplicate_of UUID REFERENCES issues(id) ON DELETE SET NULL,
        assigned_officer UUID REFERENCES users(id) ON DELETE SET NULL,
        ai_confidence DOUBLE PRECISION,
        sla_deadline TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✔ Issues table checked/created.');

    // Safe migrations for databases created by earlier prototype versions.
    await db.query(`ALTER TABLE issues ADD COLUMN IF NOT EXISTS ward_id UUID;`);
    await db.query(`ALTER TABLE issues ADD COLUMN IF NOT EXISTS nagarsevak_id UUID REFERENCES users(id) ON DELETE SET NULL;`);
    await db.query(`ALTER TABLE issues ADD COLUMN IF NOT EXISTS civic_signal_score DOUBLE PRECISION DEFAULT 0;`);
    await db.query(`ALTER TABLE issues ADD COLUMN IF NOT EXISTS priority_score DOUBLE PRECISION DEFAULT 0;`);
    await db.query(`ALTER TABLE issues ADD COLUMN IF NOT EXISTS priority_reasons JSONB DEFAULT '[]'::jsonb;`);
    await db.query(`ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_reasons JSONB DEFAULT '[]'::jsonb;`);

    await db.query(`
      CREATE TABLE IF NOT EXISTS wards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ward_number VARCHAR(30) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL, min_latitude DOUBLE PRECISION NOT NULL,
        max_latitude DOUBLE PRECISION NOT NULL, min_longitude DOUBLE PRECISION NOT NULL,
        max_longitude DOUBLE PRECISION NOT NULL, nagarsevak_id UUID REFERENCES users(id) ON DELETE SET NULL
      );
    `);

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
        { name: 'Ward 12 Nagar Sevak', email: 'nagarsevak.ward12@nagarx.gov', role: 'OFFICER' },
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

    const nagarsevakExists = await db.query(`SELECT id FROM users WHERE email = 'nagarsevak.ward12@nagarx.gov' LIMIT 1`);
    if (!nagarsevakExists.rows[0]) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db.query(`INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'OFFICER')`, ['Ward 12 Nagar Sevak', 'nagarsevak.ward12@nagarx.gov', hashedPassword]);
    }
    const nagarsevak = await db.query(`SELECT id FROM users WHERE email = 'nagarsevak.ward12@nagarx.gov' LIMIT 1`);
    if (nagarsevak.rows[0]) {
      // Demonstration bounds around Pune. Replace these with municipal ward GIS data in production.
      await db.query(`INSERT INTO wards (ward_number, name, min_latitude, max_latitude, min_longitude, max_longitude, nagarsevak_id)
        VALUES ('12', 'Ward 12', 18.480, 18.580, 73.800, 73.920, $1)
        ON CONFLICT (ward_number) DO UPDATE SET nagarsevak_id = EXCLUDED.nagarsevak_id`, [nagarsevak.rows[0].id]);
    }
    
    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('✘ Error initializing database:', error);
    throw error;
  }
};

module.exports = { initDatabase };
