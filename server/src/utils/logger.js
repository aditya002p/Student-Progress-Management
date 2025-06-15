const winston = require('winston');
const { format, transports } = winston;
const path = require('path');
const fs = require('fs');
require('winston-daily-rotate-file');

// Create logs directory if it doesn't exist
const logDir = process.env.LOG_FILE_PATH || path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Define console format (more readable for development)
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

// Define log level based on environment
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Create file transport for rotating logs
const fileRotateTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
  level: logLevel
});

// Create error file transport for rotating logs (errors only)
const errorFileRotateTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
  level: 'error'
});

// Create logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: 'student-progress-api' },
  transports: [
    // Write logs to rotating files
    fileRotateTransport,
    errorFileRotateTransport
  ]
});

// Add console transport in non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: consoleFormat,
    level: logLevel
  }));
} else {
  // In production, still log to console but with JSON format
  logger.add(new transports.Console({
    format: logFormat,
    level: logLevel
  }));
}

// Add event listeners for transport errors
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

// Add shutdown handler to flush logs
const gracefulShutdown = () => {
  logger.info('Logger shutting down...');
  
  // Close all transports
  logger.close();
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = logger;
