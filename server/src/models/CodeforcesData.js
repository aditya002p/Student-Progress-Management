const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * CodeforcesData Schema
 * Stores Codeforces contest history and submission data for each student
 */
const CodeforcesDataSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  handle: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  // Contest history data
  contests: [{
    contestId: {
      type: Number,
      required: true
    },
    contestName: {
      type: String,
      required: true
    },
    rank: {
      type: Number
    },
    oldRating: {
      type: Number
    },
    newRating: {
      type: Number
    },
    ratingChange: {
      type: Number
    },
    date: {
      type: Date,
      required: true
    },
    // Problems from contest that are still unsolved by the user
    unsolvedProblems: {
      type: Number,
      default: 0
    }
  }],
  // Submission data
  submissions: [{
    submissionId: {
      type: Number,
      required: true
    },
    problemId: {
      type: String,
      required: true
    },
    problemName: {
      type: String,
      required: true
    },
    contestId: {
      type: Number
    },
    problemRating: {
      type: Number
    },
    verdict: {
      type: String,
      required: true
    },
    language: {
      type: String
    },
    submissionTime: {
      type: Date,
      required: true
    },
    tags: [{
      type: String
    }]
  }],
  // Aggregated statistics
  statistics: {
    totalSolved: {
      type: Number,
      default: 0
    },
    solvedByRating: {
      // Store count of problems solved by rating range
      // e.g., "800-1000": 5, "1000-1200": 3, etc.
      type: Map,
      of: Number,
      default: new Map()
    },
    mostDifficultProblem: {
      problemId: String,
      problemName: String,
      rating: Number,
      solvedOn: Date
    },
    averageRating: {
      type: Number,
      default: 0
    },
    // Tracking for different time periods
    last7Days: {
      solved: { type: Number, default: 0 },
      averagePerDay: { type: Number, default: 0 }
    },
    last30Days: {
      solved: { type: Number, default: 0 },
      averagePerDay: { type: Number, default: 0 }
    },
    last90Days: {
      solved: { type: Number, default: 0 },
      averagePerDay: { type: Number, default: 0 }
    }
  },
  // User profile information from Codeforces
  userInfo: {
    contribution: Number,
    friendOfCount: Number,
    rank: String,
    maxRank: String,
    registrationTimeSeconds: Number,
    avatar: String
  },
  // Data tracking
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastSubmissionDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create compound indexes for efficient querying
CodeforcesDataSchema.index({ handle: 1, 'submissions.submissionTime': 1 });
CodeforcesDataSchema.index({ handle: 1, 'contests.date': 1 });

// Method to check if user has been inactive (no submissions) for given days
CodeforcesDataSchema.methods.isInactiveForDays = function(days) {
  if (!this.lastSubmissionDate) {
    return true; // No submissions recorded means inactive
  }
  
  const now = new Date();
  const daysSinceLastSubmission = Math.floor(
    (now - this.lastSubmissionDate) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceLastSubmission >= days;
};

// Method to get submissions within a date range
CodeforcesDataSchema.methods.getSubmissionsInRange = function(startDate, endDate) {
  return this.submissions.filter(submission => {
    const submissionDate = new Date(submission.submissionTime);
    return submissionDate >= startDate && submissionDate <= endDate;
  });
};

// Method to get contests within a date range
CodeforcesDataSchema.methods.getContestsInRange = function(startDate, endDate) {
  return this.contests.filter(contest => {
    const contestDate = new Date(contest.date);
    return contestDate >= startDate && contestDate <= endDate;
  });
};

const CodeforcesData = mongoose.model('CodeforcesData', CodeforcesDataSchema);

module.exports = CodeforcesData;
