import Joi from 'joi';
import { MAINTENANCE_ACTION_VALUES } from '../constants/actions.js';

const objectId = Joi.string().hex().length(24);

const dateField = Joi.date().iso();

const maintenanceBodyFields = {
  extinguisherId: objectId.required(),
  inspectionId: objectId,
  inspectorId: objectId,
  actionTaken: Joi.string()
    .valid(...MAINTENANCE_ACTION_VALUES)
    .required(),
  conditionFound: Joi.string().trim().required(),
  maintenanceDate: dateField.default(() => new Date()),
};

export const createMaintenanceSchema = Joi.object(maintenanceBodyFields);

export const updateMaintenanceSchema = Joi.object({
  extinguisherId: objectId,
  inspectionId: objectId.allow(null),
  inspectorId: objectId,
  actionTaken: Joi.string().valid(...MAINTENANCE_ACTION_VALUES),
  conditionFound: Joi.string().trim(),
  maintenanceDate: dateField,
})
  .min(1)
  .custom((value, helpers) => {
    if (value.inspectionId === null) {
      value.inspectionId = undefined;
    }
    return value;
  });

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  extinguisherId: objectId,
  inspectorId: objectId,
  startDate: dateField,
  endDate: dateField,
}).custom((value, helpers) => {
  if (value.startDate && value.endDate && value.endDate < value.startDate) {
    return helpers.error('any.invalid', { message: 'endDate must be on or after startDate' });
  }
  return value;
});

export const idParamSchema = Joi.object({
  id: objectId.required(),
});

export const inspectorIdParamSchema = Joi.object({
  inspectorId: objectId.required(),
});

export const extinguisherIdParamSchema = Joi.object({
  extinguisherId: objectId.required(),
});
