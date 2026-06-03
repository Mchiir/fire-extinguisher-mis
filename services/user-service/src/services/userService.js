import User from '../models/User.js';
import { MESSAGES } from '../constants/messages.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * User management business logic — CRUD and verification for inter-service calls.
 */
export const listUsers = async ({ page, limit, role, search }) => {
  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const createUser = async ({ firstName, lastName, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict(MESSAGES.EMAIL_EXISTS);

  const user = await User.create({ firstName, lastName, email, password, role });
  return user;
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
  return user;
};

export const updateUser = async (id, updates) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);

  if (updates.email) {
    const existing = await User.findOne({ email: updates.email, _id: { $ne: id } });
    if (existing) throw ApiError.conflict(MESSAGES.EMAIL_EXISTS);
  }

  const sessionInvalidating = updates.password !== undefined || updates.role !== undefined;

  Object.assign(user, updates);

  if (sessionInvalidating) {
    user.tokenVersion += 1;
  }

  await user.save();
  return user;
};

export const deleteUser = async (id, requesterId) => {
  if (id === requesterId.toString()) {
    throw ApiError.badRequest(MESSAGES.CANNOT_DELETE_SELF);
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
  return user;
};

export const verifyUserExists = async (id, role = null) => {
  const query = { _id: id };
  if (role) query.role = role;
  const user = await User.findOne(query);
  return !!user;
};
