/**
 * Application Constants
 * Central location for all constant values used throughout the application
 */

// Codeforces API Constants
const CODEFORCES = {
  API_BASE_URL: 'https://codeforces.com/api',
  USER_INFO_ENDPOINT: '/user.info',
  USER_STATUS_ENDPOINT: '/user.status',
  USER_RATING_ENDPOINT: '/user.rating',
  CONTEST_LIST_ENDPOINT: '/contest.list',
  PROBLEM_SET_ENDPOINT: '/problemset.problems',
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
  API_CALL_DELAY_MS: 500,
  MAX_BATCH_SIZE: 50,
  DEFAULT_SUBMISSION_COUNT: 10000,
  VERDICTS: {
    ACCEPTED: 'OK',
    WRONG_ANSWER: 'WRONG_ANSWER',
    TIME_LIMIT_EXCEEDED: 'TIME_LIMIT_EXCEEDED',
    MEMORY_LIMIT_EXCEEDED: 'MEMORY_LIMIT_EXCEEDED',
    RUNTIME_ERROR: 'RUNTIME_ERROR',
    COMPILATION_ERROR: 'COMPILATION_ERROR',
    SKIPPED: 'SKIPPED',
    REJECTED: 'REJECTED',
    PRESENTATION_ERROR: 'PRESENTATION_ERROR',
    CHALLENGED: 'CHALLENGED',
    IDLENESS_LIMIT_EXCEEDED: 'IDLENESS_LIMIT_EXCEEDED'
  }
};

// Rating Categories and Colors
const RATING_CATEGORIES = [
  { name: 'Newbie', minRating: 0, maxRating: 1199, color: '#CCCCCC' },
  { name: 'Pupil', minRating: 1200, maxRating: 1399, color: '#77FF77' },
  { name: 'Specialist', minRating: 1400, maxRating: 1599, color: '#77DDBB' },
  { name: 'Expert', minRating: 1600, maxRating: 1899, color: '#AAAAFF' },
  { name: 'Candidate Master', minRating: 1900, maxRating: 2099, color: '#FF88FF' },
  { name: 'Master', minRating: 2100, maxRating: 2299, color: '#FFCC88' },
  { name: 'International Master', minRating: 2300, maxRating: 2399, color: '#FFBB55' },
  { name: 'Grandmaster', minRating: 2400, maxRating: 2599, color: '#FF7777' },
  { name: 'International Grandmaster', minRating: 2600, maxRating: 2999, color: '#FF3333' },
  { name: 'Legendary Grandmaster', minRating: 3000, maxRating: Infinity, color: '#AA0000' }
];

// Rating Buckets for Visualization
const RATING_BUCKETS = [
  '800-900', '900-1000', '1000-1100', '1100-1200', '1200-1300', '1300-1400',
  '1400-1500', '1500-1600', '1600-1700', '1700-1800', '1800-1900', '1900-2000',
  '2000-2100', '2100-2200', '2200-2300', '2300-2400', '2400-2500', '2500-2600',
  '2600-2700', '2700-2800', '2800-2900', '2900-3000', '3000+'
];

// Date Range Options
const DATE_RANGES = {
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
  LAST_90_DAYS: '90d',
  LAST_365_DAYS: '365d'
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  SORT_FIELDS: ['name', 'email', 'codeforcesHandle', 'currentRating', 'maxRating', 'createdAt', 'lastDataUpdate'],
  SORT_ORDERS: ['asc', 'desc']
};

// Email Constants
const EMAIL = {
  TYPES: {
    INACTIVITY_REMINDER: 'inactivityReminder',
    WELCOME: 'welcome',
    NOTIFICATION: 'notification',
    OTHER: 'other'
  },
  STATUSES: {
    SENT: 'sent',
    DELIVERED: 'delivered',
    FAILED: 'failed',
    BOUNCED: 'bounced',
    OPENED: 'opened',
    CLICKED: 'clicked'
  },
  DEFAULT_SUBJECT: {
    INACTIVITY_REMINDER: 'Reminder: Get back to problem solving!',
    WELCOME: 'Welcome to Student Progress Management System',
    NOTIFICATION: 'Notification from Student Progress Management'
  },
  DEFAULT_TEMPLATES: {
    INACTIVITY_REMINDER: 'inactivity_reminder',
    WELCOME: 'welcome',
    NOTIFICATION: 'notification'
  }
};

// Cron Job Constants
const CRON_JOBS = {
  CODEFORCES_SYNC: 'codeforcesSync',
  INACTIVITY_CHECK: 'inactivityCheck',
  EMAIL_REMINDER: 'emailReminder',
  DEFAULT_SCHEDULES: {
    CODEFORCES_SYNC: '0 2 * * *', // 2 AM daily
    INACTIVITY_CHECK: '0 3 * * *', // 3 AM daily
    EMAIL_REMINDER: '0 10 * * *' // 10 AM daily
  }
};

// Inactivity Constants
const INACTIVITY = {
  DEFAULT_THRESHOLD_DAYS: 7,
  REMINDER_FREQUENCY_DAYS: 3,
  MAX_REMINDER_COUNT: 5
};

// File Upload Constants
const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf', 'text/csv'],
  UPLOAD_PATH: './uploads'
};

// API Response Status Codes and Messages
const API_RESPONSES = {
  SUCCESS: {
    CODE: 200,
    MESSAGE: 'Request successful'
  },
  CREATED: {
    CODE: 201,
    MESSAGE: 'Resource created successfully'
  },
  BAD_REQUEST: {
    CODE: 400,
    MESSAGE: 'Bad request'
  },
  UNAUTHORIZED: {
    CODE: 401,
    MESSAGE: 'Unauthorized'
  },
  FORBIDDEN: {
    CODE: 403,
    MESSAGE: 'Forbidden'
  },
  NOT_FOUND: {
    CODE: 404,
    MESSAGE: 'Resource not found'
  },
  CONFLICT: {
    CODE: 409,
    MESSAGE: 'Resource already exists'
  },
  INTERNAL_ERROR: {
    CODE: 500,
    MESSAGE: 'Internal server error'
  }
};

// Error Messages
const ERROR_MESSAGES = {
  INVALID_ID: 'Invalid ID format',
  STUDENT_NOT_FOUND: 'Student not found',
  CODEFORCES_DATA_NOT_FOUND: 'No Codeforces data found for this student',
  INVALID_CODEFORCES_HANDLE: 'Invalid Codeforces handle',
  DUPLICATE_EMAIL: 'A student with this email already exists',
  DUPLICATE_HANDLE: 'A student with this Codeforces handle already exists',
  CODEFORCES_API_ERROR: 'Error fetching data from Codeforces API',
  EMAIL_SEND_ERROR: 'Error sending email',
  INVALID_CRON_EXPRESSION: 'Invalid cron schedule expression',
  CRON_JOB_NOT_FOUND: 'Cron job not found',
  DATABASE_ERROR: 'Database operation failed'
};

// CSV Export Constants
const CSV_EXPORT = {
  TYPES: {
    STUDENTS: 'students',
    CONTESTS: 'contests',
    SUBMISSIONS: 'submissions',
    PROBLEMS: 'problems',
    INACTIVE_STUDENTS: 'inactiveStudents',
    EMAIL_HISTORY: 'emailHistory',
    CODEFORCES_DATA: 'codeforcesData'
  },
  DEFAULT_FILENAME_PREFIX: 'export_',
  DEFAULT_ENCODING: 'utf8'
};

// Theme Constants
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Chart Colors
const CHART_COLORS = {
  PRIMARY: '#4a69bd',
  SECONDARY: '#6a89cc',
  SUCCESS: '#78e08f',
  DANGER: '#eb2f06',
  WARNING: '#fa983a',
  INFO: '#38ada9',
  LIGHT: '#f8f9fa',
  DARK: '#1e272e',
  RATING_CHANGE_POSITIVE: '#78e08f',
  RATING_CHANGE_NEGATIVE: '#eb2f06',
  HEATMAP_COLORS: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
};

module.exports = {
  CODEFORCES,
  RATING_CATEGORIES,
  RATING_BUCKETS,
  DATE_RANGES,
  PAGINATION,
  EMAIL,
  CRON_JOBS,
  INACTIVITY,
  FILE_UPLOAD,
  API_RESPONSES,
  ERROR_MESSAGES,
  CSV_EXPORT,
  THEMES,
  CHART_COLORS
};
