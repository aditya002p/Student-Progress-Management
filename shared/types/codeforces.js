/**
 * @fileoverview Type definitions for Codeforces data
 * 
 * This file contains type definitions for Codeforces-related objects used throughout
 * the Student Progress Management System.
 */

/**
 * @typedef {Object} CodeforcesContest
 * @property {number} contestId - Unique identifier for the contest
 * @property {string} contestName - Name of the contest
 * @property {number} rank - Student's rank in the contest
 * @property {number} oldRating - Rating before the contest
 * @property {number} newRating - Rating after the contest
 * @property {number} ratingChange - Change in rating (can be positive or negative)
 * @property {Date|string} date - Date when the contest took place
 * @property {number} unsolvedProblems - Number of problems from the contest still unsolved by the student
 */

/**
 * @typedef {Object} CodeforcesProblem
 * @property {string} problemId - Unique identifier for the problem (usually contestId + index)
 * @property {string} name - Name of the problem
 * @property {number} [contestId] - ID of the contest this problem appeared in (if applicable)
 * @property {string} [index] - Problem index in the contest (e.g., "A", "B1", etc.)
 * @property {number} [rating] - Difficulty rating of the problem
 * @property {string[]} [tags] - Array of problem tags/categories
 */

/**
 * @typedef {Object} CodeforcesSubmission
 * @property {number} submissionId - Unique identifier for the submission
 * @property {string} problemId - ID of the problem that was submitted
 * @property {string} problemName - Name of the problem
 * @property {number} [contestId] - ID of the contest (if applicable)
 * @property {number} [problemRating] - Difficulty rating of the problem
 * @property {string} verdict - Submission verdict (OK, WRONG_ANSWER, etc.)
 * @property {string} language - Programming language used
 * @property {Date|string} submissionTime - When the submission was made
 * @property {string[]} [tags] - Problem tags
 */

/**
 * @typedef {Object} CodeforcesUserInfo
 * @property {string} handle - Codeforces handle
 * @property {string} [email] - Email address (rarely available)
 * @property {number} [contribution] - Contribution score
 * @property {number} [rating] - Current rating
 * @property {number} [maxRating] - Maximum rating achieved
 * @property {string} [rank] - Current rank (e.g., "expert", "master")
 * @property {string} [maxRank] - Maximum rank achieved
 * @property {number} [friendOfCount] - Number of users who have marked this user as friend
 * @property {string} [avatar] - URL to avatar image
 * @property {number} [registrationTimeSeconds] - Registration timestamp in seconds
 */

/**
 * @typedef {Object} CodeforcesStatistics
 * @property {number} totalSolved - Total number of unique problems solved
 * @property {Map<string, number>|Object} solvedByRating - Map of rating ranges to number of problems solved
 * @property {Object} mostDifficultProblem - Information about the most difficult problem solved
 * @property {string} mostDifficultProblem.problemId - ID of the most difficult problem
 * @property {string} mostDifficultProblem.problemName - Name of the most difficult problem
 * @property {number} mostDifficultProblem.rating - Rating of the most difficult problem
 * @property {Date|string} mostDifficultProblem.solvedOn - When the problem was solved
 * @property {number} averageRating - Average rating of solved problems
 * @property {Object} last7Days - Statistics for the last 7 days
 * @property {number} last7Days.solved - Number of problems solved in the last 7 days
 * @property {number} last7Days.averagePerDay - Average problems solved per day in the last 7 days
 * @property {Object} last30Days - Statistics for the last 30 days
 * @property {number} last30Days.solved - Number of problems solved in the last 30 days
 * @property {number} last30Days.averagePerDay - Average problems solved per day in the last 30 days
 * @property {Object} last90Days - Statistics for the last 90 days
 * @property {number} last90Days.solved - Number of problems solved in the last 90 days
 * @property {number} last90Days.averagePerDay - Average problems solved per day in the last 90 days
 */

/**
 * @typedef {Object} CodeforcesData
 * @property {string} student - MongoDB ObjectId of the student
 * @property {string} handle - Codeforces handle of the student
 * @property {CodeforcesContest[]} contests - Array of contest participation history
 * @property {CodeforcesSubmission[]} submissions - Array of problem submissions
 * @property {CodeforcesStatistics} statistics - Aggregated statistics
 * @property {CodeforcesUserInfo} userInfo - User profile information from Codeforces
 * @property {Date|string} lastUpdated - When the data was last updated
 * @property {Date|string|null} lastSubmissionDate - Date of the most recent submission
 */

/**
 * @typedef {Object} HeatmapDataPoint
 * @property {string} date - Date in YYYY-MM-DD format
 * @property {number} count - Total number of submissions on this date
 * @property {number} accepted - Number of accepted submissions on this date
 */

/**
 * @typedef {Object} RatingDistributionItem
 * @property {string} range - Rating range (e.g., "800-900")
 * @property {number} count - Number of problems solved in this range
 */

/**
 * @typedef {Object} ContestHistoryResponse
 * @property {boolean} success - Whether the request was successful
 * @property {Object} data - Response data
 * @property {CodeforcesContest[]} data.contests - Array of contests
 * @property {Object[]} data.ratingData - Data formatted for rating chart
 * @property {number} data.totalContests - Total number of contests
 * @property {Object} data.dateRange - Date range for the data
 * @property {Date|string} data.dateRange.start - Start date
 * @property {Date|string} data.dateRange.end - End date
 */

/**
 * @typedef {Object} ProblemSolvingResponse
 * @property {boolean} success - Whether the request was successful
 * @property {Object} data - Response data
 * @property {number} data.totalProblemsSolved - Total number of problems solved
 * @property {number} data.averageProblemsPerDay - Average problems solved per day
 * @property {number} data.averageRating - Average problem rating
 * @property {Object|null} data.mostDifficultProblem - Most difficult problem solved
 * @property {RatingDistributionItem[]} data.ratingDistribution - Distribution of problems by rating
 * @property {Object} data.dateRange - Date range for the data
 */

/**
 * @typedef {Object} HeatmapResponse
 * @property {boolean} success - Whether the request was successful
 * @property {Object} data - Response data
 * @property {HeatmapDataPoint[]} data.heatmapData - Data for the submission heatmap
 * @property {Object} data.dateRange - Date range for the data
 */

// Export the types for use in both frontend and backend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // These are just type definitions, no actual values to export
    // But we export the empty object to allow importing the file
  };
}
