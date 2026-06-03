import Notification from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { NOTIFICATION_STATUS, DEFAULT_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';

const findByIdOrThrow = async (id) => {
  const notification = await Notification.findById(id);
  if (!notification) {
    throw ApiError.notFound(MESSAGES.NOT_FOUND);
  }
  return notification;
};

const assertAccess = (notification, requester) => {
  if (requester.isSystem || requester.role === ROLES.ADMIN) {
    return;
  }
  if (notification.userId.toString() !== requester.id?.toString()) {
    throw ApiError.forbidden(MESSAGES.FORBIDDEN);
  }
};

const buildListFilter = (query, requester) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.extinguisherId) filter.extinguisherId = query.extinguisherId;

  if (requester.role === ROLES.ADMIN || requester.isSystem) {
    if (query.userId) filter.userId = query.userId;
  } else {
    filter.userId = requester.id;
  }

  return filter;
};

export const listNotifications = async (query, requester) => {
  const { page, limit } = query;
  const filter = buildListFilter(query, requester);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getNotificationById = async (id, requester) => {
  const notification = await findByIdOrThrow(id);
  assertAccess(notification, requester);
  return notification;
};

export const createNotification = async (data) => {
  const payload = {
    ...data,
    status: data.status || DEFAULT_STATUS,
    extinguisherId: data.extinguisherId || null,
  };
  return Notification.create(payload);
};

export const updateNotification = async (id, data, requester) => {
  const notification = await findByIdOrThrow(id);
  if (!requester.isSystem && requester.role !== ROLES.ADMIN) {
    assertAccess(notification, requester);
  }

  Object.assign(notification, data);
  await notification.save();
  return notification;
};

export const deleteNotification = async (id, requester) => {
  const notification = await findByIdOrThrow(id);
  if (!requester.isSystem && requester.role !== ROLES.ADMIN) {
    throw ApiError.forbidden(MESSAGES.FORBIDDEN);
  }
  await notification.deleteOne();
  return notification;
};

export const markNotificationSent = async (id) => {
  const notification = await findByIdOrThrow(id);
  notification.status = NOTIFICATION_STATUS.SENT;
  notification.sentAt = new Date();
  await notification.save();
  return notification;
};

export const getNotificationSummaryCounts = async () => {
  const [pending, sent, failed, total] = await Promise.all([
    Notification.countDocuments({ status: NOTIFICATION_STATUS.PENDING }),
    Notification.countDocuments({ status: NOTIFICATION_STATUS.SENT }),
    Notification.countDocuments({ status: NOTIFICATION_STATUS.FAILED }),
    Notification.countDocuments(),
  ]);

  return { pending, sent, failed, total };
};

export const createBulkNotifications = async (notifications) => {
  if (!notifications.length) return [];
  return Notification.insertMany(notifications);
};
