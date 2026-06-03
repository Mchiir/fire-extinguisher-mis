import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate, authenticateAdminOrSystem } from '../middlewares/auth.js';
import { authorize, adminOrSystem } from '../middlewares/rbac.js';
import { validate } from '../middlewares/validate.js';
import { ROLES } from '../constants/roles.js';
import {
  createNotificationSchema,
  updateNotificationSchema,
  listQuerySchema,
  idParamSchema,
} from '../schemas/notificationSchema.js';

const router = Router();
const readRoles = [ROLES.ADMIN, ROLES.INSPECTOR, ROLES.USER];

router.get(
  '/',
  authenticate,
  authorize(...readRoles),
  validate(listQuerySchema, 'query'),
  notificationController.list
);

router.post(
  '/',
  authenticateAdminOrSystem,
  validate(createNotificationSchema),
  notificationController.create
);

router.patch(
  '/:id/mark-sent',
  authenticateAdminOrSystem,
  validate(idParamSchema, 'params'),
  notificationController.markSent
);

router.get(
  '/:id',
  authenticate,
  authorize(...readRoles),
  validate(idParamSchema, 'params'),
  notificationController.getById
);

router.put(
  '/:id',
  authenticateAdminOrSystem,
  validate(idParamSchema, 'params'),
  validate(updateNotificationSchema),
  notificationController.update
);

router.delete(
  '/:id',
  authenticate,
  adminOrSystem,
  validate(idParamSchema, 'params'),
  notificationController.remove
);

export default router;
