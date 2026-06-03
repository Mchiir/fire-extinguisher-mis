import mongoose from 'mongoose';
import config from '../config/index.js';
import logger from '../utils/logger.js';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};
