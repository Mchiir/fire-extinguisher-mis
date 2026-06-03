import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3002,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_db',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
};
