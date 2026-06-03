import { ApiError } from '../utils/ApiError.js';

/**
 * Joi validation middleware factory.
 */
export const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return next(ApiError.badRequest('Validation failed', errors));
  }
  req[property] = value;
  next();
};
