import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      tokenVersion: decoded.tokenVersion,
    };
    req.accessToken = token;
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }
});
