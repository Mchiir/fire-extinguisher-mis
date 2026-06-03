import winston from 'winston';
import config from '../config/index.js';

const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [inspection-service] ${level}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
