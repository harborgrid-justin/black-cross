/**
 * Database configuration for incident-response module
 */

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/black-cross';

    await mongoose.connect(mongoURI);

    console.log('[INCIDENT-RESPONSE] MongoDB connected successfully');
  } catch (error) {
    console.error('[INCIDENT-RESPONSE] MongoDB connection error:', error);
    process.exit(1);
  }
};

export default { connectDB };
