import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../constants/roles.js';

const attachUserFromToken = (token) => {
  const decoded = jwt.verify(token, config.jwt.accessSecret);
  return {
    id: decoded.userId,
    role: decoded.role,
    tokenVersion: decoded.tokenVersion,
    isSystem: false,
  };
};

/**
 * Verifies JWT access token issued by auth-service and attaches user context to request.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access token required');
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = attachUserFromToken(token);
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }
});

/**
 * Allows ADMIN JWT or internal service token (x-service-token header).
 */
export const authenticateAdminOrSystem = asyncHandler(async (req, res, next) => {
  const serviceToken = req.headers['x-service-token'];
  if (serviceToken && serviceToken === config.serviceToken) {
    req.user = { id: null, role: 'SYSTEM', isSystem: true };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access token or service token required');
  }

  try {
    req.user = attachUserFromToken(authHeader.split(' ')[1]);
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }

  if (req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Insufficient permissions');
  }

  next();
});
