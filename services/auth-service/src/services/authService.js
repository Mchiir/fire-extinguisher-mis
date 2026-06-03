import crypto from 'crypto';
import User from '../models/User.js';
import { DEFAULT_ROLE } from '../constants/roles.js';
import { MESSAGES } from '../constants/messages.js';
import { ApiError } from '../utils/ApiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from './tokenService.js';

/**
 * Authentication business logic — register, login, profile, password management.
 */
export const register = async ({ firstName, lastName, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict(MESSAGES.EMAIL_EXISTS);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: DEFAULT_ROLE,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(user._id, refreshToken);

  return { user, accessToken, refreshToken };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(user._id, refreshToken);

  return { user, accessToken, refreshToken };
};

export const refresh = async (oldRefreshToken) => {
  if (!oldRefreshToken) throw ApiError.unauthorized('Refresh token required');

  const result = await rotateRefreshToken(oldRefreshToken);
  if (!result) throw ApiError.unauthorized(MESSAGES.INVALID_TOKEN);

  const user = await User.findById(result.userId);
  if (!user) throw ApiError.unauthorized(MESSAGES.INVALID_TOKEN);

  const accessToken = generateAccessToken(user);
  return { user, accessToken, refreshToken: result.refreshToken };
};

export const logout = async (refreshToken) => {
  await revokeRefreshToken(refreshToken);
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const updateProfile = async (userId, updates) => {
  if (updates.email) {
    const existing = await User.findOne({ email: updates.email, _id: { $ne: userId } });
    if (existing) throw ApiError.conflict(MESSAGES.EMAIL_EXISTS);
  }

  const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const valid = await user.comparePassword(currentPassword);
  if (!valid) throw ApiError.badRequest('Current password is incorrect');

  user.password = newPassword;
  user.tokenVersion += 1;
  await user.save();
  await revokeAllUserTokens(userId);

  return user;
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return { resetToken: null };

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 3600000);
  await user.save();

  return { resetToken, email: user.email };
};

export const resetPassword = async ({ token, newPassword }) => {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.tokenVersion += 1;
  await user.save();
  await revokeAllUserTokens(user._id);

  return user;
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const verifyUserExists = async (id, role = null) => {
  const query = { _id: id };
  if (role) query.role = role;
  const user = await User.findOne(query);
  return !!user;
};
