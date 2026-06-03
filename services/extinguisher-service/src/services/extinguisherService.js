import FireExtinguisher from '../models/FireExtinguisher.js';
import { ApiError } from '../utils/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { EXTINGUISHER_STATUS, DEFAULT_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';

const findByIdOrThrow = async (id) => {
  const extinguisher = await FireExtinguisher.findById(id);
  if (!extinguisher) {
    throw ApiError.notFound(MESSAGES.NOT_FOUND);
  }
  return extinguisher;
};

const buildListFilter = ({ status, type, search }) => {
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = new RegExp(type, 'i');
  if (search) {
    filter.$or = [
      { serialNumber: new RegExp(search, 'i') },
      { location: new RegExp(search, 'i') },
    ];
  }
  return filter;
};

export const listExtinguishers = async (query) => {
  const { page, limit, status, type, search } = query;
  const filter = buildListFilter({ status, type, search });
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    FireExtinguisher.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    FireExtinguisher.countDocuments(filter),
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

export const getExtinguisherById = async (id) => findByIdOrThrow(id);

export const createExtinguisher = async (data) => {
  const payload = {
    ...data,
    serialNumber: data.serialNumber.toUpperCase(),
    status: data.status || DEFAULT_STATUS,
  };
  return FireExtinguisher.create(payload);
};

export const updateExtinguisher = async (id, data, userRole) => {
  const extinguisher = await findByIdOrThrow(id);

  if (userRole === ROLES.INSPECTOR) {
    const allowedKeys = ['status'];
    const attemptedKeys = Object.keys(data);
    const hasDisallowed = attemptedKeys.some((key) => !allowedKeys.includes(key));
    if (hasDisallowed) {
      throw ApiError.forbidden(MESSAGES.FORBIDDEN_UPDATE);
    }
    if (data.status) {
      extinguisher.status = data.status;
    }
    await extinguisher.save();
    return extinguisher;
  }

  if (data.serialNumber) {
    data.serialNumber = data.serialNumber.toUpperCase();
  }

  Object.assign(extinguisher, data);
  await extinguisher.save();
  return extinguisher;
};

export const deleteExtinguisher = async (id) => {
  const extinguisher = await findByIdOrThrow(id);
  await extinguisher.deleteOne();
  return extinguisher;
};

export const updateStatus = async (id, status) => {
  const extinguisher = await findByIdOrThrow(id);
  extinguisher.status = status;
  await extinguisher.save();
  return extinguisher;
};

export const getExpiringExtinguishers = async (days) => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return FireExtinguisher.find({
    expiryDate: { $gte: now, $lte: futureDate },
    status: { $nin: [EXTINGUISHER_STATUS.EXPIRED, EXTINGUISHER_STATUS.RETIRED] },
  }).sort({ expiryDate: 1 });
};

export const getExpiredAndMark = async () => {
  const now = new Date();

  await FireExtinguisher.updateMany(
    {
      expiryDate: { $lt: now },
      status: { $nin: [EXTINGUISHER_STATUS.EXPIRED, EXTINGUISHER_STATUS.RETIRED] },
    },
    { $set: { status: EXTINGUISHER_STATUS.EXPIRED } }
  );

  return FireExtinguisher.find({
    $or: [{ status: EXTINGUISHER_STATUS.EXPIRED }, { expiryDate: { $lt: now } }],
  }).sort({ expiryDate: 1 });
};
