import { Router } from 'express';
import * as inspectionController from '../controllers/inspectionController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/rbac.js';
import { validate } from '../middlewares/validate.js';
import { ROLES } from '../constants/roles.js';
import {
  createInspectionSchema,
  updateInspectionSchema,
  assignInspectorSchema,
  completeInspectionSchema,
  cancelInspectionSchema,
  listQuerySchema,
  idParamSchema,
} from '../schemas/inspectionSchema.js';

const router = Router();
const allRoles = [ROLES.ADMIN, ROLES.INSPECTOR, ROLES.USER];
const scheduleRoles = [ROLES.USER, ROLES.ADMIN];
const adminOnly = [ROLES.ADMIN];
const inspectorOnly = [ROLES.INSPECTOR];
const cancelRoles = [ROLES.USER, ROLES.ADMIN];

router.use(authenticate);

router.get(
  '/stats/summary',
  authorize(...allRoles),
  inspectionController.getStatsSummary
);

router.get(
  '/pending-scheduled',
  authorize(...adminOnly),
  inspectionController.getPendingScheduled
);

router.get(
  '/',
  authorize(...allRoles),
  validate(listQuerySchema, 'query'),
  inspectionController.list
);

router.post(
  '/',
  authorize(...scheduleRoles),
  validate(createInspectionSchema),
  inspectionController.create
);

router.get(
  '/:id',
  authorize(...allRoles),
  validate(idParamSchema, 'params'),
  inspectionController.getById
);

router.put(
  '/:id',
  authorize(...adminOnly),
  validate(idParamSchema, 'params'),
  validate(updateInspectionSchema),
  inspectionController.update
);

router.delete(
  '/:id',
  authorize(...adminOnly),
  validate(idParamSchema, 'params'),
  inspectionController.remove
);

router.patch(
  '/:id/assign',
  authorize(...adminOnly),
  validate(idParamSchema, 'params'),
  validate(assignInspectorSchema),
  inspectionController.assign
);

router.patch(
  '/:id/complete',
  authorize(...inspectorOnly),
  validate(idParamSchema, 'params'),
  validate(completeInspectionSchema),
  inspectionController.complete
);

router.patch(
  '/:id/cancel',
  authorize(...cancelRoles),
  validate(idParamSchema, 'params'),
  validate(cancelInspectionSchema),
  inspectionController.cancel
);

export default router;
