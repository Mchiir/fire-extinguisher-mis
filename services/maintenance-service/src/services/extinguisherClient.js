import config from '../config/index.js';
import { httpRequest, unwrapData } from '../utils/httpClient.js';
import { ApiError } from '../utils/ApiError.js';
import { MESSAGES } from '../constants/messages.js';

const baseUrl = () => config.extinguisherServiceUrl.replace(/\/$/, '');

export const getExtinguisher = async (extinguisherId, token) => {
  try {
    const response = await httpRequest(`${baseUrl()}/extinguishers/${extinguisherId}`, { token });
    return unwrapData(response);
  } catch (error) {
    if (error.statusCode === 404) {
      throw ApiError.notFound(MESSAGES.EXTINGUISHER_NOT_FOUND);
    }
    throw error;
  }
};

export const patchExtinguisherStatus = async (extinguisherId, status, token) => {
  const response = await httpRequest(`${baseUrl()}/extinguishers/${extinguisherId}/status`, {
    method: 'PATCH',
    body: { status },
    token,
  });
  return unwrapData(response);
};
