/**
 * Email Configuration
 * Handles email transport settings and validation for the notification system
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Create email transport configuration based on environment variables
 * @returns {Object} Email transport configuration
 */
const getEmailConfig = () => {
  return {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    from: process.env.EMAIL_FROM || 'noreply@studentprogress.com',
    replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM || 'noreply@studentprogress.com'
  };
};

/**
 * Create a nodemailer transport instance
 * @returns {Object} Configured nodemailer transport
 */
const createTransport = () => {
  const config = getEmailConfig();
  
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass
    },
    // Additional options for better deliverability
    pool: true, // Use pooled connections
    maxConnections: 5, // Maximum number of simultaneous connections
    maxMessages: 100, // Maximum number of messages per connection
    rateDelta: 1000, // Define minimum amount of milliseconds between messages
    rateLimit: 5 // Maximum number of messages sent in rateDelta time
  });
};

/**
 * Validate email configuration
 * @returns {Object} Validation result
 */
const validateConfig = async () => {
  const config = getEmailConfig();
  const result = { valid: false, issues: [] };
  
  // Check for required fields
  if (!config.auth.user) {
    result.issues.push('EMAIL_USER environment variable is not set');
  }
  
  if (!config.auth.pass) {
    result.issues.push('EMAIL_PASS environment variable is not set');
  }
  
  // If missing critical config, return early
  if (result.issues.length > 0) {
    result.valid = false;
    return result;
  }
  
  // Test connection
  try {
    const transport = createTransport();
    await transport.verify();
    result.valid = true;
    logger.info('Email configuration is valid');
  } catch (error) {
    result.valid = false;
    result.issues.push(`Connection test failed: ${error.message}`);
    logger.error('Email configuration is invalid:', error);
  }
  
  return result;
};

/**
 * Email templates configuration
 */
const templates = {
  // Template for inactivity reminders
  inactivityReminder: {
    subject: 'Reminder: Get back to problem solving!',
    template: 'inactivity_reminder',
    // Default template variables
    defaults: {
      appName: 'Student Progress Management System',
      codeforcesUrl: 'https://codeforces.com/problemset',
      daysThreshold: 7
    }
  },
  
  // Template for welcome emails
  welcome: {
    subject: 'Welcome to Student Progress Management System',
    template: 'welcome',
    defaults: {
      appName: 'Student Progress Management System',
      dashboardUrl: process.env.CLIENT_URL || 'http://localhost:3000'
    }
  },
  
  // Template for system notifications
  notification: {
    subject: 'System Notification',
    template: 'notification',
    defaults: {
      appName: 'Student Progress Management System'
    }
  }
};

/**
 * Get reminder frequency settings
 * @returns {Object} Reminder frequency configuration
 */
const getReminderConfig = () => {
  return {
    // Minimum days between sending reminders to the same student
    reminderFrequencyDays: parseInt(process.env.REMINDER_FREQUENCY_DAYS, 10) || 3,
    
    // Number of days of inactivity to trigger a reminder
    inactivityThresholdDays: parseInt(process.env.INACTIVITY_THRESHOLD_DAYS, 10) || 7,
    
    // Maximum number of reminders to send to a student
    maxReminderCount: parseInt(process.env.MAX_REMINDER_COUNT, 10) || 5,
    
    // Whether to automatically disable reminders after max count is reached
    disableAfterMaxReminders: process.env.DISABLE_AFTER_MAX_REMINDERS === 'true'
  };
};

module.exports = {
  getEmailConfig,
  createTransport,
  validateConfig,
  templates,
  getReminderConfig
};
