import cron from 'node-cron';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { httpGet, generateServiceJwt, authHeaders } from '../utils/httpClient.js';
import * as notificationService from '../services/notificationService.js';
import { NOTIFICATION_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';

const EXPIRY_DAYS = 30;

const fetchAllUsers = async () => {
  const token = generateServiceJwt();
  const users = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${config.services.user}/users?page=${page}&limit=100`;
    const response = await httpGet(url, { headers: authHeaders(token) });
    const batch = response.data?.users || response.data?.items || [];
    users.push(...batch);
    totalPages = response.data?.pagination?.totalPages || 1;
    page += 1;
  }

  return users.filter((user) => [ROLES.USER, ROLES.ADMIN, ROLES.INSPECTOR].includes(user.role));
};

const fetchExpiringExtinguishers = async () => {
  const token = generateServiceJwt();
  const url = `${config.services.extinguisher}/extinguishers/expiring?days=${EXPIRY_DAYS}`;
  const response = await httpGet(url, { headers: authHeaders(token) });
  return response.data?.items || [];
};

const markExpiredExtinguishers = async () => {
  const token = generateServiceJwt();
  const url = `${config.services.extinguisher}/extinguishers/expired`;
  const response = await httpGet(url, { headers: authHeaders(token) });
  return response.data?.items || [];
};

const fetchPendingScheduledInspections = async () => {
  const token = generateServiceJwt();
  const url = `${config.services.inspection}/inspections/pending-scheduled`;
  const response = await httpGet(url, { headers: authHeaders(token) });
  return response.data?.items || [];
};

const buildExpiryNotifications = (users, extinguishers) => {
  const notifications = [];

  for (const extinguisher of extinguishers) {
    const expiryDate = new Date(extinguisher.expiryDate).toLocaleDateString();
    const title = 'Fire Extinguisher Expiry Alert';
    const message = `Extinguisher ${extinguisher.serialNumber} at ${extinguisher.location} expires on ${expiryDate}.`;

    for (const user of users) {
      notifications.push({
        userId: user._id,
        extinguisherId: extinguisher._id,
        title,
        message,
        status: NOTIFICATION_STATUS.PENDING,
      });
    }
  }

  return notifications;
};

const buildInspectionReminders = (inspections) => {
  const notifications = [];
  const seen = new Set();

  for (const inspection of inspections) {
    const scheduledDate = new Date(inspection.scheduledDate).toLocaleString();
    const title = 'Inspection Reminder';
    const message = `Inspection scheduled for ${scheduledDate}. Status: ${inspection.status}.`;

    const recipientIds = [inspection.requestedBy, inspection.inspectorId].filter(Boolean);

    for (const userId of recipientIds) {
      const key = `${userId}-${inspection._id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      notifications.push({
        userId,
        extinguisherId: inspection.extinguisherId || null,
        title,
        message,
        status: NOTIFICATION_STATUS.PENDING,
      });
    }
  }

  return notifications;
};

export const runDailyNotificationJob = async () => {
  logger.info('Running daily notification job');

  try {
    const [users, expiringExtinguishers] = await Promise.all([
      fetchAllUsers(),
      fetchExpiringExtinguishers(),
    ]);

    const expiryNotifications = buildExpiryNotifications(users, expiringExtinguishers);
    if (expiryNotifications.length) {
      await notificationService.createBulkNotifications(expiryNotifications);
      logger.info(`Created ${expiryNotifications.length} expiry alert notifications`);
    } else {
      logger.info('No expiring extinguishers — no expiry alerts created');
    }

    const expiredItems = await markExpiredExtinguishers();
    logger.info(`Marked ${expiredItems.length} extinguishers as expired`);

    const inspections = await fetchPendingScheduledInspections();
    const inspectionNotifications = buildInspectionReminders(inspections);
    if (inspectionNotifications.length) {
      await notificationService.createBulkNotifications(inspectionNotifications);
      logger.info(`Created ${inspectionNotifications.length} inspection reminder notifications`);
    } else {
      logger.info('No pending/scheduled inspections — no reminders created');
    }
  } catch (error) {
    logger.error(`Daily notification job failed: ${error.message}`);
  }
};

export const runWeeklySummaryJob = async () => {
  logger.info('Running weekly notification summary job');

  try {
    const counts = await notificationService.getNotificationSummaryCounts();
    logger.info(
      `Weekly notification summary — total: ${counts.total}, pending: ${counts.pending}, sent: ${counts.sent}, failed: ${counts.failed}`
    );
  } catch (error) {
    logger.error(`Weekly summary job failed: ${error.message}`);
  }
};

export const startNotificationJobs = () => {
  cron.schedule('0 8 * * *', runDailyNotificationJob, { timezone: 'UTC' });
  cron.schedule('0 8 * * 1', runWeeklySummaryJob, { timezone: 'UTC' });
  logger.info('Notification cron jobs scheduled (daily 08:00 UTC, weekly Monday 08:00 UTC)');
};
