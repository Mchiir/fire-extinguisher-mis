import * as inspectionService from '../services/inspectionService.js';
import { MESSAGES } from '../constants/messages.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const result = await inspectionService.listInspections(req.query, req.user);
  res.json({
    success: true,
    message: MESSAGES.LIST_RETRIEVED,
    data: result,
  });
});

export const getById = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.getInspectionById(req.params.id, req.user);
  res.json({
    success: true,
    message: MESSAGES.RETRIEVED,
    data: inspection,
  });
});

export const create = asyncHandler(async (req, res) => {
  // console.log('Request to create inspection received:', req); // Debug log for access token
  const inspection = await inspectionService.createInspection(
    req.body, 
    req.user, 
    req.headers.authorization
  );
  res.status(201).json({
    success: true,
    message: MESSAGES.CREATED,
    data: inspection,
  });
});

export const update = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.updateInspection(
    req.params.id, 
    req.body, 
    req.headers.authorization
  );
  res.json({
    success: true,
    message: MESSAGES.UPDATED,
    data: inspection,
  });
});

export const remove = asyncHandler(async (req, res) => {
  await inspectionService.deleteInspection(req.params.id);
  res.json({
    success: true,
    message: MESSAGES.DELETED,
    data: null,
  });
});

export const assign = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.assignInspector(
    req.params.id,
    req.body.inspectorId,
    req.headers.authorization
  );
  res.json({
    success: true,
    message: MESSAGES.ASSIGNED,
    data: inspection,
  });
});

export const complete = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.completeInspection(
    req.params.id,
    req.user,
    req.body
  );
  res.json({
    success: true,
    message: MESSAGES.COMPLETED,
    data: inspection,
  });
});

export const cancel = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.cancelInspection(
    req.params.id,
    req.user,
    req.body
  );
  res.json({
    success: true,
    message: MESSAGES.CANCELLED,
    data: inspection,
  });
});

export const getPendingScheduled = asyncHandler(async (_req, res) => {
  const items = await inspectionService.listPendingScheduled();
  res.json({
    success: true,
    message: MESSAGES.PENDING_SCHEDULED_RETRIEVED,
    data: { items, count: items.length },
  });
});

export const getStatsSummary = asyncHandler(async (req, res) => {
  const stats = await inspectionService.getStatsSummary(req.user);
  res.json({
    success: true,
    message: MESSAGES.STATS_RETRIEVED,
    data: stats,
  });
});
