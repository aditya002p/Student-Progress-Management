/**
 * Validation Middleware
 * Provides request validation using express-validator
 */

const { body, query, param, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Process validation results and handle errors
 * @returns {Function} Middleware function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  // Log validation errors
  logger.debug('Validation errors:', errors.array());

  // Format errors for response
  const extractedErrors = errors.array().map(err => ({
    field: err.param,
    message: err.msg
  }));

  return res.status(400).json({
    success: false,
    status: 400,
    message: 'Validation Error',
    errors: extractedErrors
  });
};

/**
 * Student validation rules
 */
const studentValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    
    body('phoneNumber')
      .optional()
      .trim()
      .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
      .withMessage('Invalid phone number format'),
    
    body('codeforcesHandle')
      .trim()
      .notEmpty().withMessage('Codeforces handle is required')
      .isLength({ min: 3, max: 24 }).withMessage('Codeforces handle must be between 3 and 24 characters')
      .matches(/^[a-zA-Z0-9._-]+$/).withMessage('Codeforces handle contains invalid characters'),
    
    validate
  ],
  
  update: [
    param('id')
      .isMongoId().withMessage('Invalid student ID format'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    
    body('phoneNumber')
      .optional()
      .trim()
      .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
      .withMessage('Invalid phone number format'),
    
    body('codeforcesHandle')
      .optional()
      .trim()
      .isLength({ min: 3, max: 24 }).withMessage('Codeforces handle must be between 3 and 24 characters')
      .matches(/^[a-zA-Z0-9._-]+$/).withMessage('Codeforces handle contains invalid characters'),
    
    validate
  ],
  
  getById: [
    param('id')
      .isMongoId().withMessage('Invalid student ID format'),
    
    validate
  ],
  
  getAll: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer')
      .toInt(),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
      .toInt(),
    
    query('sortField')
      .optional()
      .isString()
      .isIn(['name', 'email', 'codeforcesHandle', 'currentRating', 'maxRating', 'createdAt', 'lastDataUpdate'])
      .withMessage('Invalid sort field'),
    
    query('sortOrder')
      .optional()
      .isString()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    
    validate
  ]
};

/**
 * Codeforces data validation rules
 */
const codeforcesValidation = {
  getContestHistory: [
    param('id')
      .isMongoId().withMessage('Invalid student ID format'),
    
    query('days')
      .optional()
      .isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
      .toInt(),
    
    validate
  ],
  
  getProblemSolvingData: [
    param('id')
      .isMongoId().withMessage('Invalid student ID format'),
    
    query('days')
      .optional()
      .isInt({ min: 1, max: 90 }).withMessage('Days must be between 1 and 90')
      .toInt(),
    
    validate
  ],
  
  getSubmissionHeatmap: [
    param('id')
      .isMongoId().withMessage('Invalid student ID format'),
    
    query('days')
      .optional()
      .isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
      .toInt(),
    
    validate
  ]
};

/**
 * Cron job validation rules
 */
const cronValidation = {
  updateCronJob: [
    param('name')
      .isString()
      .isIn(['codeforcesSync', 'inactivityCheck', 'emailReminder'])
      .withMessage('Invalid cron job name'),
    
    body('schedule')
      .optional()
      .isString()
      .custom(value => {
        // Basic cron expression validation (5 or 6 parts)
        const parts = value.split(' ');
        if (parts.length < 5 || parts.length > 6) {
          throw new Error('Invalid cron schedule format');
        }
        return true;
      }),
    
    body('enabled')
      .optional()
      .isBoolean().withMessage('Enabled must be a boolean value'),
    
    body('timezone')
      .optional()
      .isString().withMessage('Timezone must be a string'),
    
    body('config.batchSize')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Batch size must be between 1 and 100'),
    
    body('config.inactivityThresholdDays')
      .optional()
      .isInt({ min: 1, max: 30 }).withMessage('Inactivity threshold must be between 1 and 30 days'),
    
    body('config.reminderTemplate')
      .optional()
      .isString().withMessage('Reminder template must be a string'),
    
    body('config.reminderSubject')
      .optional()
      .isString().withMessage('Reminder subject must be a string'),
    
    validate
  ],
  
  triggerCronJob: [
    param('name')
      .isString()
      .isIn(['codeforcesSync', 'inactivityCheck', 'emailReminder'])
      .withMessage('Invalid cron job name'),
    
    validate
  ]
};

/**
 * Export validation rules
 */
const exportValidation = {
  exportStudentsCSV: [
    query('filter')
      .optional()
      .isString(),
    
    validate
  ],
  
  exportStudentData: [
    param('id')
      .isMongoId().withMessage('Invalid student ID format'),
    
    validate
  ]
};

/**
 * Email validation rules
 */
const emailValidation = {
  sendTestEmail: [
    param('id')
      .isMongoId().withMessage('Invalid student ID format'),
    
    body('template')
      .optional()
      .isString(),
    
    body('subject')
      .optional()
      .isString(),
    
    validate
  ]
};

module.exports = {
  validate,
  studentValidation,
  codeforcesValidation,
  cronValidation,
  exportValidation,
  emailValidation
};
