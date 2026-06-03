const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Session expired');
        const json = await res.json();
        accessToken = json.data.accessToken;
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

export const apiFetch = async (path, options = {}) => {
  const headers = { ...options.headers };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && accessToken && !path.includes('/auth/refresh')) {
    try {
      await refreshAccessToken();
      headers.Authorization = `Bearer ${accessToken}`;
      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include',
      });
    } catch {
      accessToken = null;
      throw new Error('Session expired');
    }
  }

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(json.message || 'Request failed');
    err.errors = json.errors;
    throw err;
  }
  return json;
};
