import { ApiError } from './ApiError.js';
import logger from './logger.js';

/**
 * Lightweight HTTP client for aggregating data from other microservices.
 */
export const httpRequest = async (url, options = {}) => {
  const { method = 'GET', token, body } = options;
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    logger.error(`HTTP request failed: ${url} - ${error.message}`);
    throw ApiError.badGateway('Failed to reach upstream service');
  }

  const contentType = response.headers.get('content-type');
  const payload = contentType?.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || `Upstream request failed (${response.status})`;
    throw ApiError.badGateway(message);
  }

  return payload;
};

export const unwrapData = (payload) => payload?.data ?? payload;
