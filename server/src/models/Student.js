const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Student Schema
 * Stores student information and Codeforces data tracking
 */
const StudentSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  codeforcesHandle: {
    type: String,
    required: [true, 'Codeforces handle is required'],
    trim: true,
    unique: true
  },
  currentRating: {
    type: Number,
    default: 0
  },
  maxRating: {
    type: Number,
    default: 0
  },
  lastDataUpdate: {
    type: Date,
    default: null
  },
  emailReminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    count: {
      type: Number,
      default: 0
    },
    lastSent: {
      type: Date,
      default: null
    }
  },
  inactivityStatus: {
    isInactive: {
      type: Boolean,
      default: false
    },
    inactiveSince: {
      type: Date,
      default: null
    }
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create index for faster queries
StudentSchema.index({ email: 1, codeforcesHandle: 1 });

// Virtual for full name if needed later
StudentSchema.virtual('fullName').get(function() {
  return this.name;
});

// Method to check if student is inactive for more than specified days
StudentSchema.methods.isInactiveForDays = function(days) {
  if (!this.inactivityStatus.isInactive || !this.inactivityStatus.inactiveSince) {
    return false;
  }
  
  const now = new Date();
  const inactiveDays = Math.floor((now - this.inactivityStatus.inactiveSince) / (1000 * 60 * 60 * 24));
  return inactiveDays >= days;
};

// Pre-save hook to ensure handle is lowercase
StudentSchema.pre('save', function(next) {
  if (this.isModified('codeforcesHandle')) {
    this.codeforcesHandle = this.codeforcesHandle.toLowerCase();
  }
  next();
});

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;
