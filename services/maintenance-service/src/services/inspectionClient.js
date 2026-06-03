import config from '../config/index.js';
import { httpRequest, unwrapData } from '../utils/httpClient.js';
import { ApiError } from '../utils/ApiError.js';
import { INSPECTION_STATUS } from '../constants/actions.js';
import { MESSAGES } from '../constants/messages.js';

const baseUrl = () => config.inspectionServiceUrl.replace(/\/$/, '');

export const getInspection = async (inspectionId, token) => {
  try {
    const response = await httpRequest(`${baseUrl()}/inspections/${inspectionId}`, { token });
    return unwrapData(response);
  } catch (error) {
    if (error.statusCode === 404) {
      throw ApiError.notFound(MESSAGES.INSPECTION_NOT_FOUND);
    }
    throw error;
  }
};

export const validateCompletedInspection = async (inspectionId, extinguisherId, token) => {
  const inspection = await getInspection(inspectionId, token);

  if (inspection.status !== INSPECTION_STATUS.COMPLETED) {
    throw ApiError.badRequest(MESSAGES.INSPECTION_NOT_COMPLETED);
  }

  const inspectionExtinguisherId =
    inspection.extinguisherId?._id?.toString?.() ??
    inspection.extinguisherId?.toString?.() ??
    inspection.extinguisherId;

  if (inspectionExtinguisherId && inspectionExtinguisherId !== extinguisherId) {
    throw ApiError.badRequest(MESSAGES.INSPECTION_EXTINGUISHER_MISMATCH);
  }

  return inspection;
};
