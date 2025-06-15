/**
 * CSV Service
 * Handles generation and parsing of CSV data for import/export functionality
 */

const { Parser, transforms } = require('json2csv');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const logger = require('../utils/logger');

/**
 * Convert data objects to CSV string
 * @param {Array} data - Array of data objects to convert
 * @param {Array} fields - Field definitions for CSV columns
 * @param {Object} options - Additional options for CSV generation
 * @returns {Promise<string>} CSV string
 */
const objectsToCsv = async (data, fields, options = {}) => {
  try {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    if (data.length === 0) {
      // Return header row only if no data
      if (fields && fields.length > 0) {
        const headerFields = fields.map(field => 
          typeof field === 'object' ? field.label : field
        );
        return headerFields.join(',');
      }
      return '';
    }

    // Configure CSV parser
    const parserOptions = {
      fields,
      header: true,
      ...options
    };

    // Add transforms if needed
    if (options.transforms) {
      parserOptions.transforms = options.transforms;
    }

    // Create parser instance
    const parser = new Parser(parserOptions);
    
    // Parse data to CSV
    const csv = parser.parse(data);
    return csv;
  } catch (error) {
    logger.error('Error converting objects to CSV:', error);
    throw error;
  }
};

/**
 * Parse CSV string or file to array of objects
 * @param {string|Buffer|stream.Readable} input - CSV input (string, buffer, or readable stream)
 * @param {Object} options - CSV parsing options
 * @returns {Promise<Array>} Array of parsed objects
 */
const csvToObjects = async (input, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const results = [];
      let source;

      // Create appropriate source stream based on input type
      if (typeof input === 'string') {
        // Check if input is a file path or CSV content
        if (fs.existsSync(input) && input.endsWith('.csv')) {
          source = fs.createReadStream(input);
        } else {
          // Convert string to readable stream
          source = Readable.from([input]);
        }
      } else if (Buffer.isBuffer(input)) {
        source = Readable.from([input]);
      } else if (input instanceof Readable) {
        source = input;
      } else {
        throw new Error('Input must be a string, buffer, or readable stream');
      }

      // Parse CSV
      source
        .pipe(csv(options))
        .on('data', (data) => results.push(data))
        .on('error', (error) => {
          logger.error('Error parsing CSV:', error);
          reject(error);
        })
        .on('end', () => {
          resolve(results);
        });
    } catch (error) {
      logger.error('Error in CSV parsing setup:', error);
      reject(error);
    }
  });
};

/**
 * Write CSV data to a file
 * @param {string} filePath - Path to save the CSV file
 * @param {string} csvData - CSV data string
 * @returns {Promise<string>} Path to the saved file
 */
const writeCsvToFile = async (filePath, csvData) => {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    await fs.promises.writeFile(filePath, csvData, 'utf8');
    logger.info(`CSV file saved: ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error(`Error writing CSV to file ${filePath}:`, error);
    throw error;
  }
};

/**
 * Generate field definitions for common data types
 * @param {string} type - Type of data ('students', 'contests', 'submissions', etc.)
 * @returns {Array} Field definitions for CSV
 */
const getFieldDefinitions = (type) => {
  switch (type) {
    case 'students':
      return [
        { label: 'Name', value: 'name' },
        { label: 'Email', value: 'email' },
        { label: 'Phone Number', value: 'phoneNumber' },
        { label: 'Codeforces Handle', value: 'codeforcesHandle' },
        { label: 'Current Rating', value: 'currentRating' },
        { label: 'Max Rating', value: 'maxRating' },
        { label: 'Last Data Update', value: row => row.lastDataUpdate ? new Date(row.lastDataUpdate).toISOString() : 'Never' },
        { label: 'Reminders Enabled', value: row => row.emailReminders?.enabled ? 'Yes' : 'No' },
        { label: 'Reminder Count', value: 'emailReminders.count' },
        { label: 'Inactive', value: row => row.inactivityStatus?.isInactive ? 'Yes' : 'No' },
        { label: 'Inactive Since', value: row => row.inactivityStatus?.inactiveSince ? new Date(row.inactivityStatus.inactiveSince).toISOString() : 'N/A' },
        { label: 'Created At', value: row => row.createdAt ? new Date(row.createdAt).toISOString() : 'N/A' }
      ];
      
    case 'contests':
      return [
        { label: 'Contest ID', value: 'contestId' },
        { label: 'Contest Name', value: 'contestName' },
        { label: 'Date', value: row => row.date ? new Date(row.date).toISOString() : 'N/A' },
        { label: 'Rank', value: 'rank' },
        { label: 'Old Rating', value: 'oldRating' },
        { label: 'New Rating', value: 'newRating' },
        { label: 'Rating Change', value: 'ratingChange' },
        { label: 'Unsolved Problems', value: 'unsolvedProblems' }
      ];
      
    case 'submissions':
      return [
        { label: 'Submission ID', value: 'submissionId' },
        { label: 'Problem ID', value: 'problemId' },
        { label: 'Problem Name', value: 'problemName' },
        { label: 'Contest ID', value: 'contestId' },
        { label: 'Problem Rating', value: 'problemRating' },
        { label: 'Verdict', value: 'verdict' },
        { label: 'Language', value: 'language' },
        { label: 'Submission Time', value: row => row.submissionTime ? new Date(row.submissionTime).toISOString() : 'N/A' },
        { label: 'Tags', value: row => Array.isArray(row.tags) ? row.tags.join(', ') : row.tags }
      ];
      
    case 'problems':
      return [
        { label: 'Problem ID', value: 'problemId' },
        { label: 'Problem Name', value: 'problemName' },
        { label: 'Contest ID', value: 'contestId' },
        { label: 'Rating', value: 'rating' },
        { label: 'Solved On', value: row => row.solvedOn ? new Date(row.solvedOn).toISOString() : 'N/A' },
        { label: 'Tags', value: row => Array.isArray(row.tags) ? row.tags.join(', ') : row.tags }
      ];
      
    case 'inactiveStudents':
      return [
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
      
    case 'emailHistory':
      return [
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
      
    case 'codeforcesData':
      return [
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
      
    default:
      return [];
  }
};

/**
 * Generate a filename for exported CSV data
 * @param {string} type - Type of data being exported
 * @param {string} identifier - Optional identifier (e.g., student handle)
 * @returns {string} Generated filename
 */
const generateFilename = (type, identifier = '') => {
  const date = new Date().toISOString().split('T')[0];
  const idPart = identifier ? `_${identifier}` : '';
  return `${type}${idPart}_${date}.csv`;
};

module.exports = {
  objectsToCsv,
  csvToObjects,
  writeCsvToFile,
  getFieldDefinitions,
  generateFilename
};
