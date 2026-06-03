import * as authService from '../services/authService.js';
import { getRefreshCookieOptions } from '../services/tokenService.js';
import { MESSAGES } from '../constants/messages.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const sendAuthResponse = (res, { user, accessToken, refreshToken }, message, statusCode = 200) => {
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
  }
  res.status(statusCode).json({
    success: true,
    message,
    data: { user, accessToken },
  });
};

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  sendAuthResponse(res, result, MESSAGES.REGISTER_SUCCESS, 201);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendAuthResponse(res, result, MESSAGES.LOGIN_SUCCESS);
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.cookies.refreshToken);
  sendAuthResponse(res, result, MESSAGES.REFRESH_SUCCESS);
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies.refreshToken);
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ success: true, message: MESSAGES.LOGOUT_SUCCESS, data: null });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  res.json({ success: true, message: 'Profile retrieved', data: user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  res.json({ success: true, message: MESSAGES.PROFILE_UPDATED, data: user });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body);
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ success: true, message: MESSAGES.PASSWORD_CHANGED, data: null });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  // In production, send email; for dev, optionally return token
  res.json({
    success: true,
    message: MESSAGES.PASSWORD_RESET_SENT,
    data: process.env.NODE_ENV === 'development' && result.resetToken
      ? { resetToken: result.resetToken }
      : null,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  res.json({ success: true, message: MESSAGES.PASSWORD_RESET_SUCCESS, data: null });
});

export const verifyUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.query;
  const exists = await authService.verifyUserExists(id, role || null);
  res.json({ success: true, message: 'Verification complete', data: { exists } });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.params.id);
  res.json({ success: true, message: 'User retrieved', data: user });
});
