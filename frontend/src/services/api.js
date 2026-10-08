import axios from 'axios';
import { handleMockFallback } from './mockService';

// Resolve production API Base URL from environment variable
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const cleanBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');

// If VITE_API_BASE_URL is provided, ensure /api suffix is handled cleanly
export const API_BASE_URL = cleanBaseUrl
  ? (cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`)
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token if available
api.interceptors.request.use((config) => {
  let token = null;
  try {
    token = localStorage.getItem('token') || sessionStorage.getItem('token');
  } catch {}
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Intercept responses: if backend is unavailable (404/405/500, static CDN SPA rewrite returning HTML, or network down),
// seamlessly fallback to the client-side simulation engine so that users anywhere on the web have 100% functionality.
api.interceptors.response.use(
  async (response) => {
    // When hosted on a static CDN with SPA rewrites (e.g. Vercel rewrite /* to index.html),
    // missing API endpoints return HTTP 200 with the HTML page content.
    // Detect this and seamlessly execute the client simulation engine.
    const isHtmlResponse =
      typeof response.data === 'string' &&
      (response.data.includes('<!doctype html') ||
       response.data.includes('<html') ||
       response.headers?.['content-type']?.includes('text/html'));

    if (isHtmlResponse && response.config) {
      try {
        const mockResponse = await handleMockFallback(response.config);
        if (mockResponse) {
          return mockResponse;
        }
      } catch (mockErr) {
        console.warn('Simulation fallback on HTML response failed:', mockErr);
      }
    }
    return response;
  },
  async (error) => {
    const isStaticDeployOrOffline =
      (error.response && (error.response.status === 404 || error.response.status === 405 || error.response.status === 500)) ||
      error.code === 'ERR_NETWORK' ||
      !error.response;

    if (isStaticDeployOrOffline && error.config) {
      try {
        const mockResponse = await handleMockFallback(error.config);
        if (mockResponse) {
          return mockResponse;
        }
      } catch (mockErr) {
        console.warn('Simulation fallback on error failed:', mockErr);
      }
    }

    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
        } catch {}
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const datasetsAPI = {
  list: () => api.get('/datasets'),
  get: (id) => api.get(`/datasets/${id}`),
  getPreview: (id) => api.get(`/datasets/${id}/preview`),
  getStats: (id) => api.get(`/datasets/${id}/statistics`),
  upload: (formData) => api.post('/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  loadSample: (sampleType) => api.post(`/datasets/load-sample?sample_type=${sampleType}`),
  selectTarget: (id, targetCol) => api.post(`/datasets/${id}/target`, { target_column: targetCol }),
  delete: (id) => api.delete(`/datasets/${id}`),
};

export const preprocessingAPI = {
  run: (config) => api.post('/preprocessing/run', config),
  get: (id) => api.get(`/preprocessing/${id}`),
};

export const modelsAPI = {
  list: () => api.get('/models'),
  get: (id) => api.get(`/models/${id}`),
  train: (config) => api.post('/models/train', config),
  delete: (id) => api.delete(`/models/${id}`),
};

export const robustnessAPI = {
  run: (config) => api.post('/robustness/run', config),
  getExperiment: (id) => api.get(`/robustness/experiments/${id}`),
  deleteExperiment: (id) => api.delete(`/robustness/experiments/${id}`),
};

export const defenceAPI = {
  runInputValidation: (config) => api.post('/defence/input-validation', config),
  runAdversarialTraining: (config) => api.post('/defence/adversarial-training', config),
  runEnsemble: (config) => api.post('/defence/ensemble', config),
};

export const comparisonAPI = {
  getModelsComparison: () => api.get('/comparison/models'),
  getExperimentsComparison: () => api.get('/comparison/experiments'),
};

export const reportsAPI = {
  generate: (experimentId, format, customTitle) => api.post(`/reports/generate/${experimentId}`, {
    experiment_id: experimentId,
    format: format || 'pdf',
    custom_title: customTitle,
  }),
  list: () => api.get('/reports'),
  getDownloadUrl: (id) => `${API_BASE_URL}/reports/${id}/download`,
  getViewUrl: (id) => `${API_BASE_URL}/reports/${id}/view`,
};

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
};

export const demoAPI = {
  run: () => api.post('/demo/run'),
};

export default api;
