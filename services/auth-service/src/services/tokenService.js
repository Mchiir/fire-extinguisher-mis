import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import RefreshToken from '../models/RefreshToken.js';

/**
 * Token generation and refresh token rotation utilities.
 */
export const generateAccessToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role, tokenVersion: user.tokenVersion },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry }
  );

export const generateRefreshToken = () => crypto.randomBytes(64).toString('hex');

export const storeRefreshToken = async (userId, token) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    userId,
    tokenHash: RefreshToken.hashToken(token),
    expiresAt,
  });
  return token;
};

export const rotateRefreshToken = async (oldToken) => {
  const tokenHash = RefreshToken.hashToken(oldToken);
  const stored = await RefreshToken.findOne({ tokenHash, isRevoked: false });

  if (!stored || stored.expiresAt < new Date()) {
    return null;
  }

  // Revoke old token (rotation)
  stored.isRevoked = true;
  await stored.save();

  const newToken = generateRefreshToken();
  await storeRefreshToken(stored.userId, newToken);

  return { userId: stored.userId, refreshToken: newToken };
};

export const revokeRefreshToken = async (token) => {
  if (!token) return;
  const tokenHash = RefreshToken.hashToken(token);
  await RefreshToken.updateOne({ tokenHash }, { isRevoked: true });
};

export const revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany({ userId }, { isRevoked: true });
};

export const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
});
