import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/black-cross';
    await mongoose.connect(mongoURI);
    console.log('[THREAT-HUNTING] MongoDB connected');
  } catch (error) {
    console.error('[THREAT-HUNTING] MongoDB connection error:', error);
    process.exit(1);
  }
};
