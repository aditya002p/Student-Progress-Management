/**
 * @fileoverview Type definitions for Student data
 * 
 * This file contains type definitions for Student objects used throughout
 * the Student Progress Management System.
 */

/**
 * @typedef {Object} EmailReminders
 * @property {boolean} enabled - Whether email reminders are enabled for this student
 * @property {number} count - Number of reminders sent so far
 * @property {Date|string|null} lastSent - Date when the last reminder was sent
 */

/**
 * @typedef {Object} InactivityStatus
 * @property {boolean} isInactive - Whether the student is currently inactive
 * @property {Date|string|null} inactiveSince - Date when the student was marked inactive
 */

/**
 * @typedef {Object} Student
 * @property {string} _id - MongoDB ObjectId of the student
 * @property {string} name - Full name of the student
 * @property {string} email - Email address of the student
 * @property {string} [phoneNumber] - Phone number of the student (optional)
 * @property {string} codeforcesHandle - Codeforces handle of the student
 * @property {number} currentRating - Current Codeforces rating
 * @property {number} maxRating - Maximum Codeforces rating achieved
 * @property {Date|string|null} lastDataUpdate - When Codeforces data was last updated
 * @property {EmailReminders} emailReminders - Email reminder settings and history
 * @property {InactivityStatus} inactivityStatus - Student's inactivity status
 * @property {string} [notes] - Additional notes about the student (optional)
 * @property {Date|string} createdAt - When the student record was created
 * @property {Date|string} updatedAt - When the student record was last updated
 */

/**
 * @typedef {Object} StudentListItem
 * @property {string} _id - MongoDB ObjectId of the student
 * @property {string} name - Full name of the student
 * @property {string} email - Email address of the student
 * @property {string} codeforcesHandle - Codeforces handle of the student
 * @property {number} currentRating - Current Codeforces rating
 * @property {number} maxRating - Maximum Codeforces rating achieved
 * @property {Date|string|null} lastDataUpdate - When Codeforces data was last updated
 * @property {boolean} isInactive - Whether the student is currently inactive
 */

/**
 * @typedef {Object} NewStudent
 * @property {string} name - Full name of the student
 * @property {string} email - Email address of the student
 * @property {string} [phoneNumber] - Phone number of the student (optional)
 * @property {string} codeforcesHandle - Codeforces handle of the student
 * @property {string} [notes] - Additional notes about the student (optional)
 */

/**
 * @typedef {Object} UpdateStudent
 * @property {string} [name] - Full name of the student
 * @property {string} [email] - Email address of the student
 * @property {string} [phoneNumber] - Phone number of the student
 * @property {string} [codeforcesHandle] - Codeforces handle of the student
 * @property {string} [notes] - Additional notes about the student
 * @property {boolean} [emailReminders.enabled] - Whether email reminders are enabled
 */

/**
 * @typedef {Object} StudentListResponse
 * @property {boolean} success - Whether the request was successful
 * @property {number} count - Number of students returned
 * @property {number} totalCount - Total number of students matching the query
 * @property {number} totalPages - Total number of pages
 * @property {number} currentPage - Current page number
 * @property {StudentListItem[]} data - Array of student list items
 */

/**
 * @typedef {Object} StudentResponse
 * @property {boolean} success - Whether the request was successful
 * @property {Student} data - Student data
 */

// Export the types for use in both frontend and backend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // These are just type definitions, no actual values to export
    // But we export the empty object to allow importing the file
  };
}
