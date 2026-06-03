import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Verifies JWT access token and attaches user to request.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access token required');
  }

  const token = authHeader.split(' ')[1];
  let decoded;

  try {
    decoded = jwt.verify(token, config.jwt.accessSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }

  const user = await User.findById(decoded.userId);
  if (!user || user.tokenVersion !== decoded.tokenVersion) {
    throw ApiError.unauthorized('Session expired, please login again');
  }

  req.user = user;
  next();
});
