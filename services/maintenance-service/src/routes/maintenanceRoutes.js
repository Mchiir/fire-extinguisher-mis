import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenanceController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/rbac.js';
import { validate } from '../middlewares/validate.js';
import { ROLES } from '../constants/roles.js';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  listQuerySchema,
  idParamSchema,
  inspectorIdParamSchema,
  extinguisherIdParamSchema,
} from '../schemas/maintenanceSchema.js';

const router = Router();
const readRoles = [ROLES.ADMIN, ROLES.INSPECTOR, ROLES.USER];
const createRoles = [ROLES.ADMIN, ROLES.INSPECTOR];

router.use(authenticate);

router.get(
  '/by-inspector/:inspectorId',
  authorize(...readRoles),
  validate(inspectorIdParamSchema, 'params'),
  validate(listQuerySchema, 'query'),
  maintenanceController.getByInspector
);

router.get(
  '/by-extinguisher/:extinguisherId',
  authorize(...readRoles),
  validate(extinguisherIdParamSchema, 'params'),
  validate(listQuerySchema, 'query'),
  maintenanceController.getByExtinguisher
);

router.get(
  '/',
  authorize(...readRoles),
  validate(listQuerySchema, 'query'),
  maintenanceController.list
);

router.post(
  '/',
  authorize(...createRoles),
  validate(createMaintenanceSchema),
  maintenanceController.create
);

router.get(
  '/:id',
  authorize(...readRoles),
  validate(idParamSchema, 'params'),
  maintenanceController.getById
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(idParamSchema, 'params'),
  validate(updateMaintenanceSchema),
  maintenanceController.update
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(idParamSchema, 'params'),
  maintenanceController.remove
);

export default router;
