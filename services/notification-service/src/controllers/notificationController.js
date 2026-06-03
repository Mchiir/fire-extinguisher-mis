import * as notificationService from '../services/notificationService.js';
import { MESSAGES } from '../constants/messages.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const result = await notificationService.listNotifications(req.query, req.user);
  res.json({
    success: true,
    message: MESSAGES.LIST_RETRIEVED,
    data: result,
  });
});

export const getById = asyncHandler(async (req, res) => {
  const notification = await notificationService.getNotificationById(req.params.id, req.user);
  res.json({
    success: true,
    message: MESSAGES.RETRIEVED,
    data: notification,
  });
});

export const create = asyncHandler(async (req, res) => {
  const notification = await notificationService.createNotification(req.body);
  res.status(201).json({
    success: true,
    message: MESSAGES.CREATED,
    data: notification,
  });
});

export const update = asyncHandler(async (req, res) => {
  const notification = await notificationService.updateNotification(
    req.params.id,
    req.body,
    req.user
  );
  res.json({
    success: true,
    message: MESSAGES.UPDATED,
    data: notification,
  });
});

export const remove = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user);
  res.json({
    success: true,
    message: MESSAGES.DELETED,
    data: null,
  });
});

export const markSent = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationSent(req.params.id);
  res.json({
    success: true,
    message: MESSAGES.MARKED_SENT,
    data: notification,
  });
});
