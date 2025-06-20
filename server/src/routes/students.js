const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

/**
 * Student routes
 * Handles all API endpoints for student management
 */

// GET /api/students - Get all students with pagination and filtering
router.get('/', studentController.getStudents);

// GET /api/students/new - Handle request for new student form
router.get('/new', studentController.handleNewStudentRequest);

// GET /api/students/:id - Get a single student by ID
router.get('/:id', studentController.getStudent);

// POST /api/students - Create a new student
router.post('/', studentController.createStudent);

// PUT /api/students/:id - Update a student
router.put('/:id', studentController.updateStudent);

// DELETE /api/students/:id - Delete a student
router.delete('/:id', studentController.deleteStudent);

// GET /api/students/:id/codeforces - Get student with Codeforces data
router.get('/:id/codeforces', studentController.getStudentWithCodeforcesData);

// GET /api/students/:id/contest-history - Get contest history for a student
router.get('/:id/contest-history', studentController.getContestHistory);

// GET /api/students/:id/problem-solving-stats - Get problem solving statistics for a student
router.get('/:id/problem-solving-stats', studentController.getProblemSolvingStats);

// PATCH /api/students/:id/toggle-reminders - Toggle email reminders for a student
router.patch('/:id/toggle-reminders', studentController.toggleEmailReminders);

// GET /api/students/:id/email-history - Get email reminder history for a student
router.get('/:id/email-history', studentController.getEmailReminderHistory);

// POST /api/students/:id/refresh-cf-data - Manually refresh Codeforces data for a student
router.post('/:id/refresh-cf-data', studentController.refreshCodeforcesData);

module.exports = router;
