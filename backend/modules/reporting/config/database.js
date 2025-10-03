const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/black-cross';
    await mongoose.connect(mongoURI);
    console.log('[REPORTING] MongoDB connected');
  } catch (error) {
    console.error('[REPORTING] MongoDB connection error:', error);
    process.exit(1);
  }
};
module.exports = { connectDB };
