/**
 * Student Progress Management System
 * Main server entry point
 */

require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { setupCronJobs } = require('./src/jobs/dataSync');

// Environment variables
const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-progress-db';

// Create HTTP server
const server = http.createServer(app);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    
    // Start the server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      
      // Setup cron jobs after server starts
      setupCronJobs();
      logger.info('Cron jobs scheduled');
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  
  // Close server & exit process
  server.close(() => {
    logger.info('Server closed due to unhandled promise rejection');
    process.exit(1);
  });
});

// Handle server shutdown signals
const shutdownGracefully = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
  
  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
process.on('SIGINT', () => shutdownGracefully('SIGINT'));
