import { Router } from 'express';
import * as extinguisherController from '../controllers/extinguisherController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/rbac.js';
import { validate } from '../middlewares/validate.js';
import { ROLES } from '../constants/roles.js';
import {
  createExtinguisherSchema,
  updateExtinguisherSchema,
  updateStatusSchema,
  listQuerySchema,
  expiringQuerySchema,
  idParamSchema,
} from '../schemas/extinguisherSchema.js';

const router = Router();
const readRoles = [ROLES.ADMIN, ROLES.INSPECTOR, ROLES.USER];
const writeAdmin = [ROLES.ADMIN];
const statusRoles = [ROLES.ADMIN, ROLES.INSPECTOR];

router.use(authenticate);

router.get(
  '/expiring',
  authorize(...readRoles),
  validate(expiringQuerySchema, 'query'),
  extinguisherController.getExpiring
);

router.get(
  '/expired',
  authorize(...readRoles),
  extinguisherController.getExpired
);

router.get(
  '/',
  authorize(...readRoles),
  validate(listQuerySchema, 'query'),
  extinguisherController.list
);

router.post(
  '/',
  authorize(...writeAdmin),
  validate(createExtinguisherSchema),
  extinguisherController.create
);

router.get(
  '/:id',
  authorize(...readRoles),
  validate(idParamSchema, 'params'),
  extinguisherController.getById
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.INSPECTOR),
  validate(idParamSchema, 'params'),
  validate(updateExtinguisherSchema),
  extinguisherController.update
);

router.delete(
  '/:id',
  authorize(...writeAdmin),
  validate(idParamSchema, 'params'),
  extinguisherController.remove
);

router.patch(
  '/:id/status',
  authorize(...statusRoles),
  validate(idParamSchema, 'params'),
  validate(updateStatusSchema),
  extinguisherController.patchStatus
);

export default router;
