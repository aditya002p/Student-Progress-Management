/**
 * Student Progress Management System
 * Inactivity check job
 * 
 * This job checks for students who haven't made Codeforces submissions
 * in a specified number of days and marks them as inactive.
 */

const logger = require('../utils/logger');
const Student = require('../models/Student');
const CodeforcesData = require('../models/CodeforcesData');
const { subDays } = require('date-fns');

/**
 * Check all students for inactivity
 * @param {number} thresholdDays - Number of days to consider as inactive (default: 7)
 * @returns {Promise<Object>} Result with counts
 */
exports.checkStudentInactivity = async (thresholdDays = 7) => {
  try {
    logger.info(`Starting inactivity check with threshold of ${thresholdDays} days`);
    
    const startTime = Date.now();
    let inactiveCount = 0;
    let activeCount = 0;
    let statusChangedCount = 0;
    
    // Get all students with their Codeforces data
    const students = await Student.find().select('_id name codeforcesHandle inactivityStatus');
    logger.info(`Found ${students.length} students to check for inactivity`);
    
    // Calculate the threshold date
    const thresholdDate = subDays(new Date(), thresholdDays);
    
    // Process each student
    for (const student of students) {
      try {
        // Get Codeforces data for this student
        const codeforcesData = await CodeforcesData.findOne({ student: student._id });
        
        if (!codeforcesData) {
          logger.warn(`No Codeforces data found for student ${student._id} (${student.codeforcesHandle})`);
          continue;
        }
        
        // Check if student is inactive
        const isInactive = isStudentInactive(codeforcesData, thresholdDate);
        const statusChanged = isInactive !== student.inactivityStatus.isInactive;
        
        // Update student if status changed
        if (statusChanged) {
          if (isInactive) {
            logger.info(`Student ${student.name} (${student.codeforcesHandle}) is now inactive`);
            student.inactivityStatus.isInactive = true;
            student.inactivityStatus.inactiveSince = new Date();
            inactiveCount++;
          } else {
            logger.info(`Student ${student.name} (${student.codeforcesHandle}) is now active`);
            student.inactivityStatus.isInactive = false;
            student.inactivityStatus.inactiveSince = null;
            activeCount++;
          }
          
          await student.save();
          statusChangedCount++;
        } else {
          // Count without updating
          if (isInactive) {
            inactiveCount++;
          } else {
            activeCount++;
          }
        }
      } catch (error) {
        logger.error(`Error checking inactivity for student ${student._id}:`, error);
      }
    }
    
    const duration = Date.now() - startTime;
    
    logger.info(`Inactivity check completed in ${duration}ms. Results: ${inactiveCount} inactive, ${activeCount} active, ${statusChangedCount} status changes`);
    
    return {
      totalCount: students.length,
      inactiveCount,
      activeCount,
      statusChangedCount,
      duration
    };
  } catch (error) {
    logger.error('Error in checkStudentInactivity:', error);
    throw error;
  }
};

/**
 * Check if a student is inactive based on their Codeforces data
 * @param {Object} codeforcesData - CodeforcesData document
 * @param {Date} thresholdDate - Date threshold for inactivity
 * @returns {boolean} True if student is inactive
 */
function isStudentInactive(codeforcesData, thresholdDate) {
  // If no submissions at all, student is inactive
  if (!codeforcesData.submissions || codeforcesData.submissions.length === 0) {
    return true;
  }
  
  // Find the most recent submission
  const submissionDates = codeforcesData.submissions.map(s => new Date(s.submissionTime));
  const lastSubmissionDate = new Date(Math.max(...submissionDates));
  
  // Student is inactive if last submission is before threshold date
  return lastSubmissionDate < thresholdDate;
}

/**
 * Get inactive students
 * @param {number} thresholdDays - Number of days to consider as inactive
 * @returns {Promise<Array>} Array of inactive students
 */
exports.getInactiveStudents = async (thresholdDays = 7) => {
  try {
    const thresholdDate = subDays(new Date(), thresholdDays);
    
    // Find students marked as inactive
    const inactiveStudents = await Student.find({
      'inactivityStatus.isInactive': true
    }).select('_id name email codeforcesHandle currentRating inactivityStatus emailReminders');
    
    return inactiveStudents;
  } catch (error) {
    logger.error('Error getting inactive students:', error);
    throw error;
  }
};

/**
 * Get students who became inactive recently
 * @param {number} withinDays - Number of days to check for new inactivity
 * @returns {Promise<Array>} Array of newly inactive students
 */
exports.getNewlyInactiveStudents = async (withinDays = 1) => {
  try {
    const startDate = subDays(new Date(), withinDays);
    
    // Find students who became inactive within the specified period
    const newlyInactive = await Student.find({
      'inactivityStatus.isInactive': true,
      'inactivityStatus.inactiveSince': { $gte: startDate }
    }).select('_id name email codeforcesHandle currentRating inactivityStatus emailReminders');
    
    return newlyInactive;
  } catch (error) {
    logger.error('Error getting newly inactive students:', error);
    throw error;
  }
};

/**
 * Reset inactivity status for all students (for testing)
 * @returns {Promise<number>} Number of students reset
 */
exports.resetInactivityStatus = async () => {
  try {
    const result = await Student.updateMany(
      {},
      {
        'inactivityStatus.isInactive': false,
        'inactivityStatus.inactiveSince': null
      }
    );
    
    logger.info(`Reset inactivity status for ${result.modifiedCount} students`);
    return result.modifiedCount;
  } catch (error) {
    logger.error('Error resetting inactivity status:', error);
    throw error;
  }
};
