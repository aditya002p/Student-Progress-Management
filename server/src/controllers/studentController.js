const Student = require('../models/Student');
const CodeforcesData = require('../models/CodeforcesData');
const EmailLog = require('../models/EmailLog');
const logger = require('../utils/logger');
const { fetchUserInfo, fetchUserSubmissions, fetchUserContests } = require('../services/codeforcesService');
const { calculateStatistics } = require('../utils/helpers');

/**
 * Student Controller
 * Handles all student-related operations including CRUD and Codeforces data sync
 */

// Get all students with pagination and filtering
exports.getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object from query parameters
    const filter = {};
    if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };
    if (req.query.email) filter.email = { $regex: req.query.email, $options: 'i' };
    if (req.query.codeforcesHandle) filter.codeforcesHandle = { $regex: req.query.codeforcesHandle, $options: 'i' };
    if (req.query.inactive === 'true') filter['inactivityStatus.isInactive'] = true;
    
    // Sort options
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };
    
    // Execute query with pagination
    const students = await Student.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const totalCount = await Student.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: students.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: students
    });
  } catch (error) {
    logger.error('Error fetching students:', error);
    next(error);
  }
};

// Get a single student by ID
exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    logger.error(`Error fetching student with ID ${req.params.id}:`, error);
    next(error);
  }
};

// Create a new student
exports.createStudent = async (req, res, next) => {
  try {
    // Validate Codeforces handle before creating student
    try {
      const userInfo = await fetchUserInfo(req.body.codeforcesHandle);
      if (!userInfo) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Codeforces handle. User not found on Codeforces.'
        });
      }
      
      // Add Codeforces rating data if available
      if (userInfo.rating) {
        req.body.currentRating = userInfo.rating;
        req.body.maxRating = userInfo.maxRating || userInfo.rating;
      }
    } catch (cfError) {
      logger.warn(`Could not validate Codeforces handle ${req.body.codeforcesHandle}:`, cfError);
      // Continue with creation even if CF validation fails
    }
    
    // Create the student
    const student = await Student.create(req.body);
    
    // Schedule Codeforces data fetch (async)
    fetchCodeforcesDataForStudent(student._id, student.codeforcesHandle)
      .catch(err => logger.error(`Failed to fetch initial Codeforces data for ${student.codeforcesHandle}:`, err));
    
    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    logger.error('Error creating student:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A student with this ${field} already exists.`
      });
    }
    
    next(error);
  }
};

// Update a student
exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Check if Codeforces handle is being updated
    const handleChanged = 
      req.body.codeforcesHandle && 
      req.body.codeforcesHandle !== student.codeforcesHandle;
    
    if (handleChanged) {
      // Validate new Codeforces handle
      try {
        const userInfo = await fetchUserInfo(req.body.codeforcesHandle);
        if (!userInfo) {
          return res.status(400).json({
            success: false,
            message: 'Invalid Codeforces handle. User not found on Codeforces.'
          });
        }
        
        // Update rating information from Codeforces
        if (userInfo.rating) {
          req.body.currentRating = userInfo.rating;
          req.body.maxRating = userInfo.maxRating || userInfo.rating;
        }
      } catch (cfError) {
        logger.warn(`Could not validate new Codeforces handle ${req.body.codeforcesHandle}:`, cfError);
        // Continue with update even if CF validation fails
      }
    }
    
    // Update the student
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // If handle changed, fetch new Codeforces data
    if (handleChanged) {
      // Delete old Codeforces data
      await CodeforcesData.deleteOne({ student: student._id });
      
      // Schedule fetch of new data (async)
      fetchCodeforcesDataForStudent(student._id, req.body.codeforcesHandle)
        .catch(err => logger.error(`Failed to fetch Codeforces data for updated handle ${req.body.codeforcesHandle}:`, err));
      
      // Update lastDataUpdate to null to indicate data is being refreshed
      updatedStudent.lastDataUpdate = null;
      await updatedStudent.save();
    }
    
    res.status(200).json({
      success: true,
      data: updatedStudent
    });
  } catch (error) {
    logger.error(`Error updating student with ID ${req.params.id}:`, error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A student with this ${field} already exists.`
      });
    }
    
    next(error);
  }
};

// Delete a student
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Delete the student
    await student.remove();
    
    // Delete associated Codeforces data
    await CodeforcesData.deleteOne({ student: student._id });
    
    // Delete associated email logs
    await EmailLog.deleteMany({ student: student._id });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Error deleting student with ID ${req.params.id}:`, error);
    next(error);
  }
};

// Get student with Codeforces data
exports.getStudentWithCodeforcesData = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get Codeforces data
    const codeforcesData = await CodeforcesData.findOne({ student: student._id });
    
    res.status(200).json({
      success: true,
      data: {
        student,
        codeforcesData: codeforcesData || null
      }
    });
  } catch (error) {
    logger.error(`Error fetching student data with ID ${req.params.id}:`, error);
    next(error);
  }
};

// Toggle email reminders for a student
exports.toggleEmailReminders = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Toggle the enabled flag
    student.emailReminders.enabled = !student.emailReminders.enabled;
    await student.save();
    
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    logger.error(`Error toggling email reminders for student with ID ${req.params.id}:`, error);
    next(error);
  }
};

// Get email reminder history for a student
exports.getEmailReminderHistory = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get email logs for this student
    const emailLogs = await EmailLog.find({ 
      student: student._id,
      emailType: 'inactivityReminder'
    }).sort({ sentAt: -1 });
    
    res.status(200).json({
      success: true,
      count: emailLogs.length,
      data: emailLogs
    });
  } catch (error) {
    logger.error(`Error fetching email history for student with ID ${req.params.id}:`, error);
    next(error);
  }
};

// Force refresh Codeforces data for a student
exports.refreshCodeforcesData = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Start async data fetch
    fetchCodeforcesDataForStudent(student._id, student.codeforcesHandle)
      .catch(err => logger.error(`Failed to refresh Codeforces data for ${student.codeforcesHandle}:`, err));
    
    // Update lastDataUpdate to null to indicate data is being refreshed
    student.lastDataUpdate = null;
    await student.save();
    
    res.status(200).json({
      success: true,
      message: 'Codeforces data refresh initiated',
      data: student
    });
  } catch (error) {
    logger.error(`Error refreshing Codeforces data for student with ID ${req.params.id}:`, error);
    next(error);
  }
};

// Helper function to fetch Codeforces data for a student
async function fetchCodeforcesDataForStudent(studentId, handle) {
  try {
    logger.info(`Fetching Codeforces data for handle: ${handle}`);
    
    // Fetch user info, submissions and contests in parallel
    const [userInfo, submissions, contests] = await Promise.all([
      fetchUserInfo(handle),
      fetchUserSubmissions(handle),
      fetchUserContests(handle)
    ]);
    
    if (!userInfo) {
      throw new Error(`User info not found for handle: ${handle}`);
    }
    
    // Calculate statistics from the fetched data
    const statistics = calculateStatistics(submissions);
    
    // Find existing data or create new
    let codeforcesData = await CodeforcesData.findOne({ student: studentId });
    
    if (codeforcesData) {
      // Update existing data
      codeforcesData.handle = handle;
      codeforcesData.contests = contests;
      codeforcesData.submissions = submissions;
      codeforcesData.statistics = statistics;
      codeforcesData.userInfo = userInfo;
      codeforcesData.lastUpdated = new Date();
      codeforcesData.lastSubmissionDate = submissions.length > 0 ? 
        new Date(Math.max(...submissions.map(s => new Date(s.submissionTime)))) : null;
    } else {
      // Create new data
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
      
      // Check for inactivity
      const isInactive = codeforcesData.isInactiveForDays(7);
      if (isInactive && !student.inactivityStatus.isInactive) {
        student.inactivityStatus.isInactive = true;
        student.inactivityStatus.inactiveSince = new Date();
      } else if (!isInactive && student.inactivityStatus.isInactive) {
        student.inactivityStatus.isInactive = false;
        student.inactivityStatus.inactiveSince = null;
      }
      
      await student.save();
    }
    
    logger.info(`Successfully updated Codeforces data for ${handle}`);
    return codeforcesData;
  } catch (error) {
    logger.error(`Error fetching Codeforces data for handle ${handle}:`, error);
    throw error;
  }
}
