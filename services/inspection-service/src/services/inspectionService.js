import Inspection from '../models/Inspection.js';
import { ApiError } from '../utils/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { INSPECTION_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';
import { verifyExtinguisherExists, verifyInspectorExists } from '../utils/httpClient.js';

const findByIdOrThrow = async (id) => {
  const inspection = await Inspection.findById(id);
  if (!inspection) {
    throw ApiError.notFound(MESSAGES.NOT_FOUND);
  }
  return inspection;
};

const buildRoleFilter = (user) => {
  if (user.role === ROLES.ADMIN) {
    return {};
  }
  if (user.role === ROLES.INSPECTOR) {
    return { inspectorId: user.id };
  }
  return { requestedBy: user.id };
};

const assertCanAccess = (inspection, user) => {
  if (user.role === ROLES.ADMIN) {
    return;
  }
  if (user.role === ROLES.USER && inspection.requestedBy.toString() === user.id) {
    return;
  }
  if (
    user.role === ROLES.INSPECTOR &&
    inspection.inspectorId &&
    inspection.inspectorId.toString() === user.id
  ) {
    return;
  }
  throw ApiError.forbidden(MESSAGES.FORBIDDEN_ACCESS);
};

const buildListFilter = (query, roleFilter) => {
  const filter = { ...roleFilter };
  if (query.status) filter.status = query.status;
  if (query.extinguisherId) filter.extinguisherId = query.extinguisherId;
  if (query.fromDate || query.toDate) {
    filter.scheduledDate = {};
    if (query.fromDate) filter.scheduledDate.$gte = query.fromDate;
    if (query.toDate) filter.scheduledDate.$lte = query.toDate;
  }
  return filter;
};

export const listInspections = async (query, user) => {
  const { page, limit } = query;
  const roleFilter = buildRoleFilter(user);
  const filter = buildListFilter(query, roleFilter);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Inspection.find(filter).sort({ scheduledDate: 1 }).skip(skip).limit(limit),
    Inspection.countDocuments(filter),
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

export const getInspectionById = async (id, user) => {
  const inspection = await findByIdOrThrow(id);
  assertCanAccess(inspection, user);
  return inspection;
};

export const createInspection = async (data, user, authorization) => {
  await verifyExtinguisherExists(data.extinguisherId, authorization);

  const requestedBy =
    user.role === ROLES.ADMIN && data.requestedBy ? data.requestedBy : user.id;

  return Inspection.create({
    extinguisherId: data.extinguisherId,
    requestedBy,
    scheduledDate: data.scheduledDate,
    notes: data.notes || null,
    status: INSPECTION_STATUS.PENDING,
  });
};

export const updateInspection = async (id, data, authorization) => {
  const inspection = await findByIdOrThrow(id);

  if (data.extinguisherId && data.extinguisherId !== inspection.extinguisherId.toString()) {
    await verifyExtinguisherExists(data.extinguisherId, authorization);
    inspection.extinguisherId = data.extinguisherId;
  }

  if (data.requestedBy) inspection.requestedBy = data.requestedBy;
  if (data.scheduledDate) inspection.scheduledDate = data.scheduledDate;
  if (data.notes !== undefined) inspection.notes = data.notes || null;
  if (data.status) inspection.status = data.status;

  await inspection.save();
  return inspection;
};

export const deleteInspection = async (id) => {
  const inspection = await findByIdOrThrow(id);
  await inspection.deleteOne();
  return inspection;
};

export const assignInspector = async (id, inspectorId, authorization) => {
  const inspection = await findByIdOrThrow(id);

  if (inspection.status === INSPECTION_STATUS.COMPLETED) {
    throw ApiError.badRequest(MESSAGES.INVALID_STATUS_TRANSITION);
  }
  if (inspection.status === INSPECTION_STATUS.CANCELLED) {
    throw ApiError.badRequest(MESSAGES.INVALID_STATUS_TRANSITION);
  }

  await verifyInspectorExists(inspectorId, authorization);

  inspection.inspectorId = inspectorId;
  inspection.status = INSPECTION_STATUS.SCHEDULED;
  await inspection.save();
  return inspection;
};

export const completeInspection = async (id, user, data = {}) => {
  const inspection = await findByIdOrThrow(id);

  if (!inspection.inspectorId || inspection.inspectorId.toString() !== user.id) {
    throw ApiError.forbidden(MESSAGES.INSPECTOR_NOT_ASSIGNED);
  }

  if (inspection.status !== INSPECTION_STATUS.SCHEDULED) {
    throw ApiError.badRequest(MESSAGES.INVALID_STATUS_TRANSITION);
  }

  inspection.status = INSPECTION_STATUS.COMPLETED;
  if (data.notes !== undefined) {
    inspection.notes = data.notes || null;
  }

  await inspection.save();
  return inspection;
};

export const cancelInspection = async (id, user, data = {}) => {
  const inspection = await findByIdOrThrow(id);

  if (user.role === ROLES.USER && inspection.requestedBy.toString() !== user.id) {
    throw ApiError.forbidden(MESSAGES.FORBIDDEN_ACCESS);
  }

  if (inspection.status === INSPECTION_STATUS.COMPLETED) {
    throw ApiError.badRequest(MESSAGES.CANCEL_NOT_ALLOWED);
  }

  if (inspection.status === INSPECTION_STATUS.CANCELLED) {
    return inspection;
  }

  inspection.status = INSPECTION_STATUS.CANCELLED;
  if (data.notes !== undefined) {
    inspection.notes = data.notes || null;
  }

  await inspection.save();
  return inspection;
};

export const listPendingScheduled = async () => {
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 7);

  return Inspection.find({
    status: { $in: [INSPECTION_STATUS.PENDING, INSPECTION_STATUS.SCHEDULED] },
    scheduledDate: { $lte: horizon },
  }).sort({ scheduledDate: 1 });
};

export const getStatsSummary = async (user) => {
  const roleFilter = buildRoleFilter(user);
  const now = new Date();

  const [statusCounts, upcomingCount, overdueCount] = await Promise.all([
    Inspection.aggregate([
      { $match: roleFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Inspection.countDocuments({
      ...roleFilter,
      status: INSPECTION_STATUS.SCHEDULED,
      scheduledDate: { $gte: now },
    }),
    Inspection.countDocuments({
      ...roleFilter,
      status: INSPECTION_STATUS.SCHEDULED,
      scheduledDate: { $lt: now },
    }),
  ]);

  const byStatus = Object.values(INSPECTION_STATUS).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  let total = 0;
  for (const row of statusCounts) {
    byStatus[row._id] = row.count;
    total += row.count;
  }

  return {
    total,
    byStatus,
    upcomingScheduled: upcomingCount,
    overdueScheduled: overdueCount,
  };
};
