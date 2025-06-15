/**
 * Validation Constants
 * 
 * This file contains validation constants, regex patterns, and error messages
 * used for form validation throughout the Student Progress Management System.
 */

// Regular expression patterns for validation
const REGEX_PATTERNS = {
  // Email validation - standard email format
  EMAIL: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  
  // Phone number - allows various formats with optional country code
  PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  
  // Codeforces handle - letters, digits, underscores, hyphens
  CODEFORCES_HANDLE: /^[a-zA-Z0-9._-]{3,24}$/,
  
  // Name - letters, spaces, hyphens, apostrophes
  NAME: /^[a-zA-Z\s'-]{2,100}$/,
  
  // Password - at least 8 chars, 1 uppercase, 1 lowercase, 1 number
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  
  // Cron expression - simple validation for standard cron format
  CRON_EXPRESSION: /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
  
  // MongoDB ObjectId
  OBJECT_ID: /^[0-9a-fA-F]{24}$/,
  
  // URL pattern
  URL: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
};

// Field constraints
const FIELD_CONSTRAINTS = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255
  },
  CODEFORCES_HANDLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 24
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 64
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15
  },
  NOTES: {
    MAX_LENGTH: 1000
  },
  CRON_EXPRESSION: {
    MIN_PARTS: 5,
    MAX_PARTS: 6
  }
};

// Required fields for different entities
const REQUIRED_FIELDS = {
  STUDENT: ['name', 'email', 'codeforcesHandle'],
  CRON_JOB: ['name', 'schedule'],
  EMAIL_TEMPLATE: ['name', 'subject', 'content']
};

// Validation error messages
const ERROR_MESSAGES = {
  REQUIRED: (field) => `${field} is required`,
  MIN_LENGTH: (field, length) => `${field} must be at least ${length} characters`,
  MAX_LENGTH: (field, length) => `${field} cannot exceed ${length} characters`,
  PATTERN: {
    EMAIL: 'Please enter a valid email address',
    PHONE: 'Please enter a valid phone number',
    CODEFORCES_HANDLE: 'Codeforces handle can only contain letters, numbers, underscores, and hyphens',
    NAME: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    PASSWORD: 'Password must contain at least 8 characters, including uppercase, lowercase, and numbers',
    CRON_EXPRESSION: 'Invalid cron schedule expression',
    URL: 'Please enter a valid URL'
  },
  UNIQUE: {
    EMAIL: 'A student with this email already exists',
    CODEFORCES_HANDLE: 'A student with this Codeforces handle already exists'
  },
  INVALID: {
    OBJECT_ID: 'Invalid ID format',
    DATE: 'Please enter a valid date',
    RATING: 'Rating must be a number between 0 and 4000',
    CODEFORCES_HANDLE_NOT_FOUND: 'Codeforces handle not found',
    CRON_EXPRESSION: 'Invalid cron schedule expression'
  },
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.'
};

// Field validation rules for forms
const VALIDATION_RULES = {
  STUDENT: {
    name: {
      required: true,
      minLength: FIELD_CONSTRAINTS.NAME.MIN_LENGTH,
      maxLength: FIELD_CONSTRAINTS.NAME.MAX_LENGTH,
      pattern: REGEX_PATTERNS.NAME
    },
    email: {
      required: true,
      minLength: FIELD_CONSTRAINTS.EMAIL.MIN_LENGTH,
      maxLength: FIELD_CONSTRAINTS.EMAIL.MAX_LENGTH,
      pattern: REGEX_PATTERNS.EMAIL
    },
    phoneNumber: {
      required: false,
      minLength: FIELD_CONSTRAINTS.PHONE.MIN_LENGTH,
      maxLength: FIELD_CONSTRAINTS.PHONE.MAX_LENGTH,
      pattern: REGEX_PATTERNS.PHONE
    },
    codeforcesHandle: {
      required: true,
      minLength: FIELD_CONSTRAINTS.CODEFORCES_HANDLE.MIN_LENGTH,
      maxLength: FIELD_CONSTRAINTS.CODEFORCES_HANDLE.MAX_LENGTH,
      pattern: REGEX_PATTERNS.CODEFORCES_HANDLE
    },
    notes: {
      required: false,
      maxLength: FIELD_CONSTRAINTS.NOTES.MAX_LENGTH
    }
  },
  CRON_JOB: {
    name: {
      required: true,
      validate: (value) => ['codeforcesSync', 'inactivityCheck', 'emailReminder'].includes(value)
    },
    schedule: {
      required: true,
      pattern: REGEX_PATTERNS.CRON_EXPRESSION
    },
    enabled: {
      required: true,
      type: 'boolean'
    },
    timezone: {
      required: false
    }
  }
};

// Export all validation constants
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    REGEX_PATTERNS,
    FIELD_CONSTRAINTS,
    REQUIRED_FIELDS,
    ERROR_MESSAGES,
    VALIDATION_RULES
  };
}
