/**
 * Global Error Handler Middleware
 * Handles all errors thrown during request processing and formats responses
 */

const logger = require('../utils/logger');

/**
 * Error handler middleware
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = [];
  
  // Log the error
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message}`, {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      stack: err.stack,
      body: req.body
    });
  } else {
    logger.warn(`${statusCode} - ${message}`, {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    
    // Format mongoose validation errors
    errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
  }
  
  // Handle Mongoose duplicate key errors
  else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate Key Error';
    
    // Get the field name from the error message
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    errors = [{
      field,
      message: `${field} '${value}' already exists`
    }];
  }
  
  // Handle Mongoose CastError (invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID Format';
    
    errors = [{
      field: err.path,
      message: `Invalid ${err.kind}`
    }];
  }
  
  // Handle express-validator errors
  else if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    message = 'Validation Error';
    
    // Format express-validator errors
    errors = err.array().map(error => ({
      field: error.param,
      message: error.msg
    }));
  }
  
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid Token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token Expired';
  }
  
  // Handle file upload errors
  else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large';
  }
  else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
  }
  
  // Prepare the error response
  const errorResponse = {
    success: false,
    status: statusCode,
    message,
    errors: errors.length > 0 ? errors : undefined,
    // Include stack trace in development mode only
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };

  // Send the error response
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
