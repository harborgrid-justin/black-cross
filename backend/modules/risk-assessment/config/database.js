/**
 * Database configuration for Risk Assessment module
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/black-cross-risk';

let isConnected = false;

const connectDatabase = async () => {
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
    logger.info('Database connected successfully', { uri: MONGODB_URI });
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    throw error;
  }
};

module.exports = { connectDatabase };
