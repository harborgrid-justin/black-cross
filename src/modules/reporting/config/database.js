/**
 * Database Configuration for Reporting Module
 */

const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackcross';

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Reporting Database connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Reporting Database connection error:', error);
    throw error;
  }
};

module.exports = {
  connectDatabase,
  mongoose,
};
