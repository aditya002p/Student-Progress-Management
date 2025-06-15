/**
 * Helper Functions
 * General utility functions used throughout the application
 */

const logger = require('./logger');
const { subDays } = require('date-fns');
const { RATING_BUCKETS, CODEFORCES } = require('./constants');

/**
 * Calculate statistics from Codeforces submissions
 * @param {Array} submissions - Array of submission objects
 * @returns {Object} Statistics object with various metrics
 */
exports.calculateStatistics = (submissions) => {
  try {
    if (!Array.isArray(submissions)) {
      logger.error('Invalid submissions data provided to calculateStatistics');
      return {
        totalSolved: 0,
        solvedByRating: new Map(),
        mostDifficultProblem: null,
        averageRating: 0,
        last7Days: { solved: 0, averagePerDay: 0 },
        last30Days: { solved: 0, averagePerDay: 0 },
        last90Days: { solved: 0, averagePerDay: 0 }
      };
    }

    // Filter accepted submissions only
    const acceptedSubmissions = submissions.filter(s => s.verdict === CODEFORCES.VERDICTS.ACCEPTED);
    
    // Create a set of unique problem IDs
    const uniqueProblemIds = new Set();
    acceptedSubmissions.forEach(s => uniqueProblemIds.add(s.problemId));
    
    // Count problems by rating
    const solvedByRating = new Map();
    const problemRatings = new Map();
    
    // Keep track of the most difficult problem
    let mostDifficultProblem = null;
    let highestRating = 0;
    
    // Process each accepted submission
    acceptedSubmissions.forEach(submission => {
      const problemId = submission.problemId;
      
      // Only count each problem once
      if (!problemRatings.has(problemId)) {
        problemRatings.set(problemId, submission.problemRating);
        
        // Count by rating bucket if rating exists
        if (submission.problemRating) {
          // Determine rating bucket (800-900, 900-1000, etc.)
          const lowerBound = Math.floor(submission.problemRating / 100) * 100;
          const upperBound = lowerBound + 100;
          const ratingBucket = `${lowerBound}-${upperBound}`;
          
          // Increment count for this rating bucket
          const currentCount = solvedByRating.get(ratingBucket) || 0;
          solvedByRating.set(ratingBucket, currentCount + 1);
          
          // Update most difficult problem if applicable
          if (submission.problemRating > highestRating) {
            highestRating = submission.problemRating;
            mostDifficultProblem = {
              problemId: submission.problemId,
              problemName: submission.problemName,
              rating: submission.problemRating,
              solvedOn: submission.submissionTime
            };
          }
        }
      }
    });
    
    // Calculate average rating of solved problems
    let totalRating = 0;
    let ratedProblemCount = 0;
    
    problemRatings.forEach(rating => {
      if (rating) {
        totalRating += rating;
        ratedProblemCount++;
      }
    });
    
    const averageRating = ratedProblemCount > 0 ? totalRating / ratedProblemCount : 0;
    
    // Calculate statistics for different time periods
    const now = new Date();
    const last7Days = getStatsForPeriod(acceptedSubmissions, 7, now);
    const last30Days = getStatsForPeriod(acceptedSubmissions, 30, now);
    const last90Days = getStatsForPeriod(acceptedSubmissions, 90, now);
    
    return {
      totalSolved: uniqueProblemIds.size,
      solvedByRating,
      mostDifficultProblem,
      averageRating,
      last7Days,
      last30Days,
      last90Days
    };
  } catch (error) {
    logger.error('Error calculating statistics:', error);
    return {
      totalSolved: 0,
      solvedByRating: new Map(),
      mostDifficultProblem: null,
      averageRating: 0,
      last7Days: { solved: 0, averagePerDay: 0 },
      last30Days: { solved: 0, averagePerDay: 0 },
      last90Days: { solved: 0, averagePerDay: 0 }
    };
  }
};

/**
 * Get statistics for a specific time period
 * @param {Array} submissions - Accepted submissions
 * @param {number} days - Number of days to look back
 * @param {Date} endDate - End date for the period
 * @returns {Object} Period statistics
 */
function getStatsForPeriod(submissions, days, endDate) {
  const startDate = subDays(endDate, days);
  
  // Filter submissions in the time period
  const periodSubmissions = submissions.filter(s => {
    const submissionDate = new Date(s.submissionTime);
    return submissionDate >= startDate && submissionDate <= endDate;
  });
  
  // Count unique problems
  const uniqueProblemIds = new Set();
  periodSubmissions.forEach(s => uniqueProblemIds.add(s.problemId));
  
  // Calculate average per day
  const solved = uniqueProblemIds.size;
  const averagePerDay = solved / days;
  
  return {
    solved,
    averagePerDay
  };
}

/**
 * Format rating distribution data for charts
 * @param {Map} solvedByRating - Map of rating buckets to problem counts
 * @returns {Array} Formatted data for charts
 */
exports.formatRatingDistribution = (solvedByRating) => {
  try {
    if (!(solvedByRating instanceof Map)) {
      return [];
    }
    
    const distribution = [];
    
    // Ensure all rating buckets are represented
    RATING_BUCKETS.forEach(bucket => {
      distribution.push({
        range: bucket,
        count: solvedByRating.get(bucket) || 0
      });
    });
    
    // Filter out buckets with zero problems
    return distribution.filter(item => item.count > 0);
  } catch (error) {
    logger.error('Error formatting rating distribution:', error);
    return [];
  }
};

/**
 * Format submission data for heatmap
 * @param {Array} submissions - Array of submission objects
 * @param {number} days - Number of days to include
 * @returns {Array} Formatted data for heatmap
 */
exports.formatSubmissionsForHeatmap = (submissions, days = 365) => {
  try {
    if (!Array.isArray(submissions)) {
      return [];
    }
    
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    // Filter submissions within date range
    const filteredSubmissions = submissions.filter(s => {
      const submissionDate = new Date(s.submissionTime);
      return submissionDate >= startDate && submissionDate <= endDate;
    });
    
    // Group submissions by date
    const submissionsByDate = {};
    
    filteredSubmissions.forEach(submission => {
      const date = new Date(submission.submissionTime);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!submissionsByDate[dateKey]) {
        submissionsByDate[dateKey] = {
          date: dateKey,
          count: 0,
          accepted: 0
        };
      }
      
      submissionsByDate[dateKey].count++;
      if (submission.verdict === CODEFORCES.VERDICTS.ACCEPTED) {
        submissionsByDate[dateKey].accepted++;
      }
    });
    
    // Convert to array and sort by date
    return Object.values(submissionsByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    logger.error('Error formatting submissions for heatmap:', error);
    return [];
  }
};

/**
 * Format contest history data for charts
 * @param {Array} contests - Array of contest objects
 * @returns {Array} Formatted data for rating charts
 */
exports.formatContestsForRatingChart = (contests) => {
  try {
    if (!Array.isArray(contests)) {
      return [];
    }
    
    // Sort contests by date (oldest first)
    const sortedContests = [...contests].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Format for chart
    return sortedContests.map(contest => ({
      contestId: contest.contestId,
      contestName: contest.contestName,
      date: new Date(contest.date).toISOString().split('T')[0],
      newRating: contest.newRating,
      ratingChange: contest.ratingChange
    }));
  } catch (error) {
    logger.error('Error formatting contests for rating chart:', error);
    return [];
  }
};

/**
 * Get color based on rating
 * @param {number} rating - Codeforces rating
 * @returns {string} Color hex code
 */
exports.getRatingColor = (rating) => {
  if (!rating) return '#CCCCCC'; // Default gray for unrated
  
  if (rating < 1200) return '#CCCCCC'; // Newbie
  if (rating < 1400) return '#77FF77'; // Pupil
  if (rating < 1600) return '#77DDBB'; // Specialist
  if (rating < 1900) return '#AAAAFF'; // Expert
  if (rating < 2100) return '#FF88FF'; // Candidate Master
  if (rating < 2300) return '#FFCC88'; // Master
  if (rating < 2400) return '#FFBB55'; // International Master
  if (rating < 2600) return '#FF7777'; // Grandmaster
  if (rating < 3000) return '#FF3333'; // International Grandmaster
  return '#AA0000'; // Legendary Grandmaster
};

/**
 * Get rating category name based on rating
 * @param {number} rating - Codeforces rating
 * @returns {string} Rating category name
 */
exports.getRatingCategory = (rating) => {
  if (!rating) return 'Unrated';
  
  if (rating < 1200) return 'Newbie';
  if (rating < 1400) return 'Pupil';
  if (rating < 1600) return 'Specialist';
  if (rating < 1900) return 'Expert';
  if (rating < 2100) return 'Candidate Master';
  if (rating < 2300) return 'Master';
  if (rating < 2400) return 'International Master';
  if (rating < 2600) return 'Grandmaster';
  if (rating < 3000) return 'International Grandmaster';
  return 'Legendary Grandmaster';
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
exports.deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    logger.error('Error deep cloning object:', error);
    return {};
  }
};

/**
 * Generate a random color
 * @returns {string} Random color hex code
 */
exports.getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Convert array to CSV string
 * @param {Array} array - Array of objects
 * @returns {string} CSV string
 */
exports.arrayToCsv = (array) => {
  try {
    if (!Array.isArray(array) || array.length === 0) {
      return '';
    }
    
    const headers = Object.keys(array[0]);
    const headerRow = headers.join(',');
    
    const rows = array.map(obj => 
      headers.map(header => {
        const value = obj[header];
        // Handle values with commas by wrapping in quotes
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    );
    
    return [headerRow, ...rows].join('\n');
  } catch (error) {
    logger.error('Error converting array to CSV:', error);
    return '';
  }
};

/**
 * Paginate an array
 * @param {Array} array - Array to paginate
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result
 */
exports.paginateArray = (array, page = 1, limit = 10) => {
  try {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const results = {
      data: array.slice(startIndex, endIndex),
      pagination: {
        total: array.length,
        page,
        limit,
        totalPages: Math.ceil(array.length / limit)
      }
    };
    
    return results;
  } catch (error) {
    logger.error('Error paginating array:', error);
    return { data: [], pagination: { total: 0, page, limit, totalPages: 0 } };
  }
};

/**
 * Safely access nested object properties
 * @param {Object} obj - Object to access
 * @param {string} path - Dot-notation path to property
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} Property value or default value
 */
exports.getNestedProperty = (obj, path, defaultValue = null) => {
  try {
    const travel = (regexp) => 
      String.prototype.split
        .call(path, regexp)
        .filter(Boolean)
        .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
    
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
    return result === undefined || result === null ? defaultValue : result;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Bytes to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted string
 */
exports.formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Generate a unique ID
 * @param {number} length - ID length
 * @returns {string} Unique ID
 */
exports.generateUniqueId = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Check if a student is inactive based on their last submission
 * @param {Array} submissions - Student's submissions
 * @param {number} thresholdDays - Days threshold for inactivity
 * @returns {boolean} True if student is inactive
 */
exports.isStudentInactive = (submissions, thresholdDays = 7) => {
  if (!Array.isArray(submissions) || submissions.length === 0) {
    return true; // No submissions means inactive
  }
  
  // Find the most recent submission
  const submissionDates = submissions.map(s => new Date(s.submissionTime));
  const lastSubmissionDate = new Date(Math.max(...submissionDates));
  
  // Calculate days since last submission
  const now = new Date();
  const daysSinceLastSubmission = Math.floor(
    (now - lastSubmissionDate) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceLastSubmission >= thresholdDays;
};

/**
 * Remove sensitive information from an object
 * @param {Object} obj - Object to sanitize
 * @param {Array} sensitiveFields - Fields to remove
 * @returns {Object} Sanitized object
 */
exports.removeSensitiveInfo = (obj, sensitiveFields = ['password', 'token', 'secret']) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = { ...obj };
  
  sensitiveFields.forEach(field => {
    if (field in result) {
      delete result[field];
    }
  });
  
  return result;
};

/**
 * Get date range for filtering
 * @param {string} period - Time period ('7d', '30d', '90d', '365d')
 * @returns {Object} Date range object
 */
exports.getDateRange = (period) => {
  const now = new Date();
  let days;
  
  switch (period) {
    case '7d':
      days = 7;
      break;
    case '30d':
      days = 30;
      break;
    case '90d':
      days = 90;
      break;
    case '365d':
      days = 365;
      break;
    default:
      days = 30; // Default to 30 days
  }
  
  return {
    startDate: subDays(now, days),
    endDate: now
  };
};
