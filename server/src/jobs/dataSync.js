const cron = require('node-cron');
const logger = require('../utils/logger');
const Student = require('../models/Student');
const CronJob = require('../models/CronJob');
const { syncStudentCodeforcesData } = require('../services/codeforcesService');

// Store active cron jobs
const activeCronJobs = new Map();

/**
 * Setup all cron jobs from database
 * @returns {Promise<void>}
 */
exports.setupCronJobs = async () => {
  try {
    logger.info('Setting up cron jobs...');
    
    // Initialize default jobs if they don't exist
    await CronJob.initializeDefaultJobs();
    
    // Get all enabled cron jobs
    const cronJobs = await CronJob.find({ enabled: true });
    
    // Stop any existing cron jobs
    this.stopAllCronJobs();
    
    // Schedule each job
    for (const job of cronJobs) {
      await this.scheduleCronJob(job);
    }
    
    logger.info(`Successfully set up ${cronJobs.length} cron jobs`);
  } catch (error) {
    logger.error('Error setting up cron jobs:', error);
  }
};

/**
 * Schedule a single cron job
 * @param {Object} job - CronJob document
 * @returns {Promise<void>}
 */
exports.scheduleCronJob = async (job) => {
  try {
    // Stop existing job if it exists
    if (activeCronJobs.has(job.name)) {
      activeCronJobs.get(job.name).stop();
      activeCronJobs.delete(job.name);
    }
    
    // Skip if job is disabled
    if (!job.enabled) {
      logger.info(`Skipping disabled cron job: ${job.name}`);
      return;
    }
    
    // Create the cron job based on job type
    let task;
    switch (job.name) {
      case 'codeforcesSync':
        task = async () => {
          logger.info(`Running scheduled Codeforces sync job at ${new Date().toISOString()}`);
          const startTime = Date.now();
          
          try {
            const result = await syncCodeforcesData(job.config.batchSize);
            const duration = Date.now() - startTime;
            
            // Update job status
            await job.updateAfterRun(
              true,
              `Synced data for ${result.processedCount} students (${result.successCount} succeeded, ${result.failedCount} failed)`,
              null,
              result.processedCount,
              duration
            );
            
            logger.info(`Codeforces sync completed in ${duration}ms`);
          } catch (error) {
            const duration = Date.now() - startTime;
            await job.updateAfterRun(false, null, error.message, 0, duration);
            logger.error('Error in Codeforces sync cron job:', error);
          }
        };
        break;
        
      case 'inactivityCheck':
        // This will be implemented in inactivityCheck.js
        task = () => logger.info(`Inactivity check would run here (${job.name})`);
        break;
        
      case 'emailReminder':
        // This will be implemented in emailReminder.js
        task = () => logger.info(`Email reminder would run here (${job.name})`);
        break;
        
      default:
        logger.warn(`Unknown cron job type: ${job.name}`);
        return;
    }
    
    // Schedule the cron job
    const cronTask = cron.schedule(job.schedule, task, {
      scheduled: true,
      timezone: job.timezone
    });
    
    // Store the active job
    activeCronJobs.set(job.name, cronTask);
    
    // Calculate next run time
    const nextRunDate = getNextCronRunDate(job.schedule, job.timezone);
    
    // Update next run time in database
    job.nextRunAt = nextRunDate;
    await job.save();
    
    logger.info(`Scheduled cron job ${job.name} with schedule "${job.schedule}" (next run: ${nextRunDate.toISOString()})`);
  } catch (error) {
    logger.error(`Error scheduling cron job ${job.name}:`, error);
  }
};

/**
 * Stop all active cron jobs
 */
exports.stopAllCronJobs = () => {
  try {
    let count = 0;
    activeCronJobs.forEach((job, name) => {
      job.stop();
      activeCronJobs.delete(name);
      count++;
    });
    
    if (count > 0) {
      logger.info(`Stopped ${count} active cron jobs`);
    }
  } catch (error) {
    logger.error('Error stopping cron jobs:', error);
  }
};

/**
 * Sync Codeforces data for all students
 * @param {number} batchSize - Number of students to process in each batch
 * @returns {Promise<Object>} Result with counts
 */
async function syncCodeforcesData(batchSize = 50) {
  try {
    logger.info(`Starting Codeforces data sync with batch size ${batchSize}`);
    
    // Get all students
    const students = await Student.find().select('_id codeforcesHandle');
    const totalCount = students.length;
    
    if (totalCount === 0) {
      logger.info('No students found to sync');
      return { processedCount: 0, successCount: 0, failedCount: 0 };
    }
    
    logger.info(`Found ${totalCount} students to sync`);
    
    // Process students in batches to avoid overloading the Codeforces API
    const batchCount = Math.ceil(totalCount / batchSize);
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;
    
    for (let i = 0; i < batchCount; i++) {
      const startIdx = i * batchSize;
      const endIdx = Math.min((i + 1) * batchSize, totalCount);
      const batch = students.slice(startIdx, endIdx);
      
      logger.info(`Processing batch ${i + 1}/${batchCount} (${batch.length} students)`);
      
      // Process each student in the batch with Promise.allSettled to handle errors
      const results = await Promise.allSettled(
        batch.map(student => 
          syncStudentCodeforcesData(student._id, student.codeforcesHandle)
        )
      );
      
      // Count successes and failures
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          failedCount++;
          logger.error('Error syncing student data:', result.reason);
        }
      });
      
      processedCount += batch.length;
      logger.info(`Batch ${i + 1} complete. Progress: ${processedCount}/${totalCount}`);
      
      // Add a delay between batches to avoid rate limiting
      if (i < batchCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    logger.info(`Codeforces sync completed: ${successCount} succeeded, ${failedCount} failed`);
    
    return { processedCount, successCount, failedCount };
  } catch (error) {
    logger.error('Error in syncCodeforcesData:', error);
    throw error;
  }
}

/**
 * Get the next run date for a cron expression
 * @param {string} expression - Cron expression
 * @param {string} timezone - Timezone
 * @returns {Date} Next run date
 */
function getNextCronRunDate(expression, timezone = 'UTC') {
  try {
    // This is a simple implementation that doesn't account for all cron features
    // In a production app, you'd use a library like cron-parser
    const now = new Date();
    
    // Parse the expression (simple implementation)
    const parts = expression.split(' ');
    const minute = parseInt(parts[0], 10);
    const hour = parseInt(parts[1], 10);
    
    // Create a date for today with the specified hour and minute
    const date = new Date(now);
    date.setHours(hour, minute, 0, 0);
    
    // If the date is in the past, add a day
    if (date <= now) {
      date.setDate(date.getDate() + 1);
    }
    
    return date;
  } catch (error) {
    logger.error('Error calculating next run date:', error);
    return new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 24 hours from now
  }
}

/**
 * Manually trigger Codeforces data sync for all students
 * @param {number} batchSize - Number of students to process in each batch
 * @returns {Promise<Object>} Result with counts
 */
exports.manualSyncCodeforcesData = async (batchSize = 50) => {
  try {
    logger.info('Manually triggering Codeforces data sync');
    return await syncCodeforcesData(batchSize);
  } catch (error) {
    logger.error('Error in manual Codeforces sync:', error);
    throw error;
  }
};

/**
 * Manually trigger Codeforces data sync for a specific student
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Result
 */
exports.manualSyncStudentData = async (studentId) => {
  try {
    logger.info(`Manually syncing data for student ${studentId}`);
    
    const student = await Student.findById(studentId);
    
    if (!student) {
      throw new Error(`Student not found with ID: ${studentId}`);
    }
    
    const result = await syncStudentCodeforcesData(studentId, student.codeforcesHandle);
    
    return {
      success: true,
      message: `Successfully synced data for ${student.name} (${student.codeforcesHandle})`,
      data: result
    };
  } catch (error) {
    logger.error(`Error syncing data for student ${studentId}:`, error);
    throw error;
  }
};
