/**
 * Database configuration for Risk Assessment module
 */

import mongoose from 'mongoose';
import logger from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/black-cross-risk';

let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) {
    logger.info('Using existing database connection');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    logger.info('Database connected successfully', { uri: MONGODB_URI });
  } catch (error: any) {
    logger.error('Database connection failed', { error: error.message });
    throw error;
  }
};

export default { connectDatabase };
