import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3006,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/notification_db',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
  },
  serviceToken: process.env.SERVICE_TOKEN || 'service-token',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  services: {
    extinguisher: process.env.EXTINGUISHER_SERVICE_URL || 'http://localhost:3003',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    inspection: process.env.INSPECTION_SERVICE_URL || 'http://localhost:3004',
  },
};
