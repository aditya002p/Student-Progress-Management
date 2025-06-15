/**
 * Validation Schemas
 * 
 * This file contains shared validation schemas for forms used throughout the application.
 * These schemas can be used with validation libraries like Joi (backend) or Yup (frontend).
 */

// Import validation constants if available
let VALIDATION_CONSTANTS;
try {
  // Try to import in Node.js environment
  VALIDATION_CONSTANTS = require('../constants/validation');
} catch (e) {
  // In browser without bundling, constants should be provided by the application
  VALIDATION_CONSTANTS = window.VALIDATION_CONSTANTS || {
    REGEX_PATTERNS: {
      EMAIL: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      CODEFORCES_HANDLE: /^[a-zA-Z0-9._-]{3,24}$/,
      NAME: /^[a-zA-Z\s'-]{2,100}$/,
      CRON_EXPRESSION: /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
      OBJECT_ID: /^[0-9a-fA-F]{24}$/
    },
    FIELD_CONSTRAINTS: {
      NAME: { MIN_LENGTH: 2, MAX_LENGTH: 100 },
      EMAIL: { MIN_LENGTH: 5, MAX_LENGTH: 255 },
      CODEFORCES_HANDLE: { MIN_LENGTH: 3, MAX_LENGTH: 24 },
      PHONE: { MIN_LENGTH: 10, MAX_LENGTH: 15 },
      NOTES: { MAX_LENGTH: 1000 }
    },
    ERROR_MESSAGES: {
      REQUIRED: (field) => `${field} is required`,
      MIN_LENGTH: (field, length) => `${field} must be at least ${length} characters`,
      MAX_LENGTH: (field, length) => `${field} cannot exceed ${length} characters`,
      PATTERN: {
        EMAIL: 'Please enter a valid email address',
        PHONE: 'Please enter a valid phone number',
        CODEFORCES_HANDLE: 'Codeforces handle can only contain letters, numbers, underscores, and hyphens',
        NAME: 'Name can only contain letters, spaces, hyphens, and apostrophes',
        CRON_EXPRESSION: 'Invalid cron schedule expression'
      }
    }
  };
}

/**
 * Create a generic schema object that can be used with different validation libraries
 * @param {Object} schema - Schema definition
 * @returns {Object} Schema object
 */
function createSchema(schema) {
  return schema;
}

/**
 * Student validation schema for create/edit forms
 */
const studentSchema = createSchema({
  name: {
    required: true,
    type: 'string',
    minLength: VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.NAME.MIN_LENGTH,
    maxLength: VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.NAME.MAX_LENGTH,
    pattern: VALIDATION_CONSTANTS.REGEX_PATTERNS.NAME,
    messages: {
      required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('Name'),
      minLength: VALIDATION_CONSTANTS.ERROR_MESSAGES.MIN_LENGTH('Name', VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.NAME.MIN_LENGTH),
      maxLength: VALIDATION_CONSTANTS.ERROR_MESSAGES.MAX_LENGTH('Name', VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.NAME.MAX_LENGTH),
      pattern: VALIDATION_CONSTANTS.ERROR_MESSAGES.PATTERN.NAME
    }
  },
  email: {
    required: true,
    type: 'string',
    minLength: VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.EMAIL.MIN_LENGTH,
    maxLength: VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.EMAIL.MAX_LENGTH,
    pattern: VALIDATION_CONSTANTS.REGEX_PATTERNS.EMAIL,
    messages: {
      required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('Email'),
      minLength: VALIDATION_CONSTANTS.ERROR_MESSAGES.MIN_LENGTH('Email', VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.EMAIL.MIN_LENGTH),
      maxLength: VALIDATION_CONSTANTS.ERROR_MESSAGES.MAX_LENGTH('Email', VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.EMAIL.MAX_LENGTH),
      pattern: VALIDATION_CONSTANTS.ERROR_MESSAGES.PATTERN.EMAIL
    }
  },
  phoneNumber: {
    required: false,
    type: 'string',
    minLength: VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.PHONE.MIN_LENGTH,
    maxLength: VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.PHONE.MAX_LENGTH,
    pattern: VALIDATION_CONSTANTS.REGEX_PATTERNS.PHONE,
    messages: {
      minLength: VALIDATION_CONSTANTS.ERROR_MESSAGES.MIN_LENGTH('Phone number', VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.PHONE.MIN_LENGTH),
      maxLength: VALIDATION_CONSTANTS.ERROR_MESSAGES.MAX_LENGTH('Phone number', VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.PHONE.MAX_LENGTH),
      pattern: VALIDATION_CONSTANTS.ERROR_MESSAGES.PATTERN.PHONE
    }
  },
  codeforcesHandle: {
    required: true,
    type: 'string',
    minLength: VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.CODEFORCES_HANDLE.MIN_LENGTH,
    maxLength: VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.CODEFORCES_HANDLE.MAX_LENGTH,
    pattern: VALIDATION_CONSTANTS.REGEX_PATTERNS.CODEFORCES_HANDLE,
    messages: {
      required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('Codeforces handle'),
      minLength: VALIDATION_CONSTANTS.ERROR_MESSAGES.MIN_LENGTH('Codeforces handle', VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.CODEFORCES_HANDLE.MIN_LENGTH),
      maxLength: VALIDATION_CONSTANTS.ERROR_MESSAGES.MAX_LENGTH('Codeforces handle', VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.CODEFORCES_HANDLE.MAX_LENGTH),
      pattern: VALIDATION_CONSTANTS.ERROR_MESSAGES.PATTERN.CODEFORCES_HANDLE
    }
  },
  notes: {
    required: false,
    type: 'string',
    maxLength: VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.NOTES.MAX_LENGTH,
    messages: {
      maxLength: VALIDATION_CONSTANTS.ERROR_MESSAGES.MAX_LENGTH('Notes', VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.NOTES.MAX_LENGTH)
    }
  }
});

/**
 * Cron job validation schema
 */
const cronJobSchema = createSchema({
  name: {
    required: true,
    type: 'string',
    enum: ['codeforcesSync', 'inactivityCheck', 'emailReminder'],
    messages: {
      required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('Job name'),
      enum: 'Invalid job name. Must be one of: codeforcesSync, inactivityCheck, emailReminder'
    }
  },
  schedule: {
    required: true,
    type: 'string',
    pattern: VALIDATION_CONSTANTS.REGEX_PATTERNS.CRON_EXPRESSION,
    messages: {
      required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('Schedule'),
      pattern: VALIDATION_CONSTANTS.ERROR_MESSAGES.PATTERN.CRON_EXPRESSION
    }
  },
  enabled: {
    required: true,
    type: 'boolean',
    messages: {
      required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('Enabled status')
    }
  },
  timezone: {
    required: false,
    type: 'string'
  },
  config: {
    required: false,
    type: 'object',
    properties: {
      batchSize: {
        type: 'number',
        min: 1,
        max: 100,
        messages: {
          min: 'Batch size must be at least 1',
          max: 'Batch size cannot exceed 100'
        }
      },
      inactivityThresholdDays: {
        type: 'number',
        min: 1,
        max: 30,
        messages: {
          min: 'Inactivity threshold must be at least 1 day',
          max: 'Inactivity threshold cannot exceed 30 days'
        }
      },
      reminderFrequencyDays: {
        type: 'number',
        min: 1,
        max: 30,
        messages: {
          min: 'Reminder frequency must be at least 1 day',
          max: 'Reminder frequency cannot exceed 30 days'
        }
      },
      reminderTemplate: {
        type: 'string'
      },
      reminderSubject: {
        type: 'string'
      }
    }
  }
});

/**
 * Email settings validation schema
 */
const emailSettingsSchema = createSchema({
  enabled: {
    required: true,
    type: 'boolean',
    messages: {
      required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('Email enabled status')
    }
  },
  host: {
    required: true,
    type: 'string',
    messages: {
      required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('SMTP host')
    }
  },
  port: {
    required: true,
    type: 'number',
    min: 1,
    max: 65535,
    messages: {
      required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('SMTP port'),
      min: 'Port must be at least 1',
      max: 'Port cannot exceed 65535'
    }
  },
  secure: {
    required: false,
    type: 'boolean'
  },
  auth: {
    required: true,
    type: 'object',
    properties: {
      user: {
        required: true,
        type: 'string',
        messages: {
          required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('Email username')
        }
      },
      pass: {
        required: true,
        type: 'string',
        messages: {
          required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('Email password')
        }
      }
    }
  },
  from: {
    required: true,
    type: 'string',
    pattern: VALIDATION_CONSTANTS.REGEX_PATTERNS.EMAIL,
    messages: {
      required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('From email address'),
      pattern: VALIDATION_CONSTANTS.ERROR_MESSAGES.PATTERN.EMAIL
    }
  }
});

/**
 * Codeforces handle validation schema
 */
const codeforcesHandleSchema = createSchema({
  handle: {
    required: true,
    type: 'string',
    minLength: VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.CODEFORCES_HANDLE.MIN_LENGTH,
    maxLength: VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.CODEFORCES_HANDLE.MAX_LENGTH,
    pattern: VALIDATION_CONSTANTS.REGEX_PATTERNS.CODEFORCES_HANDLE,
    messages: {
      required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('Codeforces handle'),
      minLength: VALIDATION_CONSTANTS.ERROR_MESSAGES.MIN_LENGTH('Codeforces handle', VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.CODEFORCES_HANDLE.MIN_LENGTH),
      maxLength: VALIDATION_CONSTANTS.ERROR_MESSAGES.MAX_LENGTH('Codeforces handle', VALIDATION_CONSTANTS.FIELD_CONSTRAINTS.CODEFORCES_HANDLE.MAX_LENGTH),
      pattern: VALIDATION_CONSTANTS.ERROR_MESSAGES.PATTERN.CODEFORCES_HANDLE
    }
  }
});

/**
 * ID validation schema
 */
const idSchema = createSchema({
  id: {
    required: true,
    type: 'string',
    pattern: VALIDATION_CONSTANTS.REGEX_PATTERNS.OBJECT_ID,
    messages: {
      required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('ID'),
      pattern: 'Invalid ID format'
    }
  }
});

/**
 * Pagination parameters validation schema
 */
const paginationSchema = createSchema({
  page: {
    required: false,
    type: 'number',
    min: 1,
    default: 1,
    messages: {
      min: 'Page must be at least 1'
    }
  },
  limit: {
    required: false,
    type: 'number',
    min: 1,
    max: 100,
    default: 10,
    messages: {
      min: 'Limit must be at least 1',
      max: 'Limit cannot exceed 100'
    }
  },
  sortField: {
    required: false,
    type: 'string',
    enum: ['name', 'email', 'codeforcesHandle', 'currentRating', 'maxRating', 'createdAt', 'lastDataUpdate'],
    default: 'createdAt',
    messages: {
      enum: 'Invalid sort field'
    }
  },
  sortOrder: {
    required: false,
    type: 'string',
    enum: ['asc', 'desc'],
    default: 'desc',
    messages: {
      enum: 'Sort order must be asc or desc'
    }
  }
});

/**
 * Date range validation schema
 */
const dateRangeSchema = createSchema({
  startDate: {
    required: true,
    type: 'date',
    messages: {
      required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('Start date'),
      type: 'Invalid date format for start date'
    }
  },
  endDate: {
    required: true,
    type: 'date',
    messages: {
      required: VALIDATION_CONSTANTS.ERROR_MESSAGES.REQUIRED('End date'),
      type: 'Invalid date format for end date'
    }
  }
});

/**
 * Time period validation schema (for filtering data)
 */
const timePeriodSchema = createSchema({
  period: {
    required: false,
    type: 'string',
    enum: ['7d', '30d', '90d', '365d', 'all'],
    default: '30d',
    messages: {
      enum: 'Invalid time period. Must be one of: 7d, 30d, 90d, 365d, all'
    }
  }
});

/**
 * Convert schema to Joi schema (for backend)
 * @param {Object} schema - Generic schema object
 * @param {Object} Joi - Joi validation library
 * @returns {Object} Joi schema
 */
function toJoiSchema(schema, Joi) {
  if (!Joi) return null;
  
  const result = {};
  
  Object.entries(schema).forEach(([key, field]) => {
    let joiField;
    
    // Set base type
    switch (field.type) {
      case 'string':
        joiField = Joi.string();
        break;
      case 'number':
        joiField = Joi.number();
        break;
      case 'boolean':
        joiField = Joi.boolean();
        break;
      case 'date':
        joiField = Joi.date();
        break;
      case 'object':
        if (field.properties) {
          joiField = Joi.object(toJoiSchema(field.properties, Joi));
        } else {
          joiField = Joi.object();
        }
        break;
      default:
        joiField = Joi.any();
    }
    
    // Add validations
    if (field.required) {
      joiField = joiField.required();
    }
    
    if (field.minLength) {
      joiField = joiField.min(field.minLength);
    }
    
    if (field.maxLength) {
      joiField = joiField.max(field.maxLength);
    }
    
    if (field.min !== undefined) {
      joiField = joiField.min(field.min);
    }
    
    if (field.max !== undefined) {
      joiField = joiField.max(field.max);
    }
    
    if (field.pattern) {
      joiField = joiField.pattern(field.pattern);
    }
    
    if (field.enum) {
      joiField = joiField.valid(...field.enum);
    }
    
    if (field.default !== undefined) {
      joiField = joiField.default(field.default);
    }
    
    // Add custom messages
    if (field.messages) {
      const messages = {};
      Object.entries(field.messages).forEach(([msgKey, message]) => {
        messages[`${field.type}.${msgKey}`] = message;
      });
      joiField = joiField.messages(messages);
    }
    
    result[key] = joiField;
  });
  
  return result;
}

/**
 * Convert schema to Yup schema (for frontend)
 * @param {Object} schema - Generic schema object
 * @param {Object} yup - Yup validation library
 * @returns {Object} Yup schema
 */
function toYupSchema(schema, yup) {
  if (!yup) return null;
  
  const result = {};
  
  Object.entries(schema).forEach(([key, field]) => {
    let yupField;
    
    // Set base type
    switch (field.type) {
      case 'string':
        yupField = yup.string();
        break;
      case 'number':
        yupField = yup.number();
        break;
      case 'boolean':
        yupField = yup.boolean();
        break;
      case 'date':
        yupField = yup.date();
        break;
      case 'object':
        if (field.properties) {
          yupField = yup.object().shape(toYupSchema(field.properties, yup));
        } else {
          yupField = yup.object();
        }
        break;
      default:
        yupField = yup.mixed();
    }
    
    // Add validations
    if (field.required) {
      yupField = yupField.required(field.messages?.required || `${key} is required`);
    }
    
    if (field.minLength) {
      yupField = yupField.min(field.minLength, field.messages?.minLength || `${key} must be at least ${field.minLength} characters`);
    }
    
    if (field.maxLength) {
      yupField = yupField.max(field.maxLength, field.messages?.maxLength || `${key} cannot exceed ${field.maxLength} characters`);
    }
    
    if (field.min !== undefined) {
      yupField = yupField.min(field.min, field.messages?.min || `${key} must be at least ${field.min}`);
    }
    
    if (field.max !== undefined) {
      yupField = yupField.max(field.max, field.messages?.max || `${key} cannot exceed ${field.max}`);
    }
    
    if (field.pattern) {
      yupField = yupField.matches(field.pattern, field.messages?.pattern || `${key} format is invalid`);
    }
    
    if (field.enum) {
      yupField = yupField.oneOf(field.enum, field.messages?.enum || `${key} must be one of: ${field.enum.join(', ')}`);
    }
    
    if (field.default !== undefined) {
      yupField = yupField.default(field.default);
    }
    
    result[key] = yupField;
  });
  
  return result;
}

/**
 * Convert schema to React Hook Form schema
 * @param {Object} schema - Generic schema object
 * @returns {Object} React Hook Form schema
 */
function toReactHookFormSchema(schema) {
  const result = {};
  
  Object.entries(schema).forEach(([key, field]) => {
    result[key] = {
      required: field.required ? field.messages?.required || `${key} is required` : false,
      minLength: field.minLength ? {
        value: field.minLength,
        message: field.messages?.minLength || `${key} must be at least ${field.minLength} characters`
      } : undefined,
      maxLength: field.maxLength ? {
        value: field.maxLength,
        message: field.messages?.maxLength || `${key} cannot exceed ${field.maxLength} characters`
      } : undefined,
      min: field.min !== undefined ? {
        value: field.min,
        message: field.messages?.min || `${key} must be at least ${field.min}`
      } : undefined,
      max: field.max !== undefined ? {
        value: field.max,
        message: field.messages?.max || `${key} cannot exceed ${field.max}`
      } : undefined,
      pattern: field.pattern ? {
        value: field.pattern,
        message: field.messages?.pattern || `${key} format is invalid`
      } : undefined
    };
    
    // Add type-specific validations
    if (field.type === 'email' || (field.type === 'string' && key === 'email')) {
      result[key].pattern = {
        value: VALIDATION_CONSTANTS.REGEX_PATTERNS.EMAIL,
        message: field.messages?.pattern || VALIDATION_CONSTANTS.ERROR_MESSAGES.PATTERN.EMAIL
      };
    }
    
    // Remove undefined values
    Object.keys(result[key]).forEach(k => {
      if (result[key][k] === undefined) {
        delete result[key][k];
      }
    });
  });
  
  return result;
}

// Export all schemas and conversion functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createSchema,
    studentSchema,
    cronJobSchema,
    emailSettingsSchema,
    codeforcesHandleSchema,
    idSchema,
    paginationSchema,
    dateRangeSchema,
    timePeriodSchema,
    toJoiSchema,
    toYupSchema,
    toReactHookFormSchema
  };
}
