/**
 * Logger Middleware
 * HTTP request/response logging middleware using Winston
 */

const logger = require('../utils/logger');

/**
 * Calculate the response time in milliseconds
 * @param {number} start - Start time in [seconds, nanoseconds]
 * @returns {number} Response time in milliseconds
 */
const calculateResponseTime = (start) => {
  const diff = process.hrtime(start);
  return (diff[0] * 1000) + (diff[1] / 1000000);
};

/**
 * Get log level based on status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} Log level (info, warn, or error)
 */
const getLogLevel = (statusCode) => {
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warn';
  return 'info';
};

/**
 * Skip logging for certain paths
 * @param {string} url - Request URL
 * @returns {boolean} True if logging should be skipped
 */
const shouldSkipLogging = (url) => {
  const skipPaths = [
    '/health',
    '/favicon.ico'
  ];
  
  return skipPaths.some(path => url.startsWith(path));
};

/**
 * HTTP request logger middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  // Skip logging for certain paths
  if (shouldSkipLogging(req.originalUrl)) {
    return next();
  }
  
  // Record start time
  const startTime = process.hrtime();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Log request
  logger.debug(`${req.method} ${req.originalUrl} - Request received`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Override end function to log response
  res.end = function(...args) {
    // Calculate response time
    const responseTime = calculateResponseTime(startTime);
    
    // Get appropriate log level based on status code
    const level = getLogLevel(res.statusCode);
    
    // Create log message
    const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime.toFixed(2)}ms`;
    
    // Log with appropriate level
    logger[level](logMessage, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: responseTime.toFixed(2),
      ip: req.ip,
      contentLength: res.getHeader('content-length') || 0
    });
    
    // Call original end function
    originalEnd.apply(res, args);
  };
  
  next();
};

/**
 * Error logger middleware - logs errors before they reach the error handler
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorLogger = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - Error: ${err.message}`, {
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: err.stack,
    ip: req.ip
  });
  
  next(err);
};

module.exports = {
  requestLogger,
  errorLogger
};
