import config from '../config/index.js';
import { ApiError } from './ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import logger from './logger.js';

/**
 * Performs a GET request and parses JSON. Throws ApiError on failure.
 */
const getJson = async (url, { authorization } = {}) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: authorization },
    });

    if (response.status === 404) {
      return { ok: false, status: 404, body: null };
    }

    if (!response.ok) {
      logger.warn(`Upstream GET ${url} returned ${response.status}`);
      throw ApiError.badGateway(`Upstream service returned ${response.status}`);
    }

    const body = await response.json();
    return { ok: true, status: response.status, body };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error(`Upstream GET ${url} failed: ${error.message}`);
    throw ApiError.badGateway('Failed to reach upstream service');
  }
};

/**
 * Validates that a fire extinguisher exists via the extinguisher service.
 */
export const verifyExtinguisherExists = async (extinguisherId, authorization) => {
  const url = `${config.extinguisherServiceUrl}/extinguishers/${extinguisherId}`;
  const { ok } = await getJson(url, { authorization });

  if (!ok) {
    throw ApiError.notFound(MESSAGES.EXTINGUISHER_NOT_FOUND);
  }
};

/**
 * Validates that a user exists and has the INSPECTOR role via the user service.
 */
export const verifyInspectorExists = async (inspectorId, authorization) => {
  const url = `${config.userServiceUrl}/users/${inspectorId}/verify?role=INSPECTOR`;
  const { body } = await getJson(url, { authorization });

  if (!body?.data?.exists) {
    throw ApiError.notFound(MESSAGES.INSPECTOR_NOT_FOUND);
  }
};
