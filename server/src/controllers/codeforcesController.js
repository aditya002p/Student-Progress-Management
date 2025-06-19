const CodeforcesData = require('../models/CodeforcesData');
const Student = require('../models/Student');
const logger = require('../utils/logger');
const { subDays } = require('date-fns');
const codeforcesService = require('../services/codeforcesService');

/**
 * Codeforces Controller
 * Handles all Codeforces-related operations including contest history and problem data
 */

// Controller to validate a Codeforces handle
exports.validateHandle = async (req, res, next) => {
  try {
    // Disable caching for this endpoint to prevent 304 Not Modified responses
    res.set('Cache-Control', 'no-store');

    const { handle } = req.params;
    const isValid = await codeforcesService.validateHandle(handle);
    if (isValid) {
      res.status(200).json({ success: true, message: 'Handle is valid' });
    } else {
      res.status(400).json({ success: false, message: 'Handle is invalid or not found' });
    }
  } catch (error) {
    next(error);
  }
};

// Get contest history with filtering by date range
exports.getContestHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query; // Default to 30 days if not specified
    
    // Find student and check if exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Find Codeforces data for the student
    const codeforcesData = await CodeforcesData.findOne({ student: id });
    if (!codeforcesData) {
      return res.status(404).json({
        success: false,
        message: 'No Codeforces data found for this student'
      });
    }
    
    // Calculate date range based on days parameter
    const endDate = new Date();
    const startDate = subDays(endDate, parseInt(days, 10));
    
    // Filter contests within the date range
    const contests = codeforcesData.contests.filter(contest => {
      const contestDate = new Date(contest.date);
      return contestDate >= startDate && contestDate <= endDate;
    });
    
    // Sort contests by date (newest first)
    contests.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Prepare rating data for graph
    const ratingData = contests.map(contest => ({
      contestId: contest.contestId,
      contestName: contest.contestName,
      date: contest.date,
      newRating: contest.newRating,
      ratingChange: contest.ratingChange
    })).reverse(); // Reverse to get chronological order for the graph
    
    res.status(200).json({
      success: true,
      data: {
        contests,
        ratingData,
        totalContests: contests.length,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });
  } catch (error) {
    logger.error(`Error fetching contest history for student ID ${req.params.id}:`, error);
    next(error);
  }
};

// Get problem solving data with filtering by date range
exports.getProblemSolvingData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query; // Default to 30 days if not specified
    
    // Find student and check if exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Find Codeforces data for the student
    const codeforcesData = await CodeforcesData.findOne({ student: id });
    if (!codeforcesData) {
      return res.status(404).json({
        success: false,
        message: 'No Codeforces data found for this student'
      });
    }
    
    // Calculate date range based on days parameter
    const endDate = new Date();
    const startDate = subDays(endDate, parseInt(days, 10));
    
    // Filter accepted submissions within the date range
    const acceptedSubmissions = codeforcesData.submissions.filter(submission => {
      const submissionDate = new Date(submission.submissionTime);
      return (
        submission.verdict === 'OK' && 
        submissionDate >= startDate && 
        submissionDate <= endDate
      );
    });
    
    // Create a set of unique problem IDs to count unique problems solved
    const uniqueProblemIds = new Set();
    acceptedSubmissions.forEach(submission => {
      uniqueProblemIds.add(submission.problemId);
    });
    
    // Calculate average problems per day
    const daysCount = parseInt(days, 10);
    const averageProblemsPerDay = uniqueProblemIds.size / daysCount;
    
    // Find the most difficult problem solved in this period
    let mostDifficultProblem = null;
    let highestRating = 0;
    
    acceptedSubmissions.forEach(submission => {
      if (submission.problemRating && submission.problemRating > highestRating) {
        highestRating = submission.problemRating;
        mostDifficultProblem = {
          problemId: submission.problemId,
          problemName: submission.problemName,
          rating: submission.problemRating,
          solvedOn: submission.submissionTime
        };
      }
    });
    
    // Calculate average rating of solved problems
    let totalRating = 0;
    let ratedProblemCount = 0;
    
    acceptedSubmissions.forEach(submission => {
      if (submission.problemRating) {
        totalRating += submission.problemRating;
        ratedProblemCount++;
      }
    });
    
    const averageRating = ratedProblemCount > 0 ? totalRating / ratedProblemCount : 0;
    
    // Count problems by rating range
    const problemsByRating = {};
    const ratingRanges = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500];
    
    // Initialize rating buckets
    ratingRanges.forEach((rating, index) => {
      const nextRating = ratingRanges[index + 1] || rating + 100;
      problemsByRating[`${rating}-${nextRating}`] = 0;
    });
    
    // Count problems in each rating bucket
    acceptedSubmissions.forEach(submission => {
      if (submission.problemRating) {
        // Find the appropriate rating bucket
        for (let i = 0; i < ratingRanges.length; i++) {
          const currentRating = ratingRanges[i];
          const nextRating = ratingRanges[i + 1] || currentRating + 100;
          
          if (submission.problemRating >= currentRating && submission.problemRating < nextRating) {
            const bucketKey = `${currentRating}-${nextRating}`;
            problemsByRating[bucketKey] = (problemsByRating[bucketKey] || 0) + 1;
            break;
          }
        }
      }
    });
    
    // Format the rating distribution for chart display
    const ratingDistribution = Object.entries(problemsByRating)
      .filter(([_, count]) => count > 0)
      .map(([range, count]) => ({
        range,
        count
      }));
    
    res.status(200).json({
      success: true,
      data: {
        totalProblemsSolved: uniqueProblemIds.size,
        averageProblemsPerDay: parseFloat(averageProblemsPerDay.toFixed(2)),
        averageRating: parseFloat(averageRating.toFixed(2)),
        mostDifficultProblem,
        ratingDistribution,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });
  } catch (error) {
    logger.error(`Error fetching problem solving data for student ID ${req.params.id}:`, error);
    next(error);
  }
};

// Get submission heatmap data
exports.getSubmissionHeatmap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { days = 365 } = req.query; // Default to 365 days for heatmap
    
    // Find student and check if exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Find Codeforces data for the student
    const codeforcesData = await CodeforcesData.findOne({ student: id });
    if (!codeforcesData) {
      return res.status(404).json({
        success: false,
        message: 'No Codeforces data found for this student'
      });
    }
    
    // Calculate date range based on days parameter
    const endDate = new Date();
    const startDate = subDays(endDate, parseInt(days, 10));
    
    // Filter submissions within the date range
    const submissions = codeforcesData.submissions.filter(submission => {
      const submissionDate = new Date(submission.submissionTime);
      return submissionDate >= startDate && submissionDate <= endDate;
    });
    
    // Group submissions by date (YYYY-MM-DD format)
    const submissionsByDate = {};
    
    submissions.forEach(submission => {
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
      if (submission.verdict === 'OK') {
        submissionsByDate[dateKey].accepted++;
      }
    });
    
    // Convert to array format for heatmap
    const heatmapData = Object.values(submissionsByDate).map(item => ({
      date: item.date,
      count: item.count,
      accepted: item.accepted
    }));
    
    // Sort by date
    heatmapData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.status(200).json({
      success: true,
      data: {
        heatmapData,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });
  } catch (error) {
    logger.error(`Error fetching submission heatmap data for student ID ${req.params.id}:`, error);
    next(error);
  }
};

// Get unsolved problems from contests
exports.getUnsolvedProblems = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find student and check if exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Find Codeforces data for the student
    const codeforcesData = await CodeforcesData.findOne({ student: id });
    if (!codeforcesData) {
      return res.status(404).json({
        success: false,
        message: 'No Codeforces data found for this student'
      });
    }
    
    // Get contests with unsolved problems
    const contestsWithUnsolvedProblems = codeforcesData.contests
      .filter(contest => contest.unsolvedProblems > 0)
      .map(contest => ({
        contestId: contest.contestId,
        contestName: contest.contestName,
        date: contest.date,
        unsolvedProblems: contest.unsolvedProblems
      }));
    
    res.status(200).json({
      success: true,
      data: {
        contests: contestsWithUnsolvedProblems,
        totalUnsolvedProblems: contestsWithUnsolvedProblems.reduce(
          (total, contest) => total + contest.unsolvedProblems, 0
        )
      }
    });
  } catch (error) {
    logger.error(`Error fetching unsolved problems for student ID ${req.params.id}:`, error);
    next(error);
  }
};

// Get rating distribution of all problems solved
exports.getRatingDistribution = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find student and check if exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Find Codeforces data for the student
    const codeforcesData = await CodeforcesData.findOne({ student: id });
    if (!codeforcesData) {
      return res.status(404).json({
        success: false,
        message: 'No Codeforces data found for this student'
      });
    }
    
    // Get the rating distribution from statistics
    const ratingDistribution = codeforcesData.statistics.solvedByRating || new Map();
    
    // Convert Map to array for response
    const distributionArray = Array.from(ratingDistribution).map(([range, count]) => ({
      range,
      count
    }));
    
    res.status(200).json({
      success: true,
      data: {
        ratingDistribution: distributionArray,
        totalSolved: codeforcesData.statistics.totalSolved || 0
      }
    });
  } catch (error) {
    logger.error(`Error fetching rating distribution for student ID ${req.params.id}:`, error);
    next(error);
  }
};

// Get overall statistics for a student
exports.getOverallStatistics = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find student and check if exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Find Codeforces data for the student
    const codeforcesData = await CodeforcesData.findOne({ student: id });
    if (!codeforcesData) {
      return res.status(404).json({
        success: false,
        message: 'No Codeforces data found for this student'
      });
    }
    
    // Extract relevant statistics
    const stats = {
      totalSolved: codeforcesData.statistics.totalSolved || 0,
      averageRating: codeforcesData.statistics.averageRating || 0,
      mostDifficultProblem: codeforcesData.statistics.mostDifficultProblem || null,
      totalContests: codeforcesData.contests.length,
      last7Days: codeforcesData.statistics.last7Days || { solved: 0, averagePerDay: 0 },
      last30Days: codeforcesData.statistics.last30Days || { solved: 0, averagePerDay: 0 },
      last90Days: codeforcesData.statistics.last90Days || { solved: 0, averagePerDay: 0 },
      lastSubmission: codeforcesData.lastSubmissionDate,
      userInfo: codeforcesData.userInfo || {}
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error(`Error fetching overall statistics for student ID ${req.params.id}:`, error);
    next(error);
  }
};
