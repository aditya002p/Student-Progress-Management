/**
 * Date Utilities
 * Helper functions for date manipulation and formatting throughout the application
 */

const { format, parseISO, isValid, differenceInDays, differenceInHours, 
        differenceInMinutes, addDays, subDays, startOfDay, endOfDay, 
        isBefore, isAfter, isSameDay, isWithinInterval } = require('date-fns');

/**
 * Format a date to a string using the specified format
 * @param {Date|string|number} date - The date to format
 * @param {string} formatStr - Format string (default: 'yyyy-MM-dd')
 * @returns {string} Formatted date string
 */
const formatDate = (date, formatStr = 'yyyy-MM-dd') => {
  if (!date) return '';
  
  try {
    // Ensure we have a Date object
    const dateObj = parseDate(date);
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Parse a date string or timestamp to a Date object
 * @param {string|number|Date} date - Date to parse
 * @returns {Date} Parsed Date object
 */
const parseDate = (date) => {
  if (!date) return new Date(NaN);
  
  if (date instanceof Date) return date;
  
  if (typeof date === 'number') return new Date(date);
  
  try {
    // Try to parse as ISO string
    const parsed = parseISO(date);
    if (isValid(parsed)) return parsed;
    
    // If not valid, try as timestamp
    return new Date(date);
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date(NaN);
  }
};

/**
 * Get date range for a specified number of days ago until now
 * @param {number} days - Number of days to look back
 * @returns {Object} Object with start and end dates
 */
const getDateRangeForDays = (days) => {
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  
  return {
    startDate: startOfDay(startDate),
    endDate: endOfDay(endDate)
  };
};

/**
 * Get predefined date ranges for the application
 * @returns {Object} Object with predefined date ranges
 */
const getPredefinedDateRanges = () => {
  const now = new Date();
  
  return {
    last7Days: {
      startDate: startOfDay(subDays(now, 7)),
      endDate: endOfDay(now),
      label: 'Last 7 Days'
    },
    last30Days: {
      startDate: startOfDay(subDays(now, 30)),
      endDate: endOfDay(now),
      label: 'Last 30 Days'
    },
    last90Days: {
      startDate: startOfDay(subDays(now, 90)),
      endDate: endOfDay(now),
      label: 'Last 90 Days'
    },
    last365Days: {
      startDate: startOfDay(subDays(now, 365)),
      endDate: endOfDay(now),
      label: 'Last 365 Days'
    }
  };
};

/**
 * Calculate the difference in days between two dates
 * @param {Date|string|number} dateA - First date
 * @param {Date|string|number} dateB - Second date
 * @returns {number} Difference in days
 */
const getDaysDifference = (dateA, dateB) => {
  try {
    const parsedA = parseDate(dateA);
    const parsedB = parseDate(dateB);
    
    if (!isValid(parsedA) || !isValid(parsedB)) return null;
    
    return Math.abs(differenceInDays(parsedA, parsedB));
  } catch (error) {
    console.error('Error calculating days difference:', error);
    return null;
  }
};

/**
 * Format a date relative to now (e.g., "2 days ago", "in 3 hours")
 * @param {Date|string|number} date - The date to format
 * @returns {string} Relative time string
 */
const formatRelativeTime = (date) => {
  try {
    const parsedDate = parseDate(date);
    if (!isValid(parsedDate)) return '';
    
    const now = new Date();
    const diffDays = differenceInDays(now, parsedDate);
    
    if (diffDays === 0) {
      // Today, show hours
      const diffHours = differenceInHours(now, parsedDate);
      
      if (diffHours === 0) {
        // Less than an hour, show minutes
        const diffMinutes = differenceInMinutes(now, parsedDate);
        return diffMinutes <= 0 
          ? 'just now' 
          : `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      
      return diffHours < 0 
        ? `in ${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''}` 
        : `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    return diffDays < 0 
      ? `in ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}` 
      : `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * Check if a date is within a specified range
 * @param {Date|string|number} date - Date to check
 * @param {Date|string|number} startDate - Start of range
 * @param {Date|string|number} endDate - End of range
 * @returns {boolean} True if date is within range
 */
const isDateInRange = (date, startDate, endDate) => {
  try {
    const parsedDate = parseDate(date);
    const parsedStart = parseDate(startDate);
    const parsedEnd = parseDate(endDate);
    
    if (!isValid(parsedDate) || !isValid(parsedStart) || !isValid(parsedEnd)) {
      return false;
    }
    
    return isWithinInterval(parsedDate, { start: parsedStart, end: parsedEnd });
  } catch (error) {
    console.error('Error checking if date is in range:', error);
    return false;
  }
};

/**
 * Generate an array of dates between start and end dates
 * @param {Date|string|number} startDate - Start date
 * @param {Date|string|number} endDate - End date
 * @returns {Array<Date>} Array of dates
 */
const generateDateRange = (startDate, endDate) => {
  try {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (!isValid(start) || !isValid(end)) {
      return [];
    }
    
    const dates = [];
    let currentDate = start;
    
    while (!isAfter(currentDate, end)) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  } catch (error) {
    console.error('Error generating date range:', error);
    return [];
  }
};

/**
 * Convert seconds to a Date object
 * @param {number} seconds - Unix timestamp in seconds
 * @returns {Date} Date object
 */
const secondsToDate = (seconds) => {
  if (!seconds) return null;
  
  try {
    return new Date(seconds * 1000);
  } catch (error) {
    console.error('Error converting seconds to date:', error);
    return null;
  }
};

/**
 * Convert a Date object to seconds (Unix timestamp)
 * @param {Date|string|number} date - Date to convert
 * @returns {number} Unix timestamp in seconds
 */
const dateToSeconds = (date) => {
  try {
    const parsedDate = parseDate(date);
    if (!isValid(parsedDate)) return null;
    
    return Math.floor(parsedDate.getTime() / 1000);
  } catch (error) {
    console.error('Error converting date to seconds:', error);
    return null;
  }
};

/**
 * Get start and end dates for a specific time period
 * @param {string} period - Time period ('7d', '30d', '90d', '365d')
 * @returns {Object} Object with start and end dates
 */
const getDateRangeForPeriod = (period) => {
  const endDate = new Date();
  let startDate;
  
  switch (period) {
    case '7d':
      startDate = subDays(endDate, 7);
      break;
    case '30d':
      startDate = subDays(endDate, 30);
      break;
    case '90d':
      startDate = subDays(endDate, 90);
      break;
    case '365d':
      startDate = subDays(endDate, 365);
      break;
    default:
      startDate = subDays(endDate, 30); // Default to 30 days
  }
  
  return {
    startDate: startOfDay(startDate),
    endDate: endOfDay(endDate)
  };
};

/**
 * Format a date for display in the UI
 * @param {Date|string|number} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
const formatDateForDisplay = (date, includeTime = false) => {
  if (!date) return 'N/A';
  
  try {
    const parsedDate = parseDate(date);
    if (!isValid(parsedDate)) return 'Invalid Date';
    
    return includeTime 
      ? format(parsedDate, 'MMM d, yyyy h:mm a')
      : format(parsedDate, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return 'Error';
  }
};

/**
 * Check if a date is today
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if date is today
 */
const isToday = (date) => {
  try {
    const parsedDate = parseDate(date);
    return isSameDay(parsedDate, new Date());
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};

module.exports = {
  formatDate,
  parseDate,
  getDateRangeForDays,
  getPredefinedDateRanges,
  getDaysDifference,
  formatRelativeTime,
  isDateInRange,
  generateDateRange,
  secondsToDate,
  dateToSeconds,
  getDateRangeForPeriod,
  formatDateForDisplay,
  isToday,
  // Re-export useful date-fns functions
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
  isSameDay
};
