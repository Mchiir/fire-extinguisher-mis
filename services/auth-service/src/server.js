/**
 * Auth Service entry point — connects to MongoDB and starts the HTTP server.
 */
import app from './app.js';
import config from './config/index.js';
import { connectDatabase } from './database/connect.js';
import logger from './utils/logger.js';

const start = async () => {
  await connectDatabase();
  app.listen(config.port, () => {
    logger.info(`Auth service running on port ${config.port}`);
    logger.info(`Swagger docs: http://localhost:${config.port}/api-docs`);
  });
};

start();
