const AUTH_STORAGE_KEY = 'moneymap_auth';
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api';

const getStoredToken = () => {
  const storedSession = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!storedSession) {
    return null;
  }

  try {
    const session = JSON.parse(storedSession);
    return session?.token || null;
  } catch {
    return null;
  }
};

export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export const apiFetch = (path, options = {}, { auth = true } = {}) => {
  const token = auth ? getStoredToken() : null;
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  };

  const body = options.body && headers['Content-Type'] === 'application/json' && typeof options.body !== 'string'
    ? JSON.stringify(options.body)
    : options.body;

  return fetch(apiUrl(path), {
    ...options,
    headers,
    body
  });
};
