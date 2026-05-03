import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const api = apiClient;

export const projectsAPI = {
  getAll: () => apiClient.get('/projects'),
  getById: (projectId) => apiClient.get(`/projects/${projectId}`),
  create: (data) => apiClient.post('/projects', data),
};

export const heatmapAPI = {
  get: (projectId) => apiClient.get(`/heatmaps/${projectId}`),
};

export const testSelectionAPI = {
  recommend: (data) => apiClient.post('/test-selection/recommend', data),
};

export const riskAssessmentAPI = {
  evaluate: (data) => apiClient.post('/risk-assessment/evaluate', data),
};

export const dashboardAPI = {
  getExecutive: (projectId) => apiClient.get(`/dashboard/executive/${projectId}`),
  getQA: (projectId) => apiClient.get(`/dashboard/qa/${projectId}`),
};

export default apiClient;
