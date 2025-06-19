const axios = require('axios');
const { promisify } = require('util');
const logger = require('../utils/logger');
const Student = require('../models/Student');
const CodeforcesData = require('../models/CodeforcesData');
const { subDays } = require('date-fns');

// Sleep function for rate limiting
const sleep = promisify(setTimeout);

// Base URL for Codeforces API
const CF_API_BASE_URL = process.env.CODEFORCES_API_BASE_URL || 'https://codeforces.com/api';

// Maximum retries for API calls
const MAX_RETRIES = 3;

// Delay between retries (in ms)
const RETRY_DELAY = 2000;

// Delay between API calls to avoid rate limiting (in ms)
const API_CALL_DELAY = 500;

/**
 * Fetch user info from Codeforces API
 * @param {string} handle - Codeforces handle
 * @returns {Promise<Object|null>} User info or null if not found
 */
exports.fetchUserInfo = async (handle) => {
  try {
    const response = await makeApiRequest(`/user.info?handles=${handle}`);
    
    if (response.status === 'OK' && response.result.length > 0) {
      return response.result[0];
    }
    
    return null;
  } catch (error) {
    logger.error(`Error fetching user info for ${handle}:`, error);
    
    // Return null for "not found" errors, but throw other errors
    if (error.response && error.response.data && error.response.data.comment === 'handles: User with handle handles not found') {
      return null;
    }
    
    throw error;
  }
};

/**
 * Fetch user submissions from Codeforces API
 * @param {string} handle - Codeforces handle
 * @returns {Promise<Array>} Array of submissions
 */
exports.fetchUserSubmissions = async (handle) => {
  try {
    const response = await makeApiRequest(`/user.status?handle=${handle}&from=1&count=10000`);
    
    if (response.status === 'OK') {
      // Process and transform submissions
      return processSubmissions(response.result);
    }
    
    return [];
  } catch (error) {
    logger.error(`Error fetching submissions for ${handle}:`, error);
    throw error;
  }
};

/**
 * Fetch user contest history from Codeforces API
 * @param {string} handle - Codeforces handle
 * @returns {Promise<Array>} Array of contests
 */
exports.fetchContestProblems = async (contestId) => {
  try {
    const response = await makeApiRequest(`/contest.standings?contestId=${contestId}&from=1&count=1`);
    
    if (response.status === 'OK') {
      return response.result.problems;
    }
    
    return [];
  } catch (error) {
    logger.error(`Error fetching problems for contest ${contestId}:`, error);
    throw error;
  }
};

exports.fetchUserContests = async (handle) => {
  try {
    const response = await makeApiRequest(`/user.rating?handle=${handle}`);
    
    if (response.status === 'OK') {
      // Process and transform contest history
      return processContests(response.result);
    }
    
    return [];
  } catch (error) {
    logger.error(`Error fetching contests for ${handle}:`, error);
    
    // Return empty array for users with no contest history
    if (error.response && error.response.data && error.response.data.comment === 'User has no rating changes') {
      return [];
    }
    
    throw error;
  }
};

/**
 * Sync Codeforces data for a student
 * @param {string} studentId - MongoDB ObjectId of the student
 * @param {string} handle - Codeforces handle
 * @returns {Promise<Object>} Updated Codeforces data
 */
exports.syncStudentCodeforcesData = async (studentId, handle) => {
  try {
    logger.info(`Syncing Codeforces data for student ${studentId} with handle ${handle}`);
    
    // Fetch all data in parallel
    const [userInfo, submissions, contests] = await Promise.all([
      exports.fetchUserInfo(handle),
      exports.fetchUserSubmissions(handle),
      exports.fetchUserContests(handle)
    ]);
    
    if (!userInfo) {
      throw new Error(`User info not found for handle: ${handle}`);
    }
    
    // Calculate statistics from submissions
    const statistics = calculateStatistics(submissions);
    
    // Find or create Codeforces data document
    let codeforcesData = await CodeforcesData.findOne({ student: studentId });
    
    if (codeforcesData) {
      // Update existing data
      codeforcesData.handle = handle;
      codeforcesData.contests = contests;
      codeforcesData.submissions = submissions;
      codeforcesData.statistics = statistics;
      codeforcesData.userInfo = userInfo;
      codeforcesData.lastUpdated = new Date();
      
      // Update last submission date
      if (submissions.length > 0) {
        const submissionDates = submissions.map(s => new Date(s.submissionTime));
        codeforcesData.lastSubmissionDate = new Date(Math.max(...submissionDates));
      }
    } else {
      // Create new data document
      codeforcesData = new CodeforcesData({
        student: studentId,
        handle,
        contests,
        submissions,
        statistics,
        userInfo,
        lastUpdated: new Date(),
        lastSubmissionDate: submissions.length > 0 ? 
          new Date(Math.max(...submissions.map(s => new Date(s.submissionTime)))) : null
      });
    }
    
    // Save the data
    await codeforcesData.save();
    
    // Update student with latest rating data
    const student = await Student.findById(studentId);
    if (student) {
      student.currentRating = userInfo.rating || 0;
      student.maxRating = userInfo.maxRating || userInfo.rating || 0;
      student.lastDataUpdate = new Date();
      
      // Check for inactivity (7 days without submissions)
      const isInactive = isStudentInactive(submissions, 7);
      
      if (isInactive && !student.inactivityStatus.isInactive) {
        student.inactivityStatus.isInactive = true;
        student.inactivityStatus.inactiveSince = new Date();
      } else if (!isInactive && student.inactivityStatus.isInactive) {
        student.inactivityStatus.isInactive = false;
        student.inactivityStatus.inactiveSince = null;
      }
      
      await student.save();
    }
    
    logger.info(`Successfully synced Codeforces data for ${handle}`);
    return codeforcesData;
  } catch (error) {
    logger.error(`Error syncing Codeforces data for ${handle}:`, error);
    throw error;
  }
};

/**
 * Make an API request with retry logic
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} API response
 */
async function makeApiRequest(endpoint, retries = 0) {
  try {
    // Add delay to avoid rate limiting
    if (retries > 0) {
      await sleep(RETRY_DELAY);
    } else {
      await sleep(API_CALL_DELAY);
    }
    
    const url = `${CF_API_BASE_URL}${endpoint}`;
    logger.debug(`Making API request to: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Student-Progress-Management-System'
      }
    });
    
    return response.data;
  } catch (error) {
    logger.warn(`API request failed: ${endpoint}`, error.message);
    
    // Check if we should retry
    if (retries < MAX_RETRIES) {
      logger.info(`Retrying API request (${retries + 1}/${MAX_RETRIES}): ${endpoint}`);
      return makeApiRequest(endpoint, retries + 1);
    }
    
    throw error;
  }
}

/**
 * Process and transform raw submissions from Codeforces API
 * @param {Array} rawSubmissions - Raw submissions from API
 * @returns {Array} Processed submissions
 */
function processSubmissions(rawSubmissions) {
  return rawSubmissions.map(submission => {
    return {
      submissionId: submission.id,
      problemId: `${submission.problem.contestId}${submission.problem.index}`,
      problemName: submission.problem.name,
      contestId: submission.contestId,
      problemRating: submission.problem.rating || null,
      verdict: submission.verdict,
      language: submission.programmingLanguage,
      submissionTime: new Date(submission.creationTimeSeconds * 1000),
      tags: submission.problem.tags || []
    };
  });
}

/**
 * Process and transform raw contests from Codeforces API
 * @param {Array} rawContests - Raw contests from API
 * @returns {Array} Processed contests
 */
function processContests(rawContests) {
  return rawContests.map(contest => {
    return {
      contestId: contest.contestId,
      contestName: contest.contestName,
      rank: contest.rank,
      oldRating: contest.oldRating,
      newRating: contest.newRating,
      ratingChange: contest.newRating - contest.oldRating,
      date: new Date(contest.ratingUpdateTimeSeconds * 1000),
      unsolvedProblems: 0 // Will be updated later if needed
    };
  });
}

/**
 * Calculate statistics from submissions
 * @param {Array} submissions - Processed submissions
 * @returns {Object} Statistics object
 */
function calculateStatistics(submissions) {
  // Filter accepted submissions only
  const acceptedSubmissions = submissions.filter(s => s.verdict === 'OK');
  
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
}

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
 * Check if a student is inactive based on submissions
 * @param {Array} submissions - All submissions
 * @param {number} days - Number of days to check for inactivity
 * @returns {boolean} True if student is inactive
 */
function isStudentInactive(submissions, days) {
  if (submissions.length === 0) {
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
  
  return daysSinceLastSubmission >= days;
}

/**
 * Validates a Codeforces handle by checking if the user exists.
 * @param {string} handle - The Codeforces handle to validate.
 * @returns {Promise<boolean>} - True if the handle is valid, false otherwise.
 */
exports.validateHandle = async (handle) => {
  try {
    const userInfo = await exports.fetchUserInfo(handle);
    return !!userInfo;
  } catch (error) {
    logger.error(`Error validating handle ${handle}:`, error);
    return false;
  }
};

/**
 * Get unsolved problems count for a contest
 * @param {string} handle - Codeforces handle
 * @param {number} contestId - Contest ID
 * @returns {Promise<number>} Number of unsolved problems
 */
exports.getUnsolvedProblemsForContest = async (handle, contestId) => {
  try {
    const [contestProblems, userSubmissions] = await Promise.all([
      exports.fetchContestProblems(contestId),
      exports.fetchUserSubmissions(handle)
    ]);

    const contestSubmissions = userSubmissions.filter(s => s.contestId === contestId && s.verdict === 'OK');
    const solvedProblems = new Set(contestSubmissions.map(s => s.problemId));

    const unsolvedProblems = contestProblems.filter(p => !solvedProblems.has(`${p.contestId}-${p.index}`));

    return unsolvedProblems.length;
  } catch (error) {
    logger.error(`Error getting unsolved problems for contest ${contestId}:`, error);
    return 0;
  }
};
