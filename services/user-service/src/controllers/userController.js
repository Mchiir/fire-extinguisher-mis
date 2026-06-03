import * as userService from '../services/userService.js';
import { MESSAGES } from '../constants/messages.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.json({
    success: true,
    message: MESSAGES.USERS_RETRIEVED,
    data: result,
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({
    success: true,
    message: MESSAGES.USER_CREATED,
    data: user,
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json({
    success: true,
    message: MESSAGES.USER_RETRIEVED,
    data: user,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json({
    success: true,
    message: MESSAGES.USER_UPDATED,
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user._id);
  res.json({
    success: true,
    message: MESSAGES.USER_DELETED,
    data: null,
  });
});

export const verifyUser = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const exists = await userService.verifyUserExists(req.params.id, role || null);
  res.json({
    success: true,
    message: 'Verification complete',
    data: { exists },
  });
});
