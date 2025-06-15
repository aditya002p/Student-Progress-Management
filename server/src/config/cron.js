/**
 * Cron Configuration
 * Manages cron job schedules and configuration for automated tasks
 */

const logger = require('../utils/logger');

/**
 * Default cron job configurations
 * Using standard cron syntax: 
 * ┌────────────── second (optional)
 * │ ┌──────────── minute
 * │ │ ┌────────── hour
 * │ │ │ ┌──────── day of month
 * │ │ │ │ ┌────── month
 * │ │ │ │ │ ┌──── day of week
 * │ │ │ │ │ │
 * │ │ │ │ │ │
 * * * * * * *
 */
const defaultCronConfig = {
  // Codeforces data sync job (runs at 2 AM daily)
  codeforcesSync: {
    schedule: process.env.CODEFORCES_SYNC_SCHEDULE || '0 2 * * *',
    timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata',
    enabled: process.env.CODEFORCES_SYNC_ENABLED !== 'false',
    config: {
      batchSize: parseInt(process.env.CODEFORCES_SYNC_BATCH_SIZE, 10) || 50,
      retryCount: parseInt(process.env.CODEFORCES_SYNC_RETRY_COUNT, 10) || 3,
      retryDelay: parseInt(process.env.CODEFORCES_SYNC_RETRY_DELAY, 10) || 5000
    }
  },
  
  // Inactivity check job (runs at 3 AM daily)
  inactivityCheck: {
    schedule: process.env.INACTIVITY_CHECK_SCHEDULE || '0 3 * * *',
    timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata',
    enabled: process.env.INACTIVITY_CHECK_ENABLED !== 'false',
    config: {
      inactivityThresholdDays: parseInt(process.env.INACTIVITY_THRESHOLD_DAYS, 10) || 7
    }
  },
  
  // Email reminder job (runs at 10 AM daily)
  emailReminder: {
    schedule: process.env.EMAIL_REMINDER_SCHEDULE || '0 10 * * *',
    timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata',
    enabled: process.env.EMAIL_REMINDER_ENABLED !== 'false',
    config: {
      reminderTemplate: process.env.EMAIL_REMINDER_TEMPLATE || 'inactivity_reminder',
      reminderSubject: process.env.EMAIL_REMINDER_SUBJECT || 'Reminder: Get back to problem solving!',
      reminderFrequencyDays: parseInt(process.env.REMINDER_FREQUENCY_DAYS, 10) || 3,
      maxReminderCount: parseInt(process.env.MAX_REMINDER_COUNT, 10) || 5
    }
  }
};

/**
 * Validate a cron expression
 * @param {string} expression - Cron expression to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidCronExpression = (expression) => {
  try {
    // Simple validation - checks if the expression has the correct number of parts
    // For more comprehensive validation, a cron parser library would be used
    const parts = expression.split(' ');
    
    // Standard cron has 5 parts, some implementations use 6 (with seconds)
    if (parts.length < 5 || parts.length > 6) {
      return false;
    }
    
    // Check each part for valid characters
    const validChars = /^[0-9/*,\-]+$/;
    for (const part of parts) {
      if (!validChars.test(part)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    logger.error('Error validating cron expression:', error);
    return false;
  }
};

/**
 * Calculate the next run time for a cron expression
 * @param {string} expression - Cron expression
 * @param {string} timezone - Timezone for the cron job
 * @returns {Date} Next run date
 */
const getNextRunTime = (expression, timezone = 'UTC') => {
  try {
    // This is a simplified implementation
    // In production, use a library like cron-parser for accurate calculations
    
    // Parse the expression
    const parts = expression.split(' ');
    const minute = parseInt(parts[0], 10);
    const hour = parseInt(parts[1], 10);
    
    // Create a date for today with the specified hour and minute
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(hour, minute, 0, 0);
    
    // If the time is in the past, add a day
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    return nextRun;
  } catch (error) {
    logger.error('Error calculating next run time:', error);
    // Default to 24 hours from now if calculation fails
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
};

/**
 * Get cron configuration for a specific job
 * @param {string} jobName - Name of the job
 * @returns {Object} Cron configuration for the job
 */
const getCronConfig = (jobName) => {
  if (!defaultCronConfig[jobName]) {
    logger.warn(`No default configuration found for job: ${jobName}`);
    return null;
  }
  
  return defaultCronConfig[jobName];
};

/**
 * Get all cron configurations
 * @returns {Object} All cron configurations
 */
const getAllCronConfigs = () => {
  return defaultCronConfig;
};

module.exports = {
  defaultCronConfig,
  isValidCronExpression,
  getNextRunTime,
  getCronConfig,
  getAllCronConfigs
};
