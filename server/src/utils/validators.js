/**
 * Validators
 * Utility functions for validating input data throughout the application
 */

const mongoose = require('mongoose');

/**
 * Check if a string is a valid email address
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(String(email).toLowerCase());
};

/**
 * Check if a string is a valid phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid
 */
const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  
  // Allow various phone number formats
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(String(phone));
};

/**
 * Check if a string is a valid Codeforces handle
 * @param {string} handle - Codeforces handle to validate
 * @returns {boolean} True if handle is valid
 */
const isValidCodeforcesHandle = (handle) => {
  if (!handle) return false;
  
  // Codeforces handles can contain letters, digits, underscores, and hyphens
  // Length is typically between 3 and 24 characters
  const handleRegex = /^[a-zA-Z0-9._-]{3,24}$/;
  return handleRegex.test(String(handle));
};

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if ID is a valid ObjectId
 */
const isValidObjectId = (id) => {
  if (!id) return false;
  
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Check if a value is a valid number within specified range
 * @param {number|string} value - Value to validate
 * @param {number} min - Minimum allowed value (inclusive)
 * @param {number} max - Maximum allowed value (inclusive)
 * @returns {boolean} True if value is valid
 */
const isValidNumberInRange = (value, min, max) => {
  if (value === null || value === undefined) return false;
  
  const num = Number(value);
  if (isNaN(num)) return false;
  
  return num >= min && num <= max;
};

/**
 * Check if a string is a valid cron expression
 * @param {string} expression - Cron expression to validate
 * @returns {boolean} True if expression is valid
 */
const isValidCronExpression = (expression) => {
  if (!expression) return false;
  
  try {
    // Simple validation - checks if the expression has the correct number of parts
    // For more comprehensive validation, a cron parser library would be used
    const parts = expression.split(' ');
    
    // Standard cron has 5 parts, some implementations use 6 (with seconds)
    if (parts.length < 5 || parts.length > 6) {
      return false;
    }
    
    // Check each part for valid characters
    const validChars = /^[0-9/*,\-]+$/;
    for (const part of parts) {
      if (!validChars.test(part)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check if a string is a valid date string
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if date string is valid
 */
const isValidDateString = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Check if a value is a valid positive integer
 * @param {number|string} value - Value to validate
 * @returns {boolean} True if value is a valid positive integer
 */
const isPositiveInteger = (value) => {
  if (value === null || value === undefined) return false;
  
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num) && num > 0;
};

/**
 * Check if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 */
const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check if a string contains only alphanumeric characters
 * @param {string} str - String to validate
 * @returns {boolean} True if string is alphanumeric
 */
const isAlphanumeric = (str) => {
  if (!str) return false;
  
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(String(str));
};

/**
 * Check if a string is a valid timezone identifier
 * @param {string} timezone - Timezone to validate
 * @returns {boolean} True if timezone is valid
 */
const isValidTimezone = (timezone) => {
  if (!timezone) return false;
  
  try {
    // Use Intl.DateTimeFormat to check if timezone is valid
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Sanitize a string by removing potentially dangerous characters
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (!str) return '';
  
  // Remove HTML tags and special characters
  return String(str)
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s.,\-:;?!()[\]{}@]/g, '');
};

/**
 * Validate a Codeforces contest ID
 * @param {number|string} contestId - Contest ID to validate
 * @returns {boolean} True if contest ID is valid
 */
const isValidContestId = (contestId) => {
  if (contestId === null || contestId === undefined) return false;
  
  const num = Number(contestId);
  // Contest IDs are positive integers, typically below 2000
  return !isNaN(num) && Number.isInteger(num) && num > 0;
};

/**
 * Validate a Codeforces problem index (e.g., "A", "B1", "C2")
 * @param {string} index - Problem index to validate
 * @returns {boolean} True if problem index is valid
 */
const isValidProblemIndex = (index) => {
  if (!index) return false;
  
  // Problem indexes typically start with a letter followed by an optional number
  const indexRegex = /^[A-Z][0-9]*$/;
  return indexRegex.test(String(index));
};

/**
 * Check if an array contains only valid items based on a validation function
 * @param {Array} array - Array to validate
 * @param {Function} validationFn - Function to validate each item
 * @returns {boolean} True if all items are valid
 */
const isValidArray = (array, validationFn) => {
  if (!Array.isArray(array)) return false;
  if (array.length === 0) return true;
  
  return array.every(item => validationFn(item));
};

/**
 * Validate a rating value from Codeforces
 * @param {number|string} rating - Rating to validate
 * @returns {boolean} True if rating is valid
 */
const isValidRating = (rating) => {
  if (rating === null || rating === undefined) return false;
  
  const num = Number(rating);
  // Codeforces ratings are typically between 0 and 4000
  return !isNaN(num) && num >= 0 && num <= 4000;
};

/**
 * Truncate a string to a maximum length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
const truncateString = (str, maxLength = 100) => {
  if (!str) return '';
  
  const string = String(str);
  if (string.length <= maxLength) return string;
  
  return string.substring(0, maxLength) + '...';
};

module.exports = {
  isValidEmail,
  isValidPhoneNumber,
  isValidCodeforcesHandle,
  isValidObjectId,
  isValidNumberInRange,
  isValidCronExpression,
  isValidDateString,
  isPositiveInteger,
  isValidUrl,
  isAlphanumeric,
  isValidTimezone,
  sanitizeString,
  isValidContestId,
  isValidProblemIndex,
  isValidArray,
  isValidRating,
  truncateString
};
