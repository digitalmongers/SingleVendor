import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    logger.info('Test environment detected, skipping real MongoDB connection');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
