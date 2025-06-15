const CronJob = require('../models/CronJob');
const Student = require('../models/Student');
const logger = require('../utils/logger');
const { setupCronJobs, scheduleCronJob } = require('../jobs/dataSync');
const { checkStudentInactivity } = require('../jobs/inactivityCheck');
const { sendInactivityReminders } = require('../jobs/emailReminder');

/**
 * Cron Controller
 * Handles all cron job related operations including configuration and manual triggering
 */

// Get all cron jobs
exports.getCronJobs = async (req, res, next) => {
  try {
    const cronJobs = await CronJob.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: cronJobs.length,
      data: cronJobs
    });
  } catch (error) {
    logger.error('Error fetching cron jobs:', error);
    next(error);
  }
};

// Get a single cron job by name
exports.getCronJob = async (req, res, next) => {
  try {
    const cronJob = await CronJob.findOne({ name: req.params.name });
    
    if (!cronJob) {
      return res.status(404).json({
        success: false,
        message: 'Cron job not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: cronJob
    });
  } catch (error) {
    logger.error(`Error fetching cron job ${req.params.name}:`, error);
    next(error);
  }
};

// Update cron job schedule
exports.updateCronJob = async (req, res, next) => {
  try {
    const { schedule, enabled, timezone, config } = req.body;
    const jobName = req.params.name;
    
    // Validate cron schedule expression
    if (schedule && !isValidCronExpression(schedule)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cron schedule expression'
      });
    }
    
    // Find the cron job
    let cronJob = await CronJob.findOne({ name: jobName });
    
    if (!cronJob) {
      return res.status(404).json({
        success: false,
        message: 'Cron job not found'
      });
    }
    
    // Update fields if provided
    if (schedule) cronJob.schedule = schedule;
    if (enabled !== undefined) cronJob.enabled = enabled;
    if (timezone) cronJob.timezone = timezone;
    
    // Update config if provided
    if (config) {
      if (config.batchSize) cronJob.config.batchSize = config.batchSize;
      if (config.inactivityThresholdDays) cronJob.config.inactivityThresholdDays = config.inactivityThresholdDays;
      if (config.reminderTemplate) cronJob.config.reminderTemplate = config.reminderTemplate;
      if (config.reminderSubject) cronJob.config.reminderSubject = config.reminderSubject;
    }
    
    // Save updated job
    await cronJob.save();
    
    // Re-schedule the cron job with new settings
    await scheduleCronJob(cronJob);
    
    res.status(200).json({
      success: true,
      message: `Cron job ${jobName} updated successfully`,
      data: cronJob
    });
  } catch (error) {
    logger.error(`Error updating cron job ${req.params.name}:`, error);
    next(error);
  }
};

// Manually trigger a cron job
exports.triggerCronJob = async (req, res, next) => {
  try {
    const jobName = req.params.name;
    
    // Find the cron job
    const cronJob = await CronJob.findOne({ name: jobName });
    
    if (!cronJob) {
      return res.status(404).json({
        success: false,
        message: 'Cron job not found'
      });
    }
    
    // Start job execution based on job name
    const startTime = Date.now();
    let result = { success: false, message: 'Unknown job type' };
    
    switch (jobName) {
      case 'codeforcesSync':
        // Get students to process
        const students = await Student.find().select('_id codeforcesHandle');
        result = await runCodeforcesSync(students, cronJob.config.batchSize);
        break;
        
      case 'inactivityCheck':
        result = await runInactivityCheck(cronJob.config.inactivityThresholdDays);
        break;
        
      case 'emailReminder':
        result = await runEmailReminder(cronJob.config);
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: `Unknown job type: ${jobName}`
        });
    }
    
    // Calculate duration
    const duration = Date.now() - startTime;
    
    // Update job history
    await cronJob.updateAfterRun(
      result.success,
      result.message,
      result.error,
      result.processedCount,
      duration
    );
    
    res.status(200).json({
      success: true,
      message: `Cron job ${jobName} triggered successfully`,
      result: {
        ...result,
        duration: `${duration}ms`
      }
    });
  } catch (error) {
    logger.error(`Error triggering cron job ${req.params.name}:`, error);
    next(error);
  }
};

// Reset all cron jobs to default settings
exports.resetCronJobs = async (req, res, next) => {
  try {
    // Delete all existing cron jobs
    await CronJob.deleteMany({});
    
    // Initialize default jobs
    await CronJob.initializeDefaultJobs();
    
    // Re-setup all cron jobs
    await setupCronJobs();
    
    // Get the newly created jobs
    const cronJobs = await CronJob.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      message: 'All cron jobs reset to default settings',
      data: cronJobs
    });
  } catch (error) {
    logger.error('Error resetting cron jobs:', error);
    next(error);
  }
};

// Get cron job execution history
exports.getCronJobHistory = async (req, res, next) => {
  try {
    const cronJob = await CronJob.findOne({ name: req.params.name });
    
    if (!cronJob) {
      return res.status(404).json({
        success: false,
        message: 'Cron job not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        name: cronJob.name,
        lastRunAt: cronJob.lastRunAt,
        nextRunAt: cronJob.nextRunAt,
        lastStatus: cronJob.lastStatus,
        history: cronJob.history
      }
    });
  } catch (error) {
    logger.error(`Error fetching cron job history for ${req.params.name}:`, error);
    next(error);
  }
};

// Helper functions

// Run Codeforces data sync job
async function runCodeforcesSync(students, batchSize) {
  try {
    logger.info(`Starting manual Codeforces sync for ${students.length} students`);
    
    // Import the service dynamically to avoid circular dependencies
    const codeforcesService = require('../services/codeforcesService');
    
    // Process students in batches
    const batchCount = Math.ceil(students.length / batchSize);
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;
    
    for (let i = 0; i < batchCount; i++) {
      const batch = students.slice(i * batchSize, (i + 1) * batchSize);
      
      // Process each student in the batch
      const results = await Promise.allSettled(
        batch.map(student => 
          codeforcesService.syncStudentCodeforcesData(student._id, student.codeforcesHandle)
        )
      );
      
      // Count successes and failures
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          failedCount++;
          logger.error('Sync error:', result.reason);
        }
      });
      
      processedCount += batch.length;
      logger.info(`Processed ${processedCount}/${students.length} students`);
    }
    
    return {
      success: true,
      message: `Codeforces sync completed: ${successCount} succeeded, ${failedCount} failed`,
      processedCount,
      successCount,
      failedCount
    };
  } catch (error) {
    logger.error('Error in manual Codeforces sync:', error);
    return {
      success: false,
      message: 'Codeforces sync failed',
      error: error.message,
      processedCount: 0
    };
  }
}

// Run inactivity check job
async function runInactivityCheck(thresholdDays) {
  try {
    logger.info(`Starting manual inactivity check with threshold of ${thresholdDays} days`);
    
    const result = await checkStudentInactivity(thresholdDays);
    
    return {
      success: true,
      message: `Inactivity check completed: ${result.inactiveCount} inactive students found`,
      processedCount: result.totalCount,
      inactiveCount: result.inactiveCount
    };
  } catch (error) {
    logger.error('Error in manual inactivity check:', error);
    return {
      success: false,
      message: 'Inactivity check failed',
      error: error.message,
      processedCount: 0
    };
  }
}

// Run email reminder job
async function runEmailReminder(config) {
  try {
    logger.info('Starting manual email reminder job');
    
    const result = await sendInactivityReminders(config);
    
    return {
      success: true,
      message: `Email reminders sent: ${result.sentCount} emails sent`,
      processedCount: result.totalCount,
      sentCount: result.sentCount,
      skippedCount: result.skippedCount
    };
  } catch (error) {
    logger.error('Error in manual email reminder job:', error);
    return {
      success: false,
      message: 'Email reminder job failed',
      error: error.message,
      processedCount: 0
    };
  }
}

// Validate cron expression
function isValidCronExpression(expression) {
  try {
    // Simple validation - more comprehensive validation would use a cron parser library
    const parts = expression.split(' ');
    return parts.length >= 5 && parts.length <= 6;
  } catch (error) {
    return false;
  }
}
