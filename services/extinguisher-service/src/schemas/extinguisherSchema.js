import Joi from 'joi';
import { EXTINGUISHER_STATUS_VALUES } from '../constants/statuses.js';

const dateField = Joi.date().iso();

export const createExtinguisherSchema = Joi.object({
  serialNumber: Joi.string().trim().required(),
  location: Joi.string().trim().required(),
  type: Joi.string().trim().required(),
  size: Joi.string().trim().required(),
  installationDate: dateField.required(),
  expiryDate: dateField.required().greater(Joi.ref('installationDate')),
  status: Joi.string().valid(...EXTINGUISHER_STATUS_VALUES).optional(),
});

export const updateExtinguisherSchema = Joi.object({
  serialNumber: Joi.string().trim(),
  location: Joi.string().trim(),
  type: Joi.string().trim(),
  size: Joi.string().trim(),
  installationDate: dateField,
  expiryDate: dateField,
  status: Joi.string().valid(...EXTINGUISHER_STATUS_VALUES),
})
  .min(1)
  .custom((value, helpers) => {
    if (value.installationDate && value.expiryDate && value.expiryDate <= value.installationDate) {
      return helpers.error('any.invalid', { message: 'expiryDate must be after installationDate' });
    }
    return value;
  });

export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...EXTINGUISHER_STATUS_VALUES)
    .required(),
});

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...EXTINGUISHER_STATUS_VALUES),
  type: Joi.string().trim(),
  search: Joi.string().trim().allow(''),
});

export const expiringQuerySchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).default(30),
});

export const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
