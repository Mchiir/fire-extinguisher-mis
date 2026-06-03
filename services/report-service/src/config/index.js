import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3007,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  services: {
    extinguisher: process.env.EXTINGUISHER_SERVICE_URL || 'http://localhost:3003',
    inspection: process.env.INSPECTION_SERVICE_URL || 'http://localhost:3004',
    maintenance: process.env.MAINTENANCE_SERVICE_URL || 'http://localhost:3005',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  },
};
