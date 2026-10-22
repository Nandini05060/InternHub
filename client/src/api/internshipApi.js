import { apiClient } from './axiosClient.js';

export const internshipApi = {
  getInternships: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/internships${queryString}`);
  },

  getInternshipById: (id) => apiClient(`/internships/${id}`),

  createInternship: (data) => apiClient('/internships', { method: 'POST', data }),

  updateInternship: (id, data) => apiClient(`/internships/${id}`, { method: 'PUT', data }),

  deleteInternship: (id) => apiClient(`/internships/${id}`, { method: 'DELETE' }),

  verifyInternship: (id, status) =>
    apiClient(`/internships/${id}/verify`, { method: 'PATCH', data: { status } }),

  toggleExpired: (id, is_expired) =>
    apiClient(`/internships/${id}/toggle-expired`, { method: 'PATCH', data: { is_expired } }),
};
