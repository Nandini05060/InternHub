// Custom HTTP Client wrapper using fetch for maximum lightness and zero bloat
const BASE_URL = '/api';

export async function apiClient(endpoint, options = {}) {
  const { data, headers = {}, ...customConfig } = options;
  const token = localStorage.getItem('internhub_token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers
  };

  const config = {
    method: data ? 'POST' : 'GET',
    headers: defaultHeaders,
    ...customConfig
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Auto logout on 401 if token was sent
      if (response.status === 401 && token && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('internhub_token');
        localStorage.removeItem('internhub_user');
        window.dispatchEvent(new Event('auth-expired'));
      }
      const error = new Error(result.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = result;
      throw error;
    }

    return result;
  } catch (err) {
    throw err;
  }
}
