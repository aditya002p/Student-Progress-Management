const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Contest Schema
 * Stores detailed information about Codeforces contests
 */
const ContestSchema = new Schema({
  // Codeforces contest ID
  contestId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  // Contest name
  name: {
    type: String,
    required: true,
    trim: true
  },
  // Contest type (e.g., Div. 1, Div. 2, Educational, etc.)
  type: {
    type: String,
    trim: true
  },
  // Contest phase (BEFORE, CODING, PENDING_SYSTEM_TEST, SYSTEM_TEST, FINISHED)
  phase: {
    type: String,
    enum: ['BEFORE', 'CODING', 'PENDING_SYSTEM_TEST', 'SYSTEM_TEST', 'FINISHED'],
    default: 'FINISHED'
  },
  // Whether the contest is frozen
  frozen: {
    type: Boolean,
    default: false
  },
  // Duration of the contest in seconds
  durationSeconds: {
    type: Number
  },
  // Start time of the contest
  startTimeSeconds: {
    type: Number
  },
  // Start time as a Date object for easier querying
  startTime: {
    type: Date
  },
  // End time as a Date object
  endTime: {
    type: Date
  },
  // Contest description or details
  description: {
    type: String
  },
  // Difficulty level (if applicable)
  difficulty: {
    type: Number
  },
  // Contest URL
  url: {
    type: String
  },
  // Contest problems
  problems: [{
    index: String,
    name: String,
    type: String,
    points: Number,
    rating: Number,
    tags: [String]
  }],
  // Number of registered participants
  participantsCount: {
    type: Number,
    default: 0
  },
  // Metadata and additional information
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  // When the contest data was last updated
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
ContestSchema.index({ contestId: 1 });
ContestSchema.index({ startTime: -1 });
ContestSchema.index({ phase: 1, startTime: -1 });

// Virtual for contest status
ContestSchema.virtual('status').get(function() {
  const now = Date.now() / 1000; // Current time in seconds
  
  if (!this.startTimeSeconds) {
    return 'unknown';
  }
  
  if (this.startTimeSeconds > now) {
    return 'upcoming';
  }
  
  if (this.startTimeSeconds + this.durationSeconds > now) {
    return 'ongoing';
  }
  
  return 'completed';
});

// Method to check if a contest has started
ContestSchema.methods.hasStarted = function() {
  const now = Date.now() / 1000;
  return this.startTimeSeconds <= now;
};

// Method to check if a contest has ended
ContestSchema.methods.hasEnded = function() {
  const now = Date.now() / 1000;
  return this.startTimeSeconds + this.durationSeconds <= now;
};

// Method to get contest duration in hours
ContestSchema.methods.getDurationHours = function() {
  return this.durationSeconds / 3600;
};

// Pre-save hook to set Date objects from timestamp seconds
ContestSchema.pre('save', function(next) {
  if (this.startTimeSeconds) {
    this.startTime = new Date(this.startTimeSeconds * 1000);
    
    if (this.durationSeconds) {
      this.endTime = new Date((this.startTimeSeconds + this.durationSeconds) * 1000);
    }
  }
  next();
});

// Static method to find upcoming contests
ContestSchema.statics.findUpcoming = function() {
  const now = Math.floor(Date.now() / 1000);
  return this.find({
    startTimeSeconds: { $gt: now }
  }).sort({ startTimeSeconds: 1 });
};

// Static method to find ongoing contests
ContestSchema.statics.findOngoing = function() {
  const now = Math.floor(Date.now() / 1000);
  return this.find({
    startTimeSeconds: { $lte: now },
    $expr: { $gt: [{ $add: ['$startTimeSeconds', '$durationSeconds'] }, now] }
  });
};

// Static method to find recent contests
ContestSchema.statics.findRecent = function(limit = 10) {
  const now = Math.floor(Date.now() / 1000);
  return this.find({
    $expr: { $lte: [{ $add: ['$startTimeSeconds', '$durationSeconds'] }, now] }
  })
  .sort({ startTimeSeconds: -1 })
  .limit(limit);
};

const Contest = mongoose.model('Contest', ContestSchema);

module.exports = Contest;
