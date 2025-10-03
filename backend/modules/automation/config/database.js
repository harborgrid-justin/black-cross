/**
 * Database configuration for Automation module
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/black-cross';

let connection = null;

/**
 * Connect to MongoDB database
 */
async function connectDatabase() {
  try {
    if (connection) {
      logger.info('Database already connected');
      return connection;
    }

    logger.info('Connecting to MongoDB...', { uri: MONGODB_URI.replace(/\/\/.*@/, '//***@') });

    connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      connection = null;
    });

    return connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error: error.message });
    connection = null;
    throw error;
  }
}

/**
 * Disconnect from MongoDB database
 */
async function disconnectDatabase() {
  try {
    if (connection) {
      await mongoose.connection.close();
      connection = null;
      logger.info('MongoDB disconnected');
    }
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', { error: error.message });
    throw error;
  }
}

/**
 * Check database connection status
 */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  isConnected
};
