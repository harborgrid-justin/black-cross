/**
 * Database Configuration for Threat Intelligence Module
 */

import mongoose from 'mongoose';

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackcross';

    await mongoose.connect(mongoUri);

    console.log('✅ Threat Intelligence Database connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Threat Intelligence Database connection error:', error);
    throw error;
  }
};

export default {
  connectDatabase,
  mongoose,
};

