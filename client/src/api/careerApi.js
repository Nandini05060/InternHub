import { apiClient } from './axiosClient.js';

export const careerApi = {
  // Resumes
  getResumes: () => apiClient('/career/resumes'),
  getResumeById: (id) => apiClient(`/career/resumes/${id}`),
  createResume: (data) => apiClient('/career/resumes', { method: 'POST', data }),
  updateResume: (id, data) => apiClient(`/career/resumes/${id}`, { method: 'PUT', data }),
  duplicateResume: (id, newTitle) => apiClient(`/career/resumes/${id}/duplicate`, { method: 'POST', data: { newTitle } }),
  deleteResume: (id) => apiClient(`/career/resumes/${id}`, { method: 'DELETE' }),
  checkQuality: (data) => apiClient('/career/resumes/check-quality', { method: 'POST', data }),

  // Resume Analyses
  getAnalyses: () => apiClient('/career/analyses'),
  deleteAnalysis: (id) => apiClient(`/career/analyses/${id}`, { method: 'DELETE' }),
  analyzeText: (data) => apiClient('/career/analyses/analyze', { method: 'POST', data }),
  analyzeFile: async (formData) => {
    const token = localStorage.getItem('internhub_token');
    const response = await fetch('/api/career/analyses/analyze', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'File upload analysis failed');
    }
    return result;
  },

  // Internship Matching
  getInternshipMatches: () => apiClient('/career/internship-matches'),

  // Placement Prep Tasks
  getPlacementTasks: (category) => apiClient(`/career/placement-tasks${category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''}`),
  createPlacementTask: (data) => apiClient('/career/placement-tasks', { method: 'POST', data }),
  togglePlacementTask: (id) => apiClient(`/career/placement-tasks/${id}/toggle`, { method: 'PATCH' }),
  updatePlacementTask: (id, data) => apiClient(`/career/placement-tasks/${id}`, { method: 'PUT', data }),
  deletePlacementTask: (id) => apiClient(`/career/placement-tasks/${id}`, { method: 'DELETE' }),

  // Certifications & Skills
  getCertifications: () => apiClient('/career/certifications'),
  createCertification: (data) => apiClient('/career/certifications', { method: 'POST', data }),
  updateCertification: (id, data) => apiClient(`/career/certifications/${id}`, { method: 'PUT', data }),
  deleteCertification: (id) => apiClient(`/career/certifications/${id}`, { method: 'DELETE' }),

  // Interview Practice
  getInterviewPractice: () => apiClient('/career/interview-practice'),
  saveInterviewPractice: (data) => apiClient('/career/interview-practice', { method: 'POST', data }),

  // Document Vault
  getVaultDocuments: () => apiClient('/career/vault'),
  createVaultDocument: (data) => apiClient('/career/vault', { method: 'POST', data }),
  deleteVaultDocument: (id) => apiClient(`/career/vault/${id}`, { method: 'DELETE' })
};
