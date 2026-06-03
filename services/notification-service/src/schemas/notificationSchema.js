import Joi from 'joi';
import { NOTIFICATION_STATUS_VALUES } from '../constants/statuses.js';

export const createNotificationSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  extinguisherId: Joi.string().hex().length(24).allow(null).optional(),
  title: Joi.string().trim().min(1).max(200).required(),
  message: Joi.string().trim().min(1).max(2000).required(),
  status: Joi.string().valid(...NOTIFICATION_STATUS_VALUES).optional(),
});

export const updateNotificationSchema = Joi.object({
  userId: Joi.string().hex().length(24),
  extinguisherId: Joi.string().hex().length(24).allow(null),
  title: Joi.string().trim().min(1).max(200),
  message: Joi.string().trim().min(1).max(2000),
  status: Joi.string().valid(...NOTIFICATION_STATUS_VALUES),
  sentAt: Joi.date().iso().allow(null),
}).min(1);

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...NOTIFICATION_STATUS_VALUES),
  userId: Joi.string().hex().length(24),
  extinguisherId: Joi.string().hex().length(24),
});

export const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
