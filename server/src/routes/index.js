const express = require('express');
const router = express.Router();
const studentRoutes = require('./students');
const codeforcesRoutes = require('./codeforces');
const cronRoutes = require('./cron');
const exportRoutes = require('./export');
const { version } = require('../../package.json');

/**
 * Main API Router
 * Serves as the entry point for all API routes
 */

// API information route
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'Student Progress Management API',
    version,
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// API health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Register all route modules
router.use('/students', studentRoutes);
router.use('/codeforces', codeforcesRoutes);
router.use('/cron', cronRoutes);
router.use('/export', exportRoutes);

module.exports = router;
