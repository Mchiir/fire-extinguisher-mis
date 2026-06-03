import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3005,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/maintenance_db',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  inspectionServiceUrl: process.env.INSPECTION_SERVICE_URL || 'http://localhost:3004',
  extinguisherServiceUrl: process.env.EXTINGUISHER_SERVICE_URL || 'http://localhost:3003',
};
