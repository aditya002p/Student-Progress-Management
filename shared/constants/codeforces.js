/**
 * Codeforces Constants
 * 
 * This file contains constants related to Codeforces platform
 * used throughout the Student Progress Management System.
 */

// Codeforces API URLs
const CF_API = {
  BASE_URL: 'https://codeforces.com/api',
  USER_INFO: '/user.info',
  USER_STATUS: '/user.status',
  USER_RATING: '/user.rating',
  CONTEST_LIST: '/contest.list',
  PROBLEMSET: '/problemset.problems',
  CONTEST_STANDINGS: '/contest.standings',
  PROBLEM_URL: (contestId, index) => `https://codeforces.com/contest/${contestId}/problem/${index}`,
  SUBMISSION_URL: (submissionId) => `https://codeforces.com/contest/submission/${submissionId}`,
  PROFILE_URL: (handle) => `https://codeforces.com/profile/${handle}`,
  CONTEST_URL: (contestId) => `https://codeforces.com/contest/${contestId}`
};

// Rating categories with their ranges and colors
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

// Rating buckets for problem difficulty distribution
const RATING_BUCKETS = [
  '800-900', '900-1000', '1000-1100', '1100-1200', '1200-1300', '1300-1400',
  '1400-1500', '1500-1600', '1600-1700', '1700-1800', '1800-1900', '1900-2000',
  '2000-2100', '2100-2200', '2200-2300', '2300-2400', '2400-2500', '2500-2600',
  '2600-2700', '2700-2800', '2800-2900', '2900-3000', '3000+'
];

// Submission verdicts
const VERDICTS = {
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
};

// Contest types
const CONTEST_TYPES = {
  CF: 'Codeforces Round',
  EDUCATIONAL: 'Educational Codeforces Round',
  DIV1: 'Div. 1',
  DIV2: 'Div. 2',
  DIV3: 'Div. 3',
  DIV4: 'Div. 4',
  GLOBAL: 'Global Round',
  COMBINED: 'Combined Div. 1 + Div. 2'
};

// Contest phases
const CONTEST_PHASES = {
  BEFORE: 'BEFORE',
  CODING: 'CODING',
  PENDING_SYSTEM_TEST: 'PENDING_SYSTEM_TEST',
  SYSTEM_TEST: 'SYSTEM_TEST',
  FINISHED: 'FINISHED'
};

// Time periods for filtering data
const TIME_PERIODS = {
  CONTEST_HISTORY: [
    { label: 'Last 30 Days', value: '30', days: 30 },
    { label: 'Last 90 Days', value: '90', days: 90 },
    { label: 'Last 365 Days', value: '365', days: 365 },
    { label: 'All Time', value: 'all', days: null }
  ],
  PROBLEM_SOLVING: [
    { label: 'Last 7 Days', value: '7', days: 7 },
    { label: 'Last 30 Days', value: '30', days: 30 },
    { label: 'Last 90 Days', value: '90', days: 90 },
    { label: 'All Time', value: 'all', days: null }
  ],
  HEATMAP: [
    { label: 'Last 30 Days', value: '30', days: 30 },
    { label: 'Last 90 Days', value: '90', days: 90 },
    { label: 'Last 180 Days', value: '180', days: 180 },
    { label: 'Last 365 Days', value: '365', days: 365 }
  ]
};

// Problem tags
const PROBLEM_TAGS = [
  '2-sat', 'binary search', 'bitmasks', 'brute force', 'combinatorics',
  'constructive algorithms', 'data structures', 'dfs and similar', 'divide and conquer',
  'dp', 'dsu', 'expression parsing', 'fft', 'flows', 'games', 'geometry',
  'graph matchings', 'graphs', 'greedy', 'hashing', 'implementation',
  'interactive', 'math', 'matrices', 'meet-in-the-middle', 'number theory',
  'probabilities', 'schedules', 'shortest paths', 'sortings', 'string suffix structures',
  'strings', 'ternary search', 'trees', 'two pointers'
];

// Chart colors for rating changes
const CHART_COLORS = {
  POSITIVE_CHANGE: '#4CAF50', // Green
  NEGATIVE_CHANGE: '#F44336', // Red
  NEUTRAL: '#9E9E9E',         // Gray
  RATING_LINE: '#2196F3',     // Blue
  GRID_LINE: '#E0E0E0',       // Light Gray
  BACKGROUND: 'transparent'
};

// Heatmap colors for submission activity
const HEATMAP_COLORS = [
  '#ebedf0', // No submissions
  '#c6e48b', // Few submissions
  '#7bc96f', // Some submissions
  '#239a3b', // Many submissions
  '#196127'  // Lots of submissions
];

// Inactivity thresholds
const INACTIVITY = {
  WARNING_DAYS: 5,    // Show warning after 5 days of inactivity
  INACTIVE_DAYS: 7,   // Mark as inactive after 7 days
  CRITICAL_DAYS: 14   // Critical inactivity after 14 days
};

// Export all constants
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CF_API,
    RATING_CATEGORIES,
    RATING_BUCKETS,
    VERDICTS,
    CONTEST_TYPES,
    CONTEST_PHASES,
    TIME_PERIODS,
    PROBLEM_TAGS,
    CHART_COLORS,
    HEATMAP_COLORS,
    INACTIVITY
  };
}
