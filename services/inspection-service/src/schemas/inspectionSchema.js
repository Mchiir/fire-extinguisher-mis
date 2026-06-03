import Joi from 'joi';
import { INSPECTION_STATUS_VALUES } from '../constants/statuses.js';

const objectId = Joi.string().hex().length(24);

const dateField = Joi.date().iso();

export const createInspectionSchema = Joi.object({
  extinguisherId: objectId.required(),
  requestedBy: objectId.optional(),
  scheduledDate: dateField.required().min('now'),
  notes: Joi.string().trim().max(2000).allow('', null),
});

export const updateInspectionSchema = Joi.object({
  extinguisherId: objectId,
  requestedBy: objectId,
  scheduledDate: dateField,
  notes: Joi.string().trim().max(2000).allow('', null),
  status: Joi.string().valid(...INSPECTION_STATUS_VALUES),
})
  .min(1)
  .custom((value, helpers) => {
    if (value.scheduledDate && value.scheduledDate < new Date()) {
      return helpers.error('any.invalid', { message: 'scheduledDate must be in the future' });
    }
    return value;
  });

export const assignInspectorSchema = Joi.object({
  inspectorId: objectId.required(),
});

export const completeInspectionSchema = Joi.object({
  notes: Joi.string().trim().max(2000).allow('', null),
});

export const cancelInspectionSchema = Joi.object({
  notes: Joi.string().trim().max(2000).allow('', null),
});

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...INSPECTION_STATUS_VALUES),
  extinguisherId: objectId,
  fromDate: dateField,
  toDate: dateField,
});

export const idParamSchema = Joi.object({
  id: objectId.required(),
});
