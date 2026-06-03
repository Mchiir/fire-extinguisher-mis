import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3004,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/inspection_db',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  extinguisherServiceUrl: process.env.EXTINGUISHER_SERVICE_URL || 'http://localhost:3003',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3002',
};
