const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * CronJob Schema
 * Stores configuration for scheduled cron jobs in the system
 */
const CronJobSchema = new Schema({
  // Job identifier
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['codeforcesSync', 'inactivityCheck', 'emailReminder'],
    trim: true
  },
  // Cron schedule expression (e.g. "0 2 * * *" for 2 AM daily)
  schedule: {
    type: String,
    required: true,
    trim: true,
    default: '0 2 * * *' // Default: 2 AM daily
  },
  // Job status
  enabled: {
    type: Boolean,
    default: true
  },
  // Timezone for the cron job
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
    trim: true
  },
  // Job specific configuration
  config: {
    // For codeforcesSync
    batchSize: {
      type: Number,
      default: 50 // Process 50 students per batch
    },
    // For inactivityCheck
    inactivityThresholdDays: {
      type: Number,
      default: 7 // Check for 7 days of inactivity
    },
    // For emailReminder
    reminderTemplate: {
      type: String,
      default: 'default'
    },
    reminderSubject: {
      type: String,
      default: 'Reminder: Get back to problem solving!'
    }
  },
  // Execution tracking
  lastRunAt: {
    type: Date,
    default: null
  },
  nextRunAt: {
    type: Date,
    default: null
  },
  lastStatus: {
    success: {
      type: Boolean,
      default: null
    },
    message: {
      type: String,
      default: null
    },
    error: {
      type: String,
      default: null
    },
    processedCount: {
      type: Number,
      default: 0
    }
  },
  // Run history (limited to last 10 runs)
  history: [{
    runAt: {
      type: Date,
      required: true
    },
    success: {
      type: Boolean,
      required: true
    },
    message: String,
    error: String,
    processedCount: Number,
    duration: Number // in milliseconds
  }]
}, {
  timestamps: true
});

// Limit history array to 10 items
CronJobSchema.pre('save', function(next) {
  if (this.history && this.history.length > 10) {
    this.history = this.history.slice(-10); // Keep only the latest 10 entries
  }
  next();
});

// Method to update job status after execution
CronJobSchema.methods.updateAfterRun = async function(success, message, error, processedCount, duration) {
  const now = new Date();
  
  // Update last run info
  this.lastRunAt = now;
  this.lastStatus = {
    success,
    message: message || null,
    error: error || null,
    processedCount: processedCount || 0
  };
  
  // Calculate next run time based on schedule
  // Note: In a production app, you'd use a library like node-cron or cron-parser
  // to calculate the next run time more accurately
  
  // Add to history
  this.history.push({
    runAt: now,
    success,
    message: message || null,
    error: error ? (error.message || String(error)) : null,
    processedCount: processedCount || 0,
    duration: duration || 0
  });
  
  return this.save();
};

// Static method to get a job by name
CronJobSchema.statics.getJobByName = function(name) {
  return this.findOne({ name });
};

// Static method to initialize default jobs if they don't exist
CronJobSchema.statics.initializeDefaultJobs = async function() {
  const defaultJobs = [
    {
      name: 'codeforcesSync',
      schedule: '0 2 * * *', // 2 AM daily
      enabled: true,
      config: {
        batchSize: 50
      }
    },
    {
      name: 'inactivityCheck',
      schedule: '0 3 * * *', // 3 AM daily
      enabled: true,
      config: {
        inactivityThresholdDays: 7
      }
    },
    {
      name: 'emailReminder',
      schedule: '0 10 * * *', // 10 AM daily
      enabled: true,
      config: {
        reminderTemplate: 'default',
        reminderSubject: 'Reminder: Get back to problem solving!'
      }
    }
  ];
  
  for (const job of defaultJobs) {
    await this.findOneAndUpdate(
      { name: job.name },
      { $setOnInsert: job },
      { upsert: true, new: true }
    );
  }
};

const CronJob = mongoose.model('CronJob', CronJobSchema);

module.exports = CronJob;
