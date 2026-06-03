import cron from 'node-cron';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import * as reportService from '../services/reportService.js';

const generateServiceJwt = () =>
  jwt.sign(
    { userId: '000000000000000000000000', role: 'ADMIN', tokenVersion: 0 },
    config.jwt.accessSecret,
    { expiresIn: '1h' }
  );

export const runWeeklySummaryJob = async () => {
  logger.info('Running weekly report summary job');

  try {
    const token = generateServiceJwt();
    const [inventory, inspections, maintenance, expiry] = await Promise.all([
      reportService.generateInventoryReport('monthly', token),
      reportService.generateInspectionReport(null, token),
      reportService.generateMaintenanceReport('date', {}, token),
      reportService.generateExpiryReport('expiring', token),
    ]);

    logger.info(
      `Weekly summary — extinguishers in system: ${inventory?.totalInSystem ?? 'n/a'}, ` +
        `inspections: ${inspections.total}, maintenance records: ${maintenance.total}, ` +
        `expiring soon: ${expiry.total}`
    );
  } catch (error) {
    logger.error(`Weekly report job failed: ${error.message}`);
  }
};

export const startReportJobs = () => {
  cron.schedule('0 8 * * 1', runWeeklySummaryJob, { timezone: 'UTC' });
  logger.info('Report cron jobs scheduled (weekly Monday 08:00 UTC)');
};
