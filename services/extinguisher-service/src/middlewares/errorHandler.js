import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Global error handler — returns consistent JSON error responses.
 */
export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message} - ${req.originalUrl}`);
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Serial number already exists',
      errors: null,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || null,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};
