import Joi from 'joi';
import { ROLES } from '../constants/roles.js';

export const createUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .required(),
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),
  lastName: Joi.string().trim().min(2).max(50),
  email: Joi.string().email(),
  password: Joi.string().min(6).max(128),
  role: Joi.string().valid(...Object.values(ROLES)),
}).min(1);

export const listUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.string().valid(...Object.values(ROLES)),
  search: Joi.string().trim().max(100),
});

export const verifyUserQuerySchema = Joi.object({
  role: Joi.string().valid(...Object.values(ROLES)),
});

export const userIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
