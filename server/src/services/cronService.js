/**
 * Cron Service
 * Manages cron job scheduling, execution, and status tracking
 */

const cron = require('node-cron');
const logger = require('../utils/logger');
const CronJob = require('../models/CronJob');
const { isValidCronExpression, getNextRunTime } = require('../config/cron');

// Store active cron jobs
const activeCronJobs = new Map();

/**
 * Initialize cron jobs from database
 * @returns {Promise<void>}
 */
exports.initializeCronJobs = async () => {
  try {
    logger.info('Initializing cron jobs from database');
    
    // Ensure default jobs exist in database
    await CronJob.initializeDefaultJobs();
    
    // Get all enabled jobs
    const cronJobs = await CronJob.find({ enabled: true });
    
    if (cronJobs.length === 0) {
      logger.warn('No enabled cron jobs found in database');
      return;
    }
    
    // Stop any existing jobs first
    this.stopAllJobs();
    
    // Schedule each job
    for (const job of cronJobs) {
      await this.scheduleJob(job);
    }
    
    logger.info(`Successfully initialized ${cronJobs.length} cron jobs`);
  } catch (error) {
    logger.error('Error initializing cron jobs:', error);
    throw error;
  }
};

/**
 * Schedule a single cron job
 * @param {Object} job - CronJob document from database
 * @returns {Promise<boolean>} Success status
 */
exports.scheduleJob = async (job) => {
  try {
    // Skip if job is disabled
    if (!job.enabled) {
      logger.info(`Skipping disabled job: ${job.name}`);
      return false;
    }
    
    // Validate cron expression
    if (!isValidCronExpression(job.schedule)) {
      logger.error(`Invalid cron expression for job ${job.name}: ${job.schedule}`);
      return false;
    }
    
    // Stop existing job if it's already running
    if (activeCronJobs.has(job.name)) {
      logger.debug(`Stopping existing job before rescheduling: ${job.name}`);
      this.stopJob(job.name);
    }
    
    // Get the appropriate job handler based on job name
    const jobHandler = getJobHandler(job.name);
    
    if (!jobHandler) {
      logger.error(`No handler found for job: ${job.name}`);
      return false;
    }
    
    // Create the task function that will be executed
    const task = async () => {
      const startTime = Date.now();
      logger.info(`Running scheduled job: ${job.name}`);
      
      try {
        // Execute the job handler with job config
        const result = await jobHandler(job.config);
        const duration = Date.now() - startTime;
        
        // Update job execution history
        await job.updateAfterRun(
          true,
          result.message || `Job completed successfully in ${duration}ms`,
          null,
          result.processedCount || 0,
          duration
        );
        
        logger.info(`Job ${job.name} completed in ${duration}ms`);
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`Error executing job ${job.name}:`, error);
        
        // Update job execution history with error
        await job.updateAfterRun(
          false,
          null,
          error.message,
          0,
          duration
        );
      }
    };
    
    // Schedule the cron job
    const cronTask = cron.schedule(job.schedule, task, {
      scheduled: true,
      timezone: job.timezone || 'UTC'
    });
    
    // Store the active job
    activeCronJobs.set(job.name, cronTask);
    
    // Calculate and update next run time
    const nextRunTime = getNextRunTime(job.schedule, job.timezone);
    job.nextRunAt = nextRunTime;
    await job.save();
    
    logger.info(`Scheduled job ${job.name} with schedule "${job.schedule}" (next run: ${nextRunTime.toISOString()})`);
    return true;
  } catch (error) {
    logger.error(`Error scheduling job ${job.name}:`, error);
    return false;
  }
};

/**
 * Stop a running cron job
 * @param {string} jobName - Name of the job to stop
 * @returns {boolean} Success status
 */
exports.stopJob = (jobName) => {
  try {
    const job = activeCronJobs.get(jobName);
    
    if (!job) {
      logger.warn(`No active job found with name: ${jobName}`);
      return false;
    }
    
    job.stop();
    activeCronJobs.delete(jobName);
    logger.info(`Stopped job: ${jobName}`);
    return true;
  } catch (error) {
    logger.error(`Error stopping job ${jobName}:`, error);
    return false;
  }
};

/**
 * Stop all running cron jobs
 * @returns {number} Number of jobs stopped
 */
exports.stopAllJobs = () => {
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
    
    return count;
  } catch (error) {
    logger.error('Error stopping all cron jobs:', error);
    return 0;
  }
};

/**
 * Update a cron job's configuration and reschedule if needed
 * @param {string} jobName - Name of the job to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated job document
 */
exports.updateJob = async (jobName, updates) => {
  try {
    // Find the job in database
    const job = await CronJob.findOne({ name: jobName });
    
    if (!job) {
      throw new Error(`Job not found: ${jobName}`);
    }
    
    // Update fields if provided
    if (updates.schedule) job.schedule = updates.schedule;
    if (updates.enabled !== undefined) job.enabled = updates.enabled;
    if (updates.timezone) job.timezone = updates.timezone;
    
    // Update config if provided
    if (updates.config) {
      Object.assign(job.config, updates.config);
    }
    
    // Save updated job
    await job.save();
    
    // Reschedule the job if it's enabled
    if (job.enabled) {
      await this.scheduleJob(job);
    } else {
      // Stop the job if it's disabled
      this.stopJob(jobName);
    }
    
    return job;
  } catch (error) {
    logger.error(`Error updating job ${jobName}:`, error);
    throw error;
  }
};

/**
 * Manually trigger a cron job
 * @param {string} jobName - Name of the job to trigger
 * @returns {Promise<Object>} Execution result
 */
exports.triggerJob = async (jobName) => {
  try {
    // Find the job in database
    const job = await CronJob.findOne({ name: jobName });
    
    if (!job) {
      throw new Error(`Job not found: ${jobName}`);
    }
    
    // Get the job handler
    const jobHandler = getJobHandler(jobName);
    
    if (!jobHandler) {
      throw new Error(`No handler found for job: ${jobName}`);
    }
    
    // Execute the job
    const startTime = Date.now();
    logger.info(`Manually triggering job: ${jobName}`);
    
    try {
      // Run the job handler
      const result = await jobHandler(job.config);
      const duration = Date.now() - startTime;
      
      // Update job execution history
      await job.updateAfterRun(
        true,
        result.message || `Job completed successfully in ${duration}ms`,
        null,
        result.processedCount || 0,
        duration
      );
      
      logger.info(`Manual job ${jobName} completed in ${duration}ms`);
      
      return {
        success: true,
        message: result.message || `Job completed successfully in ${duration}ms`,
        processedCount: result.processedCount || 0,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Error executing job ${jobName}:`, error);
      
      // Update job execution history with error
      await job.updateAfterRun(
        false,
        null,
        error.message,
        0,
        duration
      );
      
      throw error;
    }
  } catch (error) {
    logger.error(`Error triggering job ${jobName}:`, error);
    throw error;
  }
};

/**
 * Get the status of all cron jobs
 * @returns {Promise<Array>} Array of job status objects
 */
exports.getAllJobStatus = async () => {
  try {
    const jobs = await CronJob.find().sort({ name: 1 });
    
    return jobs.map(job => ({
      name: job.name,
      schedule: job.schedule,
      enabled: job.enabled,
      timezone: job.timezone,
      isActive: activeCronJobs.has(job.name),
      lastRunAt: job.lastRunAt,
      nextRunAt: job.nextRunAt,
      lastStatus: job.lastStatus,
      config: job.config
    }));
  } catch (error) {
    logger.error('Error getting cron job status:', error);
    throw error;
  }
};

/**
 * Reset all cron jobs to default configuration
 * @returns {Promise<Array>} Array of reset job documents
 */
exports.resetAllJobs = async () => {
  try {
    // Stop all running jobs
    this.stopAllJobs();
    
    // Delete all existing jobs
    await CronJob.deleteMany({});
    
    // Initialize default jobs
    await CronJob.initializeDefaultJobs();
    
    // Get the newly created jobs
    const jobs = await CronJob.find().sort({ name: 1 });
    
    // Schedule enabled jobs
    for (const job of jobs) {
      if (job.enabled) {
        await this.scheduleJob(job);
      }
    }
    
    logger.info(`Reset ${jobs.length} cron jobs to default settings`);
    return jobs;
  } catch (error) {
    logger.error('Error resetting cron jobs:', error);
    throw error;
  }
};

/**
 * Get job handler function based on job name
 * @param {string} jobName - Name of the job
 * @returns {Function|null} Job handler function or null if not found
 */
function getJobHandler(jobName) {
  try {
    switch (jobName) {
      case 'codeforcesSync':
        // Dynamically import to avoid circular dependencies
        const { manualSyncCodeforcesData } = require('../jobs/dataSync');
        return manualSyncCodeforcesData;
        
      case 'inactivityCheck':
        const { checkStudentInactivity } = require('../jobs/inactivityCheck');
        return checkStudentInactivity;
        
      case 'emailReminder':
        const { sendInactivityReminders } = require('../jobs/emailReminder');
        return sendInactivityReminders;
        
      default:
        logger.warn(`No handler defined for job: ${jobName}`);
        return null;
    }
  } catch (error) {
    logger.error(`Error getting job handler for ${jobName}:`, error);
    return null;
  }
}

/**
 * Check if a job is currently active
 * @param {string} jobName - Name of the job
 * @returns {boolean} True if the job is active
 */
exports.isJobActive = (jobName) => {
  return activeCronJobs.has(jobName);
};

/**
 * Get the number of active cron jobs
 * @returns {number} Number of active jobs
 */
exports.getActiveJobCount = () => {
  return activeCronJobs.size;
};
