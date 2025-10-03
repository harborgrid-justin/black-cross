/**
 * Database configuration for Collaboration module
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackcross';

let connection = null;

/**
 * Connect to MongoDB database
 */
async function connectDatabase() {
  if (connection) {
    logger.info('Database already connected');
    return connection;
  }

  try {
    connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Collaboration module database connected', {
      host: connection.connection.host,
      name: connection.connection.name,
    });

    return connection;
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    throw error;
  }
}

/**
 * Disconnect from database
 */
async function disconnectDatabase() {
  if (connection) {
    await mongoose.disconnect();
    connection = null;
    logger.info('Database disconnected');
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
