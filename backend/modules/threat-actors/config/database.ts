import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/black-cross';
    await mongoose.connect(mongoURI);
    console.log('[THREAT-ACTORS] MongoDB connected');
  } catch (error) {
    console.error('[THREAT-ACTORS] MongoDB connection error:', error);
    process.exit(1);
  }
};
export default { connectDB };
