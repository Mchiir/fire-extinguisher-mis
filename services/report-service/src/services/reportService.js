import * as upstream from './upstreamClient.js';
import { ROLES } from '../constants/roles.js';

const EXTINGUISHER_STATUS = {
  ACTIVE: 'ACTIVE',
  INSPECTION_DUE: 'INSPECTION_DUE',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  EXPIRED: 'EXPIRED',
  RETIRED: 'RETIRED',
};

const INSPECTION_STATUS = {
  PENDING: 'PENDING',
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const getPeriodRange = (period) => {
  const end = new Date();
  const start = new Date(end);

  if (period === 'daily') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'monthly') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else if (period === 'yearly') {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  }

  return { start, end, period };
};

const countByStatus = (items, statusField = 'status') =>
  items.reduce((acc, item) => {
    const key = item[statusField] || 'UNKNOWN';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

const filterByCreatedInRange = (items, start, end) =>
  items.filter((item) => {
    const created = new Date(item.createdAt || item.installationDate);
    return created >= start && created <= end;
  });

/**
 * Inventory report grouped by extinguisher status for a time period.
 */
export const generateInventoryReport = async (period, token) => {
  const range = getPeriodRange(period);
  const extinguishers = await upstream.fetchAllExtinguishers(token);
  const inPeriod = filterByCreatedInRange(extinguishers, range.start, range.end);

  return {
    period: range.period,
    generatedAt: new Date().toISOString(),
    range: { from: range.start, to: range.end },
    totalInSystem: extinguishers.length,
    addedInPeriod: inPeriod.length,
    byStatus: countByStatus(extinguishers),
    byType: extinguishers.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {}),
    items: inPeriod,
  };
};

/**
 * Inspection report filtered by status (PENDING, COMPLETED, CANCELLED).
 */
export const generateInspectionReport = async (status, token) => {
  const inspections = await upstream.fetchAllInspections(token, status);

  return {
    status: status || 'ALL',
    generatedAt: new Date().toISOString(),
    total: inspections.length,
    byStatus: countByStatus(inspections),
    items: inspections,
  };
};

/**
 * Maintenance report grouped by date, inspector, or extinguisher.
 */
export const generateMaintenanceReport = async (groupBy, query, token) => {
  const queryParts = [];
  if (query.startDate) queryParts.push(`startDate=${query.startDate}`);
  if (query.endDate) queryParts.push(`endDate=${query.endDate}`);
  if (query.inspectorId) queryParts.push(`inspectorId=${query.inspectorId}`);
  if (query.extinguisherId) queryParts.push(`extinguisherId=${query.extinguisherId}`);

  const records = await upstream.fetchAllMaintenance(token, queryParts.join('&'));

  const grouped = {};
  for (const record of records) {
    let key;
    if (groupBy === 'inspector') {
      key = record.inspectorId?.toString() || 'unknown';
    } else if (groupBy === 'extinguisher') {
      key = record.extinguisherId?.toString() || 'unknown';
    } else {
      const date = new Date(record.maintenanceDate);
      key = date.toISOString().slice(0, 10);
    }
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(record);
  }

  return {
    groupBy,
    generatedAt: new Date().toISOString(),
    total: records.length,
    groups: Object.entries(grouped).map(([key, items]) => ({ key, count: items.length, items })),
    items: records,
  };
};

/**
 * Expiry report: expiring soon, expired, or retired extinguishers.
 */
export const generateExpiryReport = async (type, token) => {
  const extinguishers = await upstream.fetchAllExtinguishers(token);
  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  let items = [];
  if (type === 'expiring') {
    items = extinguishers.filter(
      (e) =>
        e.status !== EXTINGUISHER_STATUS.EXPIRED &&
        e.status !== EXTINGUISHER_STATUS.RETIRED &&
        new Date(e.expiryDate) >= now &&
        new Date(e.expiryDate) <= in30Days
    );
  } else if (type === 'expired') {
    items = extinguishers.filter((e) => e.status === EXTINGUISHER_STATUS.EXPIRED);
  } else if (type === 'retired') {
    items = extinguishers.filter((e) => e.status === EXTINGUISHER_STATUS.RETIRED);
  }

  return {
    type,
    generatedAt: new Date().toISOString(),
    total: items.length,
    items,
  };
};

/**
 * Admin dashboard aggregate metrics.
 */
export const generateDashboardSummary = async (token, user) => {
  const [extinguishers, inspectionStats] = await Promise.all([
    upstream.fetchAllExtinguishers(token),
    upstream.fetchInspectionStats(token),
    // upstream.fetchUserCount(token),
  ]);

  const byStatus = countByStatus(extinguishers);

  let userCount = null;
  // role-based access: only admins can see user count
  if (user?.role === ROLES.ADMIN) {
    userCount = await upstream.fetchUserCount(token);
  }

  return {
    generatedAt: new Date().toISOString(),
    extinguishers: {
      total: extinguishers.length,
      active: byStatus[EXTINGUISHER_STATUS.ACTIVE] || 0,
      expired: byStatus[EXTINGUISHER_STATUS.EXPIRED] || 0,
      underMaintenance: byStatus[EXTINGUISHER_STATUS.UNDER_MAINTENANCE] || 0,
      inspectionDue: byStatus[EXTINGUISHER_STATUS.INSPECTION_DUE] || 0,
      retired: byStatus[EXTINGUISHER_STATUS.RETIRED] || 0,
    },
    // users: { total: userCount },
    inspections: inspectionStats || {
      total: 0,
      byStatus: {
        [INSPECTION_STATUS.PENDING]: 0,
        [INSPECTION_STATUS.SCHEDULED]: 0,
        [INSPECTION_STATUS.COMPLETED]: 0,
        [INSPECTION_STATUS.CANCELLED]: 0,
      },
    },

    // users only visible to admins
    ...(user?.role === ROLES.ADMIN && { users: { total: userCount } }),
  };
};