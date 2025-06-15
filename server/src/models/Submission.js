const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Submission Schema
 * Stores detailed information about Codeforces submissions made by students
 */
const SubmissionSchema = new Schema({
  // Reference to the student who made the submission
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  // Codeforces handle of the student
  handle: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  // Codeforces submission ID
  submissionId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  // Problem information
  problem: {
    // Problem ID in format contestId + index (e.g., "1234A")
    problemId: {
      type: String,
      required: true,
      index: true
    },
    // Problem name
    name: {
      type: String,
      required: true
    },
    // Contest ID the problem belongs to (if applicable)
    contestId: {
      type: Number,
      index: true
    },
    // Problem index in the contest (e.g., "A", "B1", etc.)
    index: {
      type: String
    },
    // Problem difficulty rating
    rating: {
      type: Number
    },
    // Problem tags
    tags: [{
      type: String
    }]
  },
  // Submission verdict (OK, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, etc.)
  verdict: {
    type: String,
    required: true,
    index: true
  },
  // Programming language used
  language: {
    type: String
  },
  // Submission time as reported by Codeforces
  submissionTimeSeconds: {
    type: Number,
    required: true
  },
  // Submission time as a Date object for easier querying
  submissionTime: {
    type: Date,
    required: true,
    index: true
  },
  // Memory consumed in bytes
  memoryConsumedBytes: {
    type: Number
  },
  // Time consumed in milliseconds
  timeConsumedMillis: {
    type: Number
  },
  // Points awarded for the submission (if applicable)
  points: {
    type: Number,
    default: 0
  },
  // Whether this is the first accepted submission for this problem by this student
  isFirstAccepted: {
    type: Boolean,
    default: false,
    index: true
  },
  // URL to the submission on Codeforces
  url: {
    type: String
  },
  // Source code (may be omitted to save space)
  sourceCode: {
    type: String
  },
  // Additional metadata
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Create compound indexes for efficient querying
SubmissionSchema.index({ student: 1, submissionTime: -1 });
SubmissionSchema.index({ handle: 1, submissionTime: -1 });
SubmissionSchema.index({ handle: 1, problem: 1 });
SubmissionSchema.index({ verdict: 1, submissionTime: -1 });

// Pre-save hook to ensure submissionTime is set from submissionTimeSeconds
SubmissionSchema.pre('save', function(next) {
  if (this.submissionTimeSeconds && !this.submissionTime) {
    this.submissionTime = new Date(this.submissionTimeSeconds * 1000);
  }
  next();
});

// Method to check if submission is accepted
SubmissionSchema.methods.isAccepted = function() {
  return this.verdict === 'OK';
};

// Method to get submission age in days
SubmissionSchema.methods.getAgeInDays = function() {
  const now = new Date();
  const submissionDate = this.submissionTime;
  const diffTime = Math.abs(now - submissionDate);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Static method to find accepted submissions for a student
SubmissionSchema.statics.findAcceptedByStudent = function(studentId) {
  return this.find({
    student: studentId,
    verdict: 'OK'
  }).sort({ submissionTime: -1 });
};

// Static method to find submissions within a date range
SubmissionSchema.statics.findInDateRange = function(handle, startDate, endDate) {
  return this.find({
    handle,
    submissionTime: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ submissionTime: -1 });
};

// Static method to get problem counts by rating for a student
SubmissionSchema.statics.getProblemCountsByRating = async function(studentId) {
  const result = await this.aggregate([
    { $match: { student: mongoose.Types.ObjectId(studentId), verdict: 'OK' } },
    { $group: { _id: '$problem.problemId', rating: { $first: '$problem.rating' } } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  
  return result.map(item => ({
    rating: item._id || 'Unrated',
    count: item.count
  }));
};

// Static method to get submission counts by day for heatmap
SubmissionSchema.statics.getSubmissionCountsByDay = async function(handle, days = 365) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        handle,
        submissionTime: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$submissionTime' }
        },
        count: { $sum: 1 },
        accepted: {
          $sum: { $cond: [{ $eq: ['$verdict', 'OK'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1,
        accepted: 1
      }
    },
    {
      $sort: { date: 1 }
    }
  ]);
};

const Submission = mongoose.model('Submission', SubmissionSchema);

module.exports = Submission;
