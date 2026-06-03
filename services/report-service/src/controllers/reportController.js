import * as reportService from '../services/reportService.js';
import { MESSAGES } from '../constants/messages.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const inventoryReport = asyncHandler(async (req, res) => {
  const report = await reportService.generateInventoryReport(req.query.period, req.accessToken);
  res.json({ success: true, message: MESSAGES.INVENTORY_REPORT, data: report });
});

export const inspectionReport = asyncHandler(async (req, res) => {
  const report = await reportService.generateInspectionReport(req.query.status, req.accessToken);
  res.json({ success: true, message: MESSAGES.INSPECTION_REPORT, data: report });
});

export const maintenanceReport = asyncHandler(async (req, res) => {
  const report = await reportService.generateMaintenanceReport(
    req.query.groupBy,
    req.query,
    req.accessToken
  );
  res.json({ success: true, message: MESSAGES.MAINTENANCE_REPORT, data: report });
});

export const expiryReport = asyncHandler(async (req, res) => {
  const report = await reportService.generateExpiryReport(req.query.type, req.accessToken);
  res.json({ success: true, message: MESSAGES.EXPIRY_REPORT, data: report });
});

export const dashboardSummary = asyncHandler(async (req, res) => {
  const report = await reportService.generateDashboardSummary(req.accessToken);
  res.json({ success: true, message: MESSAGES.DASHBOARD_REPORT, data: report });
});
