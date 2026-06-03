import Joi from 'joi';

export const inventoryReportSchema = Joi.object({
  period: Joi.string().valid('daily', 'monthly', 'yearly').default('daily'),
});

export const inspectionReportSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED').optional(),
});

export const maintenanceReportSchema = Joi.object({
  groupBy: Joi.string().valid('date', 'inspector', 'extinguisher').default('date'),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  inspectorId: Joi.string().hex().length(24).optional(),
  extinguisherId: Joi.string().hex().length(24).optional(),
});

export const expiryReportSchema = Joi.object({
  type: Joi.string().valid('expiring', 'expired', 'retired').required(),
});
