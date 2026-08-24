const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ override: true });

const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');

const app = express();

// Configure CORS
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
const corsOptions = {
  origin: allowedOrigin === '*' ? true : allowedOrigin.split(','),
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads folder statically
// This makes files uploaded to backend/uploads/issues available at http://<host>/uploads/issues/<filename>
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root route for API health check
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'NAGAR-X backend is running and healthy.',
  });
});

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
