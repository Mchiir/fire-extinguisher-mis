/**
 * Report Service entry point — starts cron jobs and the HTTP server.
 */
import app from './app.js';
import config from './config/index.js';
import { startReportJobs } from './jobs/reportJobs.js';
import logger from './utils/logger.js';

const start = async () => {
  startReportJobs();
  app.listen(config.port, () => {
    logger.info(`Report service running on port ${config.port}`);
    logger.info(`Swagger docs: http://localhost:${config.port}/api-docs`);
  });
};

start();
