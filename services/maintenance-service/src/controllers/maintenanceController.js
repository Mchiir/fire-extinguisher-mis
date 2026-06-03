import * as maintenanceService from '../services/maintenanceService.js';
import { MESSAGES } from '../constants/messages.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const result = await maintenanceService.listMaintenanceRecords(req.query);
  res.json({
    success: true,
    message: MESSAGES.LIST_RETRIEVED,
    data: result,
  });
});

export const getById = asyncHandler(async (req, res) => {
  const record = await maintenanceService.getMaintenanceById(req.params.id);
  res.json({
    success: true,
    message: MESSAGES.RETRIEVED,
    data: record,
  });
});

export const getByInspector = asyncHandler(async (req, res) => {
  const result = await maintenanceService.getByInspector(req.params.inspectorId, req.query);
  res.json({
    success: true,
    message: MESSAGES.LIST_RETRIEVED,
    data: result,
  });
});

export const getByExtinguisher = asyncHandler(async (req, res) => {
  const result = await maintenanceService.getByExtinguisher(req.params.extinguisherId, req.query);
  res.json({
    success: true,
    message: MESSAGES.LIST_RETRIEVED,
    data: result,
  });
});

export const create = asyncHandler(async (req, res) => {
  const record = await maintenanceService.createMaintenanceRecord(
    req.body,
    req.user,
    req.accessToken
  );
  res.status(201).json({
    success: true,
    message: MESSAGES.CREATED,
    data: record,
  });
});

export const update = asyncHandler(async (req, res) => {
  const record = await maintenanceService.updateMaintenanceRecord(
    req.params.id,
    req.body,
    req.accessToken
  );
  res.json({
    success: true,
    message: MESSAGES.UPDATED,
    data: record,
  });
});

export const remove = asyncHandler(async (req, res) => {
  await maintenanceService.deleteMaintenanceRecord(req.params.id);
  res.json({
    success: true,
    message: MESSAGES.DELETED,
    data: null,
  });
});
