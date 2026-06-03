/**
 * Notification Service entry point — connects to MongoDB, starts cron jobs, and starts the HTTP server.
 */
import app from './app.js';
import config from './config/index.js';
import { connectDatabase } from './database/connect.js';
import { startNotificationJobs } from './jobs/notificationJobs.js';
import logger from './utils/logger.js';

const start = async () => {
  await connectDatabase();
  startNotificationJobs();
  app.listen(config.port, () => {
    logger.info(`Notification service running on port ${config.port}`);
    logger.info(`Swagger docs: http://localhost:${config.port}/api-docs`);
  });
};

start();
