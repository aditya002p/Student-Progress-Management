const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * EmailLog Schema
 * Tracks all emails sent to students, particularly for inactivity reminders
 */
const EmailLogSchema = new Schema({
  // Reference to the student who received the email
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  // Student email address (stored for historical record)
  recipientEmail: {
    type: String,
    required: true,
    trim: true
  },
  // Type of email sent
  emailType: {
    type: String,
    required: true,
    enum: ['inactivityReminder', 'welcome', 'notification', 'other'],
    default: 'inactivityReminder'
  },
  // Email subject line
  subject: {
    type: String,
    required: true
  },
  // Email content (can be HTML or plain text)
  content: {
    type: String,
    required: true
  },
  // Email template used (if applicable)
  template: {
    type: String,
    default: 'default'
  },
  // Email sending status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked'],
    default: 'sent'
  },
  // When the email was sent
  sentAt: {
    type: Date,
    default: Date.now
  },
  // When the email status was last updated
  statusUpdatedAt: {
    type: Date,
    default: Date.now
  },
  // Delivery error information (if any)
  error: {
    message: String,
    code: String,
    timestamp: Date
  },
  // Metadata related to inactivity (if it's an inactivity reminder)
  inactivityData: {
    daysSinceLastSubmission: Number,
    reminderCount: Number,
    lastSubmissionDate: Date
  },
  // Additional metadata
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
EmailLogSchema.index({ student: 1, sentAt: -1 });
EmailLogSchema.index({ emailType: 1, sentAt: -1 });
EmailLogSchema.index({ 'inactivityData.reminderCount': 1 });

// Static method to get reminder count for a student
EmailLogSchema.statics.getReminderCountForStudent = function(studentId) {
  return this.countDocuments({
    student: studentId,
    emailType: 'inactivityReminder'
  });
};

// Static method to get latest reminder for a student
EmailLogSchema.statics.getLatestReminderForStudent = function(studentId) {
  return this.findOne({
    student: studentId,
    emailType: 'inactivityReminder'
  }).sort({ sentAt: -1 });
};

// Static method to check if a reminder was sent recently (within specified days)
EmailLogSchema.statics.wasReminderSentRecently = async function(studentId, days = 3) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentReminder = await this.findOne({
    student: studentId,
    emailType: 'inactivityReminder',
    sentAt: { $gte: cutoffDate }
  });
  
  return !!recentReminder;
};

const EmailLog = mongoose.model('EmailLog', EmailLogSchema);

module.exports = EmailLog;
