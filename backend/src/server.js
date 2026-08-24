const app = require('./app');
const { initDatabase } = require('./utils/dbInit');
require('dotenv').config({ override: true });

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Initialize PostgreSQL tables and seed default users
    await initDatabase();

    // 2. Listen on Port
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 NAGAR-X Civic Intelligence Backend MVP Started`);
      console.log(`📡 Listening on Port: ${PORT}`);
      console.log(`🔗 API Base URL:      http://localhost:${PORT}/api`);
      console.log(`📁 Static Uploads:    http://localhost:${PORT}/uploads`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('✘ Fatal error: Server failed to start:', error);
    process.exit(1);
  }
};

// Handle process termination to close database pool pools gracefully
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});

startServer();
