/**
 * Student Progress Management System
 * Email reminder job
 * 
 * This job sends reminder emails to students who haven't made Codeforces submissions
 * in a specified number of days (default: 7 days).
 */

const logger = require('../utils/logger');
const Student = require('../models/Student');
const EmailLog = require('../models/EmailLog');
const { getInactiveStudents } = require('./inactivityCheck');
const emailService = require('../services/emailService');
const { subDays } = require('date-fns');

/**
 * Send inactivity reminder emails to eligible students
 * @param {Object} config - Configuration options
 * @param {string} config.reminderTemplate - Email template to use
 * @param {string} config.reminderSubject - Email subject line
 * @param {number} config.inactivityThresholdDays - Days of inactivity to trigger reminder (default: 7)
 * @param {number} config.reminderFrequencyDays - Minimum days between reminders (default: 3)
 * @returns {Promise<Object>} Result with counts
 */
exports.sendInactivityReminders = async (config = {}) => {
  try {
    const startTime = Date.now();
    
    // Set default config values
    const reminderConfig = {
      reminderTemplate: config.reminderTemplate || 'inactivity_reminder',
      reminderSubject: config.reminderSubject || 'Reminder: Get back to problem solving!',
      inactivityThresholdDays: config.inactivityThresholdDays || 7,
      reminderFrequencyDays: config.reminderFrequencyDays || 3
    };
    
    logger.info(`Starting email reminder job with threshold of ${reminderConfig.inactivityThresholdDays} days`);
    
    // Get all inactive students
    const inactiveStudents = await getInactiveStudents(reminderConfig.inactivityThresholdDays);
    logger.info(`Found ${inactiveStudents.length} inactive students`);
    
    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each inactive student
    for (const student of inactiveStudents) {
      try {
        // Skip if reminders are disabled for this student
        if (!student.emailReminders.enabled) {
          logger.debug(`Skipping reminder for ${student.name}: reminders disabled`);
          skippedCount++;
          continue;
        }
        
        // Check if we've already sent a reminder recently
        const recentReminderSent = await hasRecentReminder(
          student._id, 
          reminderConfig.reminderFrequencyDays
        );
        
        if (recentReminderSent) {
          logger.debug(`Skipping reminder for ${student.name}: recent reminder already sent`);
          skippedCount++;
          continue;
        }
        
        // Calculate days since student became inactive
        const daysSinceInactive = student.inactivityStatus.inactiveSince ? 
          Math.floor((new Date() - new Date(student.inactivityStatus.inactiveSince)) / (1000 * 60 * 60 * 24)) :
          reminderConfig.inactivityThresholdDays;
        
        // Send the reminder email
        const result = await emailService.sendInactivityReminder(
          student,
          daysSinceInactive,
          {
            template: reminderConfig.reminderTemplate,
            subject: reminderConfig.reminderSubject
          }
        );
        
        if (result.success) {
          logger.info(`Sent reminder to ${student.name} (${student.email})`);
          sentCount++;
        } else if (result.skipped) {
          logger.debug(`Reminder skipped for ${student.name}: ${result.reason}`);
          skippedCount++;
        } else {
          logger.error(`Failed to send reminder to ${student.name}: ${result.error}`);
          errorCount++;
        }
      } catch (error) {
        logger.error(`Error processing reminder for student ${student._id}:`, error);
        errorCount++;
      }
    }
    
    const duration = Date.now() - startTime;
    
    logger.info(`Email reminder job completed in ${duration}ms. Results: ${sentCount} sent, ${skippedCount} skipped, ${errorCount} errors`);
    
    return {
      totalCount: inactiveStudents.length,
      sentCount,
      skippedCount,
      errorCount,
      duration
    };
  } catch (error) {
    logger.error('Error in sendInactivityReminders:', error);
    throw error;
  }
};

/**
 * Check if a student has received a reminder email recently
 * @param {string} studentId - Student ID
 * @param {number} days - Number of days to check
 * @returns {Promise<boolean>} True if a reminder was sent recently
 */
async function hasRecentReminder(studentId, days = 3) {
  try {
    const cutoffDate = subDays(new Date(), days);
    
    const recentReminder = await EmailLog.findOne({
      student: studentId,
      emailType: 'inactivityReminder',
      sentAt: { $gte: cutoffDate }
    });
    
    return !!recentReminder;
  } catch (error) {
    logger.error(`Error checking recent reminders for student ${studentId}:`, error);
    return false; // Default to false to allow sending if there's an error
  }
}

/**
 * Get email reminder statistics
 * @returns {Promise<Object>} Statistics
 */
exports.getReminderStatistics = async () => {
  try {
    // Get total reminders sent
    const totalReminders = await EmailLog.countDocuments({
      emailType: 'inactivityReminder'
    });
    
    // Get reminders sent in the last 30 days
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentReminders = await EmailLog.countDocuments({
      emailType: 'inactivityReminder',
      sentAt: { $gte: thirtyDaysAgo }
    });
    
    // Get students who have received reminders
    const studentsWithReminders = await EmailLog.distinct('student', {
      emailType: 'inactivityReminder'
    });
    
    // Get students who have opted out
    const optedOutStudents = await Student.countDocuments({
      'emailReminders.enabled': false
    });
    
    // Get daily reminder counts for the last 30 days
    const dailyCounts = await EmailLog.aggregate([
      {
        $match: {
          emailType: 'inactivityReminder',
          sentAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$sentAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    return {
      totalReminders,
      recentReminders,
      uniqueStudentsReminded: studentsWithReminders.length,
      optedOutStudents,
      dailyCounts
    };
  } catch (error) {
    logger.error('Error getting reminder statistics:', error);
    throw error;
  }
};

/**
 * Send a test reminder email to a specific student
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Send result
 */
exports.sendTestReminder = async (studentId) => {
  try {
    const student = await Student.findById(studentId);
    
    if (!student) {
      throw new Error(`Student not found with ID: ${studentId}`);
    }
    
    // Send a test reminder
    const result = await emailService.sendInactivityReminder(
      student,
      7, // Mock 7 days of inactivity
      {
        template: 'inactivity_reminder',
        subject: '[TEST] Reminder: Get back to problem solving!'
      }
    );
    
    if (result.success) {
      logger.info(`Sent test reminder to ${student.name} (${student.email})`);
      return {
        success: true,
        message: `Test reminder sent to ${student.email}`,
        student: {
          id: student._id,
          name: student.name,
          email: student.email
        }
      };
    } else {
      logger.error(`Failed to send test reminder to ${student.name}: ${result.error || result.reason}`);
      return {
        success: false,
        message: `Failed to send test reminder: ${result.error || result.reason}`,
        student: {
          id: student._id,
          name: student.name,
          email: student.email
        }
      };
    }
  } catch (error) {
    logger.error(`Error sending test reminder to student ${studentId}:`, error);
    throw error;
  }
};
