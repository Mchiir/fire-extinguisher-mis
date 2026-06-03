import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize, selfOrAdmin } from '../middlewares/rbac.js';
import { ROLES } from '../constants/roles.js';
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  verifyUserQuerySchema,
  userIdParamSchema,
} from '../schemas/userSchema.js';

const router = Router();

const validateParams = validate(userIdParamSchema, 'params');

router.get(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(listUsersQuerySchema, 'query'),
  userController.listUsers
);

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createUserSchema),
  userController.createUser
);

// Internal endpoint for other services — must be registered before /:id
router.get(
  '/:id/verify',
  validateParams,
  validate(verifyUserQuerySchema, 'query'),
  userController.verifyUser
);

router.get(
  '/:id',
  authenticate,
  validateParams,
  selfOrAdmin,
  userController.getUserById
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validateParams,
  validate(updateUserSchema),
  userController.updateUser
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validateParams,
  userController.deleteUser
);

export default router;
