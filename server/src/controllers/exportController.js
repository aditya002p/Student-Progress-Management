const { Parser } = require('json2csv');
const Student = require('../models/Student');
const CodeforcesData = require('../models/CodeforcesData');
const EmailLog = require('../models/EmailLog');
const logger = require('../utils/logger');
const { subDays } = require('date-fns');

/**
 * Export Controller
 * Handles all data export functionality for the Student Progress Management System
 */

// Helper function to send CSV response
const sendCsvResponse = (res, data, fields, filename) => {
  try {
    // Create CSV parser with options
    const parser = new Parser({ fields });
    
    // Parse data to CSV
    const csv = parser.parse(data);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    // Send CSV data
    res.status(200).send(csv);
  } catch (error) {
    logger.error('Error generating CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating CSV file',
      error: error.message
    });
  }
};

// Export all students as CSV
exports.exportStudentsCSV = async (req, res, next) => {
  try {
    // Get all students
    const students = await Student.find().lean();
    
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students found'
      });
    }
    
    // Define CSV fields
    const fields = [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Phone Number', value: 'phoneNumber' },
      { label: 'Codeforces Handle', value: 'codeforcesHandle' },
      { label: 'Current Rating', value: 'currentRating' },
      { label: 'Max Rating', value: 'maxRating' },
      { label: 'Last Data Update', value: row => row.lastDataUpdate ? new Date(row.lastDataUpdate).toISOString() : 'Never' },
      { label: 'Reminders Enabled', value: row => row.emailReminders.enabled ? 'Yes' : 'No' },
      { label: 'Reminder Count', value: 'emailReminders.count' },
      { label: 'Inactive', value: row => row.inactivityStatus.isInactive ? 'Yes' : 'No' },
      { label: 'Inactive Since', value: row => row.inactivityStatus.inactiveSince ? new Date(row.inactivityStatus.inactiveSince).toISOString() : 'N/A' },
      { label: 'Created At', value: row => new Date(row.createdAt).toISOString() }
    ];
    
    // Generate filename with date
    const filename = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Send CSV response
    sendCsvResponse(res, students, fields, filename);
  } catch (error) {
    logger.error('Error exporting students:', error);
    next(error);
  }
};

// Export a student's Codeforces data as CSV
exports.exportStudentCodeforcesDataCSV = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get Codeforces data
    const codeforcesData = await CodeforcesData.findOne({ student: id });
    if (!codeforcesData) {
      return res.status(404).json({
        success: false,
        message: 'No Codeforces data found for this student'
      });
    }
    
    // Prepare data for export - include overall statistics
    const exportData = [{
      name: student.name,
      email: student.email,
      handle: codeforcesData.handle,
      currentRating: student.currentRating,
      maxRating: student.maxRating,
      totalSolved: codeforcesData.statistics.totalSolved,
      averageRating: codeforcesData.statistics.averageRating?.toFixed(2) || 0,
      last7DaysSolved: codeforcesData.statistics.last7Days?.solved || 0,
      last30DaysSolved: codeforcesData.statistics.last30Days?.solved || 0,
      last90DaysSolved: codeforcesData.statistics.last90Days?.solved || 0,
      mostDifficultProblem: codeforcesData.statistics.mostDifficultProblem?.problemName || 'None',
      mostDifficultRating: codeforcesData.statistics.mostDifficultProblem?.rating || 0,
      totalContests: codeforcesData.contests.length,
      lastDataUpdate: codeforcesData.lastUpdated ? new Date(codeforcesData.lastUpdated).toISOString() : 'Never',
      lastSubmission: codeforcesData.lastSubmissionDate ? new Date(codeforcesData.lastSubmissionDate).toISOString() : 'Never'
    }];
    
    // Define CSV fields
    const fields = [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Codeforces Handle', value: 'handle' },
      { label: 'Current Rating', value: 'currentRating' },
      { label: 'Max Rating', value: 'maxRating' },
      { label: 'Total Problems Solved', value: 'totalSolved' },
      { label: 'Average Problem Rating', value: 'averageRating' },
      { label: 'Problems Solved (Last 7 Days)', value: 'last7DaysSolved' },
      { label: 'Problems Solved (Last 30 Days)', value: 'last30DaysSolved' },
      { label: 'Problems Solved (Last 90 Days)', value: 'last90DaysSolved' },
      { label: 'Most Difficult Problem', value: 'mostDifficultProblem' },
      { label: 'Most Difficult Rating', value: 'mostDifficultRating' },
      { label: 'Total Contests', value: 'totalContests' },
      { label: 'Last Data Update', value: 'lastDataUpdate' },
      { label: 'Last Submission', value: 'lastSubmission' }
    ];
    
    // Generate filename
    const filename = `codeforces_data_${student.codeforcesHandle}_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Send CSV response
    sendCsvResponse(res, exportData, fields, filename);
  } catch (error) {
    logger.error(`Error exporting Codeforces data for student ${req.params.id}:`, error);
    next(error);
  }
};

// Export a student's contest history as CSV
exports.exportStudentContestsCSV = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { days } = req.query; // Optional filter by days
    
    // Find student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get Codeforces data
    const codeforcesData = await CodeforcesData.findOne({ student: id });
    if (!codeforcesData || !codeforcesData.contests || codeforcesData.contests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No contest history found for this student'
      });
    }
    
    // Filter contests by date if days parameter is provided
    let contests = codeforcesData.contests;
    if (days) {
      const daysNum = parseInt(days, 10);
      const startDate = subDays(new Date(), daysNum);
      
      contests = contests.filter(contest => {
        const contestDate = new Date(contest.date);
        return contestDate >= startDate;
      });
    }
    
    // Sort contests by date (newest first)
    contests.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Prepare data for export
    const exportData = contests.map(contest => ({
      contestId: contest.contestId,
      contestName: contest.contestName,
      date: new Date(contest.date).toISOString(),
      rank: contest.rank,
      oldRating: contest.oldRating,
      newRating: contest.newRating,
      ratingChange: contest.ratingChange,
      unsolvedProblems: contest.unsolvedProblems
    }));
    
    // Define CSV fields
    const fields = [
      { label: 'Contest ID', value: 'contestId' },
      { label: 'Contest Name', value: 'contestName' },
      { label: 'Date', value: 'date' },
      { label: 'Rank', value: 'rank' },
      { label: 'Old Rating', value: 'oldRating' },
      { label: 'New Rating', value: 'newRating' },
      { label: 'Rating Change', value: 'ratingChange' },
      { label: 'Unsolved Problems', value: 'unsolvedProblems' }
    ];
    
    // Generate filename
    const filename = `contests_${student.codeforcesHandle}_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Send CSV response
    sendCsvResponse(res, exportData, fields, filename);
  } catch (error) {
    logger.error(`Error exporting contests for student ${req.params.id}:`, error);
    next(error);
  }
};

// Export a student's submissions as CSV
exports.exportStudentSubmissionsCSV = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { days, verdict } = req.query; // Optional filters
    
    // Find student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get Codeforces data
    const codeforcesData = await CodeforcesData.findOne({ student: id });
    if (!codeforcesData || !codeforcesData.submissions || codeforcesData.submissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No submissions found for this student'
      });
    }
    
    // Apply filters
    let submissions = codeforcesData.submissions;
    
    // Filter by days
    if (days) {
      const daysNum = parseInt(days, 10);
      const startDate = subDays(new Date(), daysNum);
      
      submissions = submissions.filter(submission => {
        const submissionDate = new Date(submission.submissionTime);
        return submissionDate >= startDate;
      });
    }
    
    // Filter by verdict (e.g., OK for accepted submissions)
    if (verdict) {
      submissions = submissions.filter(submission => 
        submission.verdict.toLowerCase() === verdict.toLowerCase()
      );
    }
    
    // Sort submissions by date (newest first)
    submissions.sort((a, b) => new Date(b.submissionTime) - new Date(a.submissionTime));
    
    // Prepare data for export
    const exportData = submissions.map(submission => ({
      submissionId: submission.submissionId,
      problemId: submission.problemId,
      problemName: submission.problemName,
      contestId: submission.contestId || 'N/A',
      problemRating: submission.problemRating || 'Unrated',
      verdict: submission.verdict,
      language: submission.language,
      submissionTime: new Date(submission.submissionTime).toISOString(),
      tags: submission.tags ? submission.tags.join(', ') : ''
    }));
    
    // Define CSV fields
    const fields = [
      { label: 'Submission ID', value: 'submissionId' },
      { label: 'Problem ID', value: 'problemId' },
      { label: 'Problem Name', value: 'problemName' },
      { label: 'Contest ID', value: 'contestId' },
      { label: 'Problem Rating', value: 'problemRating' },
      { label: 'Verdict', value: 'verdict' },
      { label: 'Language', value: 'language' },
      { label: 'Submission Time', value: 'submissionTime' },
      { label: 'Tags', value: 'tags' }
    ];
    
    // Generate filename
    const filename = `submissions_${student.codeforcesHandle}_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Send CSV response
    sendCsvResponse(res, exportData, fields, filename);
  } catch (error) {
    logger.error(`Error exporting submissions for student ${req.params.id}:`, error);
    next(error);
  }
};

// Export a student's solved problems as CSV
exports.exportStudentProblemsCSV = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { days } = req.query; // Optional filter by days
    
    // Find student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get Codeforces data
    const codeforcesData = await CodeforcesData.findOne({ student: id });
    if (!codeforcesData || !codeforcesData.submissions || codeforcesData.submissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No submissions found for this student'
      });
    }
    
    // Filter accepted submissions
    let acceptedSubmissions = codeforcesData.submissions.filter(
      submission => submission.verdict === 'OK'
    );
    
    // Filter by days if provided
    if (days) {
      const daysNum = parseInt(days, 10);
      const startDate = subDays(new Date(), daysNum);
      
      acceptedSubmissions = acceptedSubmissions.filter(submission => {
        const submissionDate = new Date(submission.submissionTime);
        return submissionDate >= startDate;
      });
    }
    
    // Create a map to track unique problems (keep only the first accepted submission for each problem)
    const uniqueProblems = new Map();
    
    acceptedSubmissions.forEach(submission => {
      const problemId = submission.problemId;
      if (!uniqueProblems.has(problemId)) {
        uniqueProblems.set(problemId, submission);
      }
    });
    
    // Convert map to array and sort by rating (highest first)
    const problems = Array.from(uniqueProblems.values())
      .sort((a, b) => (b.problemRating || 0) - (a.problemRating || 0));
    
    // Prepare data for export
    const exportData = problems.map(problem => ({
      problemId: problem.problemId,
      problemName: problem.problemName,
      contestId: problem.contestId || 'N/A',
      rating: problem.problemRating || 'Unrated',
      solvedOn: new Date(problem.submissionTime).toISOString(),
      tags: problem.tags ? problem.tags.join(', ') : ''
    }));
    
    // Define CSV fields
    const fields = [
      { label: 'Problem ID', value: 'problemId' },
      { label: 'Problem Name', value: 'problemName' },
      { label: 'Contest ID', value: 'contestId' },
      { label: 'Rating', value: 'rating' },
      { label: 'Solved On', value: 'solvedOn' },
      { label: 'Tags', value: 'tags' }
    ];
    
    // Generate filename
    const filename = `solved_problems_${student.codeforcesHandle}_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Send CSV response
    sendCsvResponse(res, exportData, fields, filename);
  } catch (error) {
    logger.error(`Error exporting solved problems for student ${req.params.id}:`, error);
    next(error);
  }
};

// Export inactive students report as CSV
exports.exportInactiveStudentsCSV = async (req, res, next) => {
  try {
    const { days = 7 } = req.query; // Default to 7 days of inactivity
    const daysNum = parseInt(days, 10);
    
    // Find inactive students
    const inactiveStudents = await Student.find({
      'inactivityStatus.isInactive': true
    }).lean();
    
    if (inactiveStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No inactive students found'
      });
    }
    
    // Prepare data for export
    const exportData = await Promise.all(inactiveStudents.map(async (student) => {
      // Get last submission date from Codeforces data
      const codeforcesData = await CodeforcesData.findOne({ student: student._id });
      const lastSubmissionDate = codeforcesData?.lastSubmissionDate || null;
      
      // Calculate days since last submission
      let daysSinceLastSubmission = null;
      if (lastSubmissionDate) {
        daysSinceLastSubmission = Math.floor(
          (new Date() - new Date(lastSubmissionDate)) / (1000 * 60 * 60 * 24)
        );
      }
      
      // Calculate days since marked inactive
      let daysSinceInactive = null;
      if (student.inactivityStatus.inactiveSince) {
        daysSinceInactive = Math.floor(
          (new Date() - new Date(student.inactivityStatus.inactiveSince)) / (1000 * 60 * 60 * 24)
        );
      }
      
      return {
        name: student.name,
        email: student.email,
        codeforcesHandle: student.codeforcesHandle,
        currentRating: student.currentRating,
        maxRating: student.maxRating,
        remindersSent: student.emailReminders.count,
        remindersEnabled: student.emailReminders.enabled ? 'Yes' : 'No',
        lastReminderDate: student.emailReminders.lastSent ? 
          new Date(student.emailReminders.lastSent).toISOString() : 'Never',
        inactiveSince: student.inactivityStatus.inactiveSince ? 
          new Date(student.inactivityStatus.inactiveSince).toISOString() : 'Unknown',
        daysSinceInactive: daysSinceInactive || 'Unknown',
        lastSubmissionDate: lastSubmissionDate ? 
          new Date(lastSubmissionDate).toISOString() : 'Unknown',
        daysSinceLastSubmission: daysSinceLastSubmission || 'Unknown'
      };
    }));
    
    // Sort by days since last submission (descending)
    exportData.sort((a, b) => {
      const daysA = a.daysSinceLastSubmission === 'Unknown' ? 0 : a.daysSinceLastSubmission;
      const daysB = b.daysSinceLastSubmission === 'Unknown' ? 0 : b.daysSinceLastSubmission;
      return daysB - daysA;
    });
    
    // Define CSV fields
    const fields = [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Codeforces Handle', value: 'codeforcesHandle' },
      { label: 'Current Rating', value: 'currentRating' },
      { label: 'Max Rating', value: 'maxRating' },
      { label: 'Reminders Sent', value: 'remindersSent' },
      { label: 'Reminders Enabled', value: 'remindersEnabled' },
      { label: 'Last Reminder Date', value: 'lastReminderDate' },
      { label: 'Inactive Since', value: 'inactiveSince' },
      { label: 'Days Since Marked Inactive', value: 'daysSinceInactive' },
      { label: 'Last Submission Date', value: 'lastSubmissionDate' },
      { label: 'Days Since Last Submission', value: 'daysSinceLastSubmission' }
    ];
    
    // Generate filename
    const filename = `inactive_students_${daysNum}days_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Send CSV response
    sendCsvResponse(res, exportData, fields, filename);
  } catch (error) {
    logger.error('Error exporting inactive students:', error);
    next(error);
  }
};

// Export email reminder history as CSV
exports.exportEmailHistoryCSV = async (req, res, next) => {
  try {
    const { studentId, days } = req.query; // Optional filters
    
    // Build filter
    const filter = { emailType: 'inactivityReminder' };
    
    // Filter by student if provided
    if (studentId) {
      filter.student = studentId;
    }
    
    // Filter by days if provided
    if (days) {
      const daysNum = parseInt(days, 10);
      const startDate = subDays(new Date(), daysNum);
      filter.sentAt = { $gte: startDate };
    }
    
    // Get email logs
    const emailLogs = await EmailLog.find(filter)
      .sort({ sentAt: -1 })
      .populate('student', 'name email codeforcesHandle')
      .lean();
    
    if (emailLogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No email history found'
      });
    }
    
    // Prepare data for export
    const exportData = emailLogs.map(log => ({
      studentName: log.student ? log.student.name : 'Unknown',
      studentEmail: log.student ? log.student.email : log.recipientEmail,
      codeforcesHandle: log.student ? log.student.codeforcesHandle : 'Unknown',
      emailType: log.emailType,
      subject: log.subject,
      sentAt: new Date(log.sentAt).toISOString(),
      status: log.status,
      reminderCount: log.inactivityData ? log.inactivityData.reminderCount : 'N/A',
      daysSinceLastSubmission: log.inactivityData ? log.inactivityData.daysSinceLastSubmission : 'N/A'
    }));
    
    // Define CSV fields
    const fields = [
      { label: 'Student Name', value: 'studentName' },
      { label: 'Student Email', value: 'studentEmail' },
      { label: 'Codeforces Handle', value: 'codeforcesHandle' },
      { label: 'Email Type', value: 'emailType' },
      { label: 'Subject', value: 'subject' },
      { label: 'Sent At', value: 'sentAt' },
      { label: 'Status', value: 'status' },
      { label: 'Reminder Count', value: 'reminderCount' },
      { label: 'Days Since Last Submission', value: 'daysSinceLastSubmission' }
    ];
    
    // Generate filename
    const filename = `email_history_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Send CSV response
    sendCsvResponse(res, exportData, fields, filename);
  } catch (error) {
    logger.error('Error exporting email history:', error);
    next(error);
  }
};
