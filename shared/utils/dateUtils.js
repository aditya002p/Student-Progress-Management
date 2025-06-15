/**
 * Date Utilities
 * Shared date manipulation and formatting functions for both frontend and backend
 */

// Import date-fns functions if available (works in both Node.js and browser)
let dateFns;
try {
  // Try to import date-fns in Node.js environment
  dateFns = require('date-fns');
} catch (e) {
  // In browser without bundling, date-fns should be provided by the application
  dateFns = window.dateFns || null;
}

/**
 * Format a date to a string using the specified format
 * @param {Date|string|number} date - The date to format
 * @param {string} formatStr - Format string (default: 'yyyy-MM-dd')
 * @returns {string} Formatted date string
 */
function formatDate(date, formatStr = 'yyyy-MM-dd') {
  if (!date) return '';
  
  try {
    // Ensure we have a Date object
    const dateObj = parseDate(date);
    if (!isValidDate(dateObj)) return '';
    
    if (dateFns && dateFns.format) {
      return dateFns.format(dateObj, formatStr);
    }
    
    // Fallback if date-fns is not available
    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Parse a date string or timestamp to a Date object
 * @param {string|number|Date} date - Date to parse
 * @returns {Date} Parsed Date object
 */
function parseDate(date) {
  if (!date) return new Date(NaN);
  
  if (date instanceof Date) return date;
  
  if (typeof date === 'number') return new Date(date);
  
  try {
    // Try to parse as ISO string or other formats
    if (dateFns && dateFns.parseISO) {
      const parsed = dateFns.parseISO(date);
      if (isValidDate(parsed)) return parsed;
    }
    
    // Fallback to standard Date constructor
    return new Date(date);
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date(NaN);
  }
}

/**
 * Check if a date is valid
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is valid
 */
function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Get date range for a specified number of days ago until now
 * @param {number} days - Number of days to look back
 * @returns {Object} Object with start and end dates
 */
function getDateRangeForDays(days) {
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  
  return {
    startDate: startOfDay(startDate),
    endDate: endOfDay(endDate)
  };
}

/**
 * Get predefined date ranges for the application
 * @returns {Object} Object with predefined date ranges
 */
function getPredefinedDateRanges() {
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
}

/**
 * Calculate the difference in days between two dates
 * @param {Date|string|number} dateA - First date
 * @param {Date|string|number} dateB - Second date
 * @returns {number} Difference in days
 */
function getDaysDifference(dateA, dateB) {
  try {
    const parsedA = parseDate(dateA);
    const parsedB = parseDate(dateB);
    
    if (!isValidDate(parsedA) || !isValidDate(parsedB)) return null;
    
    if (dateFns && dateFns.differenceInDays) {
      return Math.abs(dateFns.differenceInDays(parsedA, parsedB));
    }
    
    // Fallback calculation
    const diffTime = Math.abs(parsedB - parsedA);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error calculating days difference:', error);
    return null;
  }
}

/**
 * Format a date relative to now (e.g., "2 days ago", "in 3 hours")
 * @param {Date|string|number} date - The date to format
 * @returns {string} Relative time string
 */
function formatRelativeTime(date) {
  try {
    const parsedDate = parseDate(date);
    if (!isValidDate(parsedDate)) return '';
    
    const now = new Date();
    
    if (dateFns && dateFns.formatDistanceToNow) {
      return dateFns.formatDistanceToNow(parsedDate, { addSuffix: true });
    }
    
    // Simple fallback implementation
    const diffDays = getDaysDifference(now, parsedDate);
    const isPast = parsedDate < now;
    
    if (diffDays === 0) {
      return 'today';
    }
    
    return isPast 
      ? `${diffDays} day${diffDays !== 1 ? 's' : ''} ago` 
      : `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
}

/**
 * Check if a date is within a specified range
 * @param {Date|string|number} date - Date to check
 * @param {Date|string|number} startDate - Start of range
 * @param {Date|string|number} endDate - End of range
 * @returns {boolean} True if date is within range
 */
function isDateInRange(date, startDate, endDate) {
  try {
    const parsedDate = parseDate(date);
    const parsedStart = parseDate(startDate);
    const parsedEnd = parseDate(endDate);
    
    if (!isValidDate(parsedDate) || !isValidDate(parsedStart) || !isValidDate(parsedEnd)) {
      return false;
    }
    
    if (dateFns && dateFns.isWithinInterval) {
      return dateFns.isWithinInterval(parsedDate, { start: parsedStart, end: parsedEnd });
    }
    
    // Fallback implementation
    return parsedDate >= parsedStart && parsedDate <= parsedEnd;
  } catch (error) {
    console.error('Error checking if date is in range:', error);
    return false;
  }
}

/**
 * Generate an array of dates between start and end dates
 * @param {Date|string|number} startDate - Start date
 * @param {Date|string|number} endDate - End date
 * @returns {Array<Date>} Array of dates
 */
function generateDateRange(startDate, endDate) {
  try {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (!isValidDate(start) || !isValidDate(end)) {
      return [];
    }
    
    const dates = [];
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  } catch (error) {
    console.error('Error generating date range:', error);
    return [];
  }
}

/**
 * Convert seconds to a Date object
 * @param {number} seconds - Unix timestamp in seconds
 * @returns {Date} Date object
 */
function secondsToDate(seconds) {
  if (!seconds) return null;
  
  try {
    return new Date(seconds * 1000);
  } catch (error) {
    console.error('Error converting seconds to date:', error);
    return null;
  }
}

/**
 * Convert a Date object to seconds (Unix timestamp)
 * @param {Date|string|number} date - Date to convert
 * @returns {number} Unix timestamp in seconds
 */
function dateToSeconds(date) {
  try {
    const parsedDate = parseDate(date);
    if (!isValidDate(parsedDate)) return null;
    
    return Math.floor(parsedDate.getTime() / 1000);
  } catch (error) {
    console.error('Error converting date to seconds:', error);
    return null;
  }
}

/**
 * Get start and end dates for a specific time period
 * @param {string} period - Time period ('7d', '30d', '90d', '365d')
 * @returns {Object} Object with start and end dates
 */
function getDateRangeForPeriod(period) {
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
}

/**
 * Format a date for display in the UI
 * @param {Date|string|number} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
function formatDateForDisplay(date, includeTime = false) {
  if (!date) return 'N/A';
  
  try {
    const parsedDate = parseDate(date);
    if (!isValidDate(parsedDate)) return 'Invalid Date';
    
    const options = includeTime 
      ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { year: 'numeric', month: 'short', day: 'numeric' };
    
    return parsedDate.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return 'Error';
  }
}

/**
 * Check if a date is today
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if date is today
 */
function isToday(date) {
  try {
    const parsedDate = parseDate(date);
    if (!isValidDate(parsedDate)) return false;
    
    if (dateFns && dateFns.isToday) {
      return dateFns.isToday(parsedDate);
    }
    
    // Fallback implementation
    const today = new Date();
    return parsedDate.getDate() === today.getDate() &&
           parsedDate.getMonth() === today.getMonth() &&
           parsedDate.getFullYear() === today.getFullYear();
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
}

/**
 * Subtract days from a date
 * @param {Date|string|number} date - Base date
 * @param {number} days - Number of days to subtract
 * @returns {Date} Resulting date
 */
function subDays(date, days) {
  try {
    const parsedDate = parseDate(date);
    if (!isValidDate(parsedDate)) return new Date();
    
    if (dateFns && dateFns.subDays) {
      return dateFns.subDays(parsedDate, days);
    }
    
    // Fallback implementation
    const result = new Date(parsedDate);
    result.setDate(result.getDate() - days);
    return result;
  } catch (error) {
    console.error('Error subtracting days:', error);
    return new Date();
  }
}

/**
 * Add days to a date
 * @param {Date|string|number} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} Resulting date
 */
function addDays(date, days) {
  try {
    const parsedDate = parseDate(date);
    if (!isValidDate(parsedDate)) return new Date();
    
    if (dateFns && dateFns.addDays) {
      return dateFns.addDays(parsedDate, days);
    }
    
    // Fallback implementation
    const result = new Date(parsedDate);
    result.setDate(result.getDate() + days);
    return result;
  } catch (error) {
    console.error('Error adding days:', error);
    return new Date();
  }
}

/**
 * Get the start of day for a date
 * @param {Date|string|number} date - Date to process
 * @returns {Date} Start of day
 */
function startOfDay(date) {
  try {
    const parsedDate = parseDate(date);
    if (!isValidDate(parsedDate)) return new Date();
    
    if (dateFns && dateFns.startOfDay) {
      return dateFns.startOfDay(parsedDate);
    }
    
    // Fallback implementation
    const result = new Date(parsedDate);
    result.setHours(0, 0, 0, 0);
    return result;
  } catch (error) {
    console.error('Error getting start of day:', error);
    return new Date();
  }
}

/**
 * Get the end of day for a date
 * @param {Date|string|number} date - Date to process
 * @returns {Date} End of day
 */
function endOfDay(date) {
  try {
    const parsedDate = parseDate(date);
    if (!isValidDate(parsedDate)) return new Date();
    
    if (dateFns && dateFns.endOfDay) {
      return dateFns.endOfDay(parsedDate);
    }
    
    // Fallback implementation
    const result = new Date(parsedDate);
    result.setHours(23, 59, 59, 999);
    return result;
  } catch (error) {
    console.error('Error getting end of day:', error);
    return new Date();
  }
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 * @param {Date|string|number} date - Date to format
 * @returns {string} ISO date string
 */
function toISODateString(date) {
  try {
    const parsedDate = parseDate(date);
    if (!isValidDate(parsedDate)) return '';
    
    return parsedDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting to ISO date string:', error);
    return '';
  }
}

/**
 * Get month name from date
 * @param {Date|string|number} date - Date to process
 * @param {boolean} short - Whether to return short month name
 * @returns {string} Month name
 */
function getMonthName(date, short = false) {
  try {
    const parsedDate = parseDate(date);
    if (!isValidDate(parsedDate)) return '';
    
    const months = short ? 
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] :
      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return months[parsedDate.getMonth()];
  } catch (error) {
    console.error('Error getting month name:', error);
    return '';
  }
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatDate,
    parseDate,
    isValidDate,
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
    subDays,
    addDays,
    startOfDay,
    endOfDay,
    toISODateString,
    getMonthName
  };
}
