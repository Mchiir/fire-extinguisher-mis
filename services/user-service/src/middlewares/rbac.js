import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

/**
 * Role-based access control middleware.
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('Insufficient permissions'));
  }
  next();
};

/**
 * Allows access when the requester is an admin or the target user.
 */
export const selfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }
  if (req.user.role === ROLES.ADMIN || req.user._id.toString() === req.params.id) {
    return next();
  }
  return next(ApiError.forbidden('Insufficient permissions'));
};
