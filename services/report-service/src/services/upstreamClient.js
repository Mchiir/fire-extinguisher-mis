import config from '../config/index.js';
import { httpRequest, unwrapData } from '../utils/httpClient.js';

const PAGE_SIZE = 100;

const fetchAllPages = async (baseUrl, token, itemsKey = 'items') => {
  const items = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    const url = `${baseUrl}${separator}page=${page}&limit=${PAGE_SIZE}`;
    const payload = await httpRequest(url, { token });
    const data = unwrapData(payload);
    const batch = data[itemsKey] || data.users || [];
    items.push(...batch);
    totalPages = data.pagination?.totalPages || 1;
    page += 1;
  }

  return items;
};

export const fetchAllExtinguishers = (token) =>
  fetchAllPages(`${config.services.extinguisher}/extinguishers`, token);

export const fetchAllInspections = (token, status) => {
  const statusQuery = status ? `?status=${status}` : '';
  return fetchAllPages(`${config.services.inspection}/inspections${statusQuery}`, token);
};

export const fetchAllMaintenance = (token, query = '') => {
  const prefix = query ? `?${query}` : '';
  return fetchAllPages(`${config.services.maintenance}/maintenance${prefix}`, token);
};

export const fetchExpiringExtinguishers = async (token, days = 30) => {
  const url = `${config.services.extinguisher}/extinguishers/expiring?days=${days}`;
  const payload = await httpRequest(url, { token });
  return unwrapData(payload)?.items || [];
};

export const fetchUserCount = async (token) => {
  const url = `${config.services.user}/users?page=1&limit=1`;
  const payload = await httpRequest(url, { token });
  return unwrapData(payload)?.pagination?.total || 0;
};

export const fetchInspectionStats = async (token) => {
  const url = `${config.services.inspection}/inspections/stats/summary`;
  const payload = await httpRequest(url, { token });
  return unwrapData(payload);
};
