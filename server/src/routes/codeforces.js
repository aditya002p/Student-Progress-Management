const express = require('express');
const router = express.Router();
const codeforcesController = require('../controllers/codeforcesController');

/**
 * Codeforces routes
 * Handles all API endpoints for Codeforces data operations
 */

// GET /api/codeforces/students/:id/contests - Get contest history with filtering
router.get('/students/:id/contests', codeforcesController.getContestHistory);

// GET /api/codeforces/students/:id/problems - Get problem solving data with filtering
router.get('/students/:id/problems', codeforcesController.getProblemSolvingData);

// GET /api/codeforces/students/:id/heatmap - Get submission heatmap data
router.get('/students/:id/heatmap', codeforcesController.getSubmissionHeatmap);

// GET /api/codeforces/students/:id/unsolved - Get unsolved problems from contests
router.get('/students/:id/unsolved', codeforcesController.getUnsolvedProblems);

// GET /api/codeforces/students/:id/distribution - Get rating distribution of problems solved
router.get('/students/:id/distribution', codeforcesController.getRatingDistribution);

// GET /api/codeforces/students/:id/statistics - Get overall statistics for a student
router.get('/students/:id/statistics', codeforcesController.getOverallStatistics);

// GET /api/codeforces/validate-handle/:handle - Validate a Codeforces handle
router.get('/validate-handle/:handle', codeforcesController.validateHandle);

module.exports = router;
