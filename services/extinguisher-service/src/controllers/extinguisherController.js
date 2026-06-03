import * as extinguisherService from '../services/extinguisherService.js';
import { MESSAGES } from '../constants/messages.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const result = await extinguisherService.listExtinguishers(req.query);
  res.json({
    success: true,
    message: MESSAGES.LIST_RETRIEVED,
    data: result,
  });
});

export const getById = asyncHandler(async (req, res) => {
  const extinguisher = await extinguisherService.getExtinguisherById(req.params.id);
  res.json({
    success: true,
    message: MESSAGES.RETRIEVED,
    data: extinguisher,
  });
});

export const create = asyncHandler(async (req, res) => {
  const extinguisher = await extinguisherService.createExtinguisher(req.body);
  res.status(201).json({
    success: true,
    message: MESSAGES.CREATED,
    data: extinguisher,
  });
});

export const update = asyncHandler(async (req, res) => {
  const extinguisher = await extinguisherService.updateExtinguisher(
    req.params.id,
    req.body,
    req.user.role
  );
  res.json({
    success: true,
    message: MESSAGES.UPDATED,
    data: extinguisher,
  });
});

export const remove = asyncHandler(async (req, res) => {
  await extinguisherService.deleteExtinguisher(req.params.id);
  res.json({
    success: true,
    message: MESSAGES.DELETED,
    data: null,
  });
});

export const patchStatus = asyncHandler(async (req, res) => {
  const extinguisher = await extinguisherService.updateStatus(req.params.id, req.body.status);
  res.json({
    success: true,
    message: MESSAGES.STATUS_UPDATED,
    data: extinguisher,
  });
});

export const getExpiring = asyncHandler(async (req, res) => {
  const items = await extinguisherService.getExpiringExtinguishers(req.query.days);
  res.json({
    success: true,
    message: MESSAGES.EXPIRING_RETRIEVED,
    data: { items, count: items.length, days: req.query.days },
  });
});

export const getExpired = asyncHandler(async (req, res) => {
  const items = await extinguisherService.getExpiredAndMark();
  res.json({
    success: true,
    message: MESSAGES.EXPIRED_RETRIEVED,
    data: { items, count: items.length },
  });
});
