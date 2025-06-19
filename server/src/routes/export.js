const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

/**
 * Export routes
 * Handles all API endpoints for data export functionality
 */

// GET /api/export/students-csv - Export all students as CSV
router.get('/students-csv', exportController.exportStudentsCSV);

// GET /api/export/students/:id/codeforces - Export a student's Codeforces data as CSV
router.get('/students/:id/codeforces', exportController.exportStudentCodeforcesDataCSV);

// GET /api/export/students/:id/contests - Export a student's contest history as CSV
router.get('/students/:id/contests', exportController.exportStudentContestsCSV);

// GET /api/export/students/:id/submissions - Export a student's submissions as CSV
router.get('/students/:id/submissions', exportController.exportStudentSubmissionsCSV);

// GET /api/export/students/:id/problems - Export a student's solved problems as CSV
router.get('/students/:id/problems', exportController.exportStudentProblemsCSV);

// GET /api/export/inactive - Export inactive students report as CSV
router.get('/inactive', exportController.exportInactiveStudentsCSV);

// GET /api/export/email-history - Export email reminder history as CSV
router.get('/email-history', exportController.exportEmailHistoryCSV);

module.exports = router;
