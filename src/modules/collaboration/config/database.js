/**
 * Database configuration for Collaboration module
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/black-cross-collaboration';

let isConnected = false;

async function connectDatabase() {
  if (isConnected) {
    logger.info('Using existing database connection');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    logger.info('Collaboration module database connected successfully');
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    throw error;
  }
}

async function disconnectDatabase() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('Database disconnected');
  } catch (error) {
    logger.error('Database disconnection failed', { error: error.message });
    throw error;
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
