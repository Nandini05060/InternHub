import { apiClient } from './axiosClient.js';

export const authApi = {
  login: (email, password) => apiClient('/auth/login', { data: { email, password } }),
  register: (userData) => apiClient('/auth/register', { data: userData }),
  getMe: () => apiClient('/auth/me'),
  updateProfile: (profileData) => apiClient('/auth/profile', { method: 'PUT', data: profileData }),
};
