const express = require('express');
const router = express.Router();
const cronController = require('../controllers/cronController');

/**
 * Cron routes
 * Handles all API endpoints for cron job management
 */

// GET /api/cron - Get all cron jobs
router.get('/', cronController.getCronJobs);

// GET /api/cron/:name - Get a single cron job by name
router.get('/:name', cronController.getCronJob);

// PUT /api/cron/:name - Update cron job schedule and configuration
router.put('/:name', cronController.updateCronJob);

// POST /api/cron/:name/trigger - Manually trigger a cron job
router.post('/:name/trigger', cronController.triggerCronJob);

// POST /api/cron/reset - Reset all cron jobs to default settings
router.post('/reset', cronController.resetCronJobs);

// GET /api/cron/:name/history - Get cron job execution history
router.get('/:name/history', cronController.getCronJobHistory);

module.exports = router;
