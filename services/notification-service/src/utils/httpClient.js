import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { ApiError } from './ApiError.js';
import logger from './logger.js';

/**
 * Generates a short-lived admin JWT for inter-service HTTP calls.
 */
export const generateServiceJwt = () =>
  jwt.sign(
    { userId: '000000000000000000000000', role: 'ADMIN', tokenVersion: 0 },
    config.jwt.accessSecret,
    { expiresIn: '1h' }
  );

const buildHeaders = (headers = {}) => ({
  'Content-Type': 'application/json',
  ...headers,
});

const parseResponse = async (response, url) => {
  const contentType = response.headers.get('content-type');
  const body = contentType?.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof body === 'object' && body?.message
      ? body.message
      : `HTTP ${response.status} from ${url}`;
    throw ApiError.badRequest(message);
  }

  return body;
};

/**
 * HTTP client for inter-service communication.
 */
export const httpGet = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(options.headers),
    });
    return parseResponse(response, url);
  } catch (error) {
    if (error.isOperational) throw error;
    logger.error(`GET ${url} failed: ${error.message}`);
    throw ApiError.badRequest(`Failed to reach service at ${url}`);
  }
};

export const httpPost = async (url, data, options = {}) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(options.headers),
      body: JSON.stringify(data),
    });
    return parseResponse(response, url);
  } catch (error) {
    if (error.isOperational) throw error;
    logger.error(`POST ${url} failed: ${error.message}`);
    throw ApiError.badRequest(`Failed to reach service at ${url}`);
  }
};

export const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const serviceHeaders = () => ({
  'x-service-token': config.serviceToken,
});
