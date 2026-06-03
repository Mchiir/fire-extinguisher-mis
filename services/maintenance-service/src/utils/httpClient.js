import { ApiError } from './ApiError.js';
import logger from './logger.js';

/**
 * Lightweight HTTP client for inter-service calls (forwards JWT when provided).
 */
export const httpRequest = async (url, options = {}) => {
  const { method = 'GET', headers = {}, body, token } = options;

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    logger.error(`HTTP request failed: ${url} - ${error.message}`);
    throw ApiError.badGateway('Failed to reach upstream service');
  }

  let payload;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    payload = await response.json();
  } else {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || `Upstream request failed (${response.status})`;
    if (response.status === 404) {
      throw ApiError.notFound(message);
    }
    if (response.status === 400 || response.status === 422) {
      throw ApiError.badRequest(message, payload?.errors);
    }
    if (response.status === 401) {
      throw ApiError.unauthorized(message);
    }
    if (response.status === 403) {
      throw ApiError.forbidden(message);
    }
    throw ApiError.badGateway(message);
  }

  return payload;
};

export const unwrapData = (payload) => payload?.data ?? payload;
