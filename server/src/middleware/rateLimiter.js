/**
 * Rate Limiter Middleware
 * Configures and provides rate limiting middleware to prevent API abuse
 */

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Create a rate limiter with custom configuration
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in minutes
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Error message to send when limit is exceeded
 * @param {string} options.name - Name of the rate limiter for logging
 * @returns {Function} Express middleware function
 */
const createRateLimiter = (options = {}) => {
  const windowMs = (options.windowMs || process.env.RATE_LIMIT_WINDOW_MS || 15) * 60 * 1000; // Convert minutes to ms
  const max = options.max || process.env.RATE_LIMIT_MAX_REQUESTS || 100;
  const name = options.name || 'default';
  
  logger.debug(`Creating rate limiter "${name}": ${max} requests per ${windowMs / 60000} minutes`);
  
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: options.message || 'Too many requests, please try again later',
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded for "${name}": ${req.ip} - ${req.method} ${req.originalUrl}`);
      res.status(options.statusCode).json({
        success: false,
        status: options.statusCode,
        message: options.message,
        retryAfter: Math.ceil(options.windowMs / 1000),
        limit: options.max,
        limitReset: new Date(Date.now() + options.windowMs).toISOString()
      });
    },
    skip: (req, res) => {
      // Skip rate limiting for certain conditions if needed
      // For example, skip for certain IPs or authenticated admin users
      if (process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true') {
        return true;
      }
      return false;
    },
    keyGenerator: (req) => {
      // Use IP address as default key
      return req.ip;
    },
    onLimitReached: (req, res, options) => {
      logger.warn(`Rate limit reached for IP: ${req.ip} on endpoint: ${req.originalUrl}`);
    }
  });
};

// Pre-configured rate limiters for different API endpoints
const limiters = {
  // Default API limiter (100 requests per 15 minutes)
  api: createRateLimiter({ 
    name: 'api',
    windowMs: process.env.API_RATE_LIMIT_WINDOW_MS || 15,
    max: process.env.API_RATE_LIMIT_MAX || 100
  }),
  
  // Stricter limiter for authentication endpoints (20 requests per 15 minutes)
  auth: createRateLimiter({
    name: 'auth',
    windowMs: process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15,
    max: process.env.AUTH_RATE_LIMIT_MAX || 20,
    message: 'Too many authentication attempts, please try again later'
  }),
  
  // Lenient limiter for public endpoints (300 requests per 15 minutes)
  public: createRateLimiter({
    name: 'public',
    windowMs: process.env.PUBLIC_RATE_LIMIT_WINDOW_MS || 15,
    max: process.env.PUBLIC_RATE_LIMIT_MAX || 300
  }),
  
  // Very strict limiter for sensitive operations (5 requests per 15 minutes)
  sensitive: createRateLimiter({
    name: 'sensitive',
    windowMs: process.env.SENSITIVE_RATE_LIMIT_WINDOW_MS || 15,
    max: process.env.SENSITIVE_RATE_LIMIT_MAX || 5,
    message: 'Too many sensitive operations, please try again later'
  }),
  
  // Specific limiter for Codeforces API related endpoints (50 requests per 15 minutes)
  codeforces: createRateLimiter({
    name: 'codeforces',
    windowMs: process.env.CODEFORCES_RATE_LIMIT_WINDOW_MS || 15,
    max: process.env.CODEFORCES_RATE_LIMIT_MAX || 50,
    message: 'Too many Codeforces data requests, please try again later'
  })
};

module.exports = {
  createRateLimiter,
  limiters
};
