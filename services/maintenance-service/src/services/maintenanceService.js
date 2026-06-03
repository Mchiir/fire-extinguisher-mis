import MaintenanceRecord from '../models/MaintenanceRecord.js';
import { ApiError } from '../utils/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { MAINTENANCE_ACTIONS } from '../constants/actions.js';
import { EXTINGUISHER_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';
import * as extinguisherClient from './extinguisherClient.js';
import * as inspectionClient from './inspectionClient.js';

const findByIdOrThrow = async (id) => {
  const record = await MaintenanceRecord.findById(id);
  if (!record) {
    throw ApiError.notFound(MESSAGES.NOT_FOUND);
  }
  return record;
};

const COMPLETED_MAINTENANCE_ACTIONS = [
  MAINTENANCE_ACTIONS.REFILLED,
  MAINTENANCE_ACTIONS.PRESSURE_ADJUSTED,
  MAINTENANCE_ACTIONS.VALVE_REPLACED,
  MAINTENANCE_ACTIONS.SAFETY_PIN_REPLACED,
  MAINTENANCE_ACTIONS.HOSE_REPLACED,
  MAINTENANCE_ACTIONS.GAUGE_REPLACED,
  MAINTENANCE_ACTIONS.BODY_CLEANED,
];

export const resolveExtinguisherStatus = (actionTaken) => {
  if (actionTaken === MAINTENANCE_ACTIONS.RETIRED) {
    return EXTINGUISHER_STATUS.RETIRED;
  }
  if (COMPLETED_MAINTENANCE_ACTIONS.includes(actionTaken)) {
    return EXTINGUISHER_STATUS.ACTIVE;
  }
  return EXTINGUISHER_STATUS.UNDER_MAINTENANCE;
};

const buildListFilter = ({ extinguisherId, inspectorId, startDate, endDate }) => {
  const filter = {};
  if (extinguisherId) filter.extinguisherId = extinguisherId;
  if (inspectorId) filter.inspectorId = inspectorId;
  if (startDate || endDate) {
    filter.maintenanceDate = {};
    if (startDate) filter.maintenanceDate.$gte = startDate;
    if (endDate) filter.maintenanceDate.$lte = endDate;
  }
  return filter;
};

const syncExtinguisherStatus = async (extinguisherId, actionTaken, token) => {
  const status = resolveExtinguisherStatus(actionTaken);
  await extinguisherClient.patchExtinguisherStatus(extinguisherId, status, token);
};

export const listMaintenanceRecords = async (query) => {
  const { page, limit, extinguisherId, inspectorId, startDate, endDate } = query;
  const filter = buildListFilter({ extinguisherId, inspectorId, startDate, endDate });
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    MaintenanceRecord.find(filter).sort({ maintenanceDate: -1 }).skip(skip).limit(limit),
    MaintenanceRecord.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getMaintenanceById = async (id) => findByIdOrThrow(id);

export const getByInspector = async (inspectorId, query) => {
  return listMaintenanceRecords({ ...query, inspectorId });
};

export const getByExtinguisher = async (extinguisherId, query) => {
  return listMaintenanceRecords({ ...query, extinguisherId });
};

export const createMaintenanceRecord = async (data, user, token) => {
  const payload = { ...data };

  if (user.role === ROLES.INSPECTOR) {
    if (payload.inspectorId && payload.inspectorId !== user.id) {
      throw ApiError.forbidden(MESSAGES.INSPECTOR_MISMATCH);
    }
    payload.inspectorId = user.id;
  } else if (!payload.inspectorId) {
    throw ApiError.badRequest('inspectorId is required');
  }

  await extinguisherClient.getExtinguisher(payload.extinguisherId, token);

  if (payload.inspectionId) {
    await inspectionClient.validateCompletedInspection(
      payload.inspectionId,
      payload.extinguisherId,
      token
    );
  }

  const record = await MaintenanceRecord.create(payload);
  await syncExtinguisherStatus(payload.extinguisherId, payload.actionTaken, token);

  return record;
};

export const updateMaintenanceRecord = async (id, data, token) => {
  const record = await findByIdOrThrow(id);
  const previousExtinguisherId = record.extinguisherId;
  const previousAction = record.actionTaken;

  if (data.inspectionId) {
    await inspectionClient.validateCompletedInspection(
      data.inspectionId,
      data.extinguisherId || record.extinguisherId,
      token
    );
  }

  if (data.extinguisherId && data.extinguisherId !== record.extinguisherId) {
    await extinguisherClient.getExtinguisher(data.extinguisherId, token);
  }

  Object.assign(record, data);
  await record.save();

  const extinguisherId = record.extinguisherId;
  const actionTaken = record.actionTaken;

  if (token && (actionTaken !== previousAction || extinguisherId !== previousExtinguisherId)) {
    await syncExtinguisherStatus(extinguisherId, actionTaken, token);
  }

  return record;
};

export const deleteMaintenanceRecord = async (id) => {
  const record = await findByIdOrThrow(id);
  await record.deleteOne();
  return record;
};
