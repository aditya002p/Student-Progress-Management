/**
 * @fileoverview Common type definitions used throughout the application
 * 
 * This file contains type definitions for common data structures and patterns
 * used across both frontend and backend of the Student Progress Management System.
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {number} [status] - HTTP status code
 * @property {string} [message] - Response message
 * @property {Object|Array} [data] - Response payload
 * @property {Object[]} [errors] - Array of errors if request failed
 */

/**
 * @typedef {Object} ApiError
 * @property {string} field - Field that caused the error
 * @property {string} message - Error message
 */

/**
 * @typedef {Object} Pagination
 * @property {number} page - Current page number (1-based)
 * @property {number} limit - Number of items per page
 * @property {number} totalItems - Total number of items
 * @property {number} totalPages - Total number of pages
 * @property {boolean} hasNextPage - Whether there is a next page
 * @property {boolean} hasPrevPage - Whether there is a previous page
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {boolean} success - Whether the request was successful
 * @property {number} count - Number of items returned
 * @property {number} totalCount - Total number of items matching the query
 * @property {number} totalPages - Total number of pages
 * @property {number} currentPage - Current page number
 * @property {Array} data - Array of items
 */

/**
 * @typedef {Object} SortOptions
 * @property {string} field - Field to sort by
 * @property {('asc'|'desc')} order - Sort order
 */

/**
 * @typedef {Object} FilterOptions
 * @property {string} field - Field to filter by
 * @property {string} value - Filter value
 * @property {string} [operator='eq'] - Filter operator (eq, neq, gt, lt, gte, lte, contains)
 */

/**
 * @typedef {Object} DateRange
 * @property {Date|string} startDate - Start date
 * @property {Date|string} endDate - End date
 */

/**
 * @typedef {Object} TimeFrame
 * @property {string} label - Display name of the time frame
 * @property {string} value - Value identifier (e.g., '7d', '30d', '90d', '365d')
 * @property {number} days - Number of days in the time frame
 */

/**
 * @typedef {Object} CronJob
 * @property {string} name - Name of the cron job
 * @property {string} schedule - Cron schedule expression
 * @property {boolean} enabled - Whether the job is enabled
 * @property {string} timezone - Timezone for the job
 * @property {Object} config - Job-specific configuration
 * @property {Date|string|null} lastRunAt - When the job was last run
 * @property {Date|string|null} nextRunAt - When the job will next run
 * @property {Object} lastStatus - Status of the last run
 * @property {Array} history - Job execution history
 */

/**
 * @typedef {Object} EmailTemplate
 * @property {string} name - Template name
 * @property {string} subject - Default subject line
 * @property {string} content - HTML content of the template
 */

/**
 * @typedef {Object} EmailLog
 * @property {string} _id - MongoDB ObjectId
 * @property {string} student - Reference to student
 * @property {string} recipientEmail - Email address of the recipient
 * @property {string} emailType - Type of email (inactivityReminder, welcome, etc.)
 * @property {string} subject - Email subject line
 * @property {string} content - Email content
 * @property {string} template - Template used
 * @property {string} status - Delivery status
 * @property {Date|string} sentAt - When the email was sent
 * @property {Object} [inactivityData] - Data related to inactivity reminders
 */

/**
 * @typedef {Object} ChartData
 * @property {Array} labels - Chart labels
 * @property {Array} datasets - Chart datasets
 * @property {Object} [options] - Chart options
 */

/**
 * @typedef {Object} ThemeConfig
 * @property {('light'|'dark')} mode - Theme mode
 * @property {Object} colors - Theme colors
 * @property {string} colors.primary - Primary color
 * @property {string} colors.secondary - Secondary color
 * @property {string} colors.background - Background color
 * @property {string} colors.text - Text color
 * @property {string} colors.error - Error color
 * @property {string} colors.success - Success color
 * @property {string} colors.warning - Warning color
 * @property {string} colors.info - Info color
 */

/**
 * @typedef {Object} ExportOptions
 * @property {string} format - Export format (csv, json, etc.)
 * @property {string[]} fields - Fields to include in export
 * @property {string} [filename] - Custom filename
 * @property {boolean} [includeHeaders=true] - Whether to include headers in CSV
 */

// Export the types for use in both frontend and backend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // These are just type definitions, no actual values to export
    // But we export the empty object to allow importing the file
  };
}
