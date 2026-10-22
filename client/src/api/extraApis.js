import { apiClient } from './axiosClient.js';

export const applicationApi = {
  getApplications: () => apiClient('/applications'),
  getStats: () => apiClient('/applications/stats'),
  trackApplication: (internshipId, data = {}) =>
    apiClient(`/applications/${internshipId}`, { method: 'POST', data }),
  updateStatus: (internshipId, status, notes) =>
    apiClient(`/applications/${internshipId}`, { method: 'PATCH', data: { status, notes } }),
};

export const bookmarkApi = {
  getBookmarks: () => apiClient('/bookmarks'),
  saveBookmark: (id) => apiClient(`/bookmarks/${id}`, { method: 'POST' }),
  unsaveBookmark: (id) => apiClient(`/bookmarks/${id}`, { method: 'DELETE' }),
};

export const notificationApi = {
  getNotifications: () => apiClient('/notifications'),
  markRead: (id) => apiClient(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiClient('/notifications/read-all', { method: 'PATCH' }),
};

export const adminApi = {
  getStats: () => apiClient('/admin/stats'),
  getStudents: () => apiClient('/admin/students'),
  toggleBlockStudent: (id, is_blocked) =>
    apiClient(`/admin/students/${id}/block`, { method: 'PATCH', data: { is_blocked } }),
};
