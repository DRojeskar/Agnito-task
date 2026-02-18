import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace_payment';
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    // console.log({error})
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};
