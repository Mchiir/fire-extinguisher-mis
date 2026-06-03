import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

/**
 * Role-based access control middleware.
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }
  if (req.user.isSystem) {
    return next();
  }
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('Insufficient permissions'));
  }
  next();
};

/**
 * Allows ADMIN or system token; regular users are denied.
 */
export const adminOrSystem = (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }
  if (req.user.isSystem || req.user.role === ROLES.ADMIN) {
    return next();
  }
  return next(ApiError.forbidden('Insufficient permissions'));
};
