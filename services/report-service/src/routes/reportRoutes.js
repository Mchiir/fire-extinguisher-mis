import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/rbac.js';
import { validate } from '../middlewares/validate.js';
import { ROLES } from '../constants/roles.js';
import {
  inventoryReportSchema,
  inspectionReportSchema,
  maintenanceReportSchema,
  expiryReportSchema,
} from '../schemas/reportSchema.js';

const router = Router();
const adminOnly = [ROLES.ADMIN];
const readRoles = [ROLES.ADMIN, ROLES.INSPECTOR, ROLES.USER];

router.use(authenticate);

router.get(
  '/dashboard',
  authorize(...readRoles),
  reportController.dashboardSummary
);

router.get(
  '/inventory',
  authorize(...adminOnly),
  validate(inventoryReportSchema, 'query'),
  reportController.inventoryReport
);

router.get(
  '/inspections',
  authorize(...adminOnly),
  validate(inspectionReportSchema, 'query'),
  reportController.inspectionReport
);

router.get(
  '/maintenance',
  authorize(...adminOnly),
  validate(maintenanceReportSchema, 'query'),
  reportController.maintenanceReport
);

router.get(
  '/expiry',
  authorize(...adminOnly),
  validate(expiryReportSchema, 'query'),
  reportController.expiryReport
);

export default router;
