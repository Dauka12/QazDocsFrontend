import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  login: (data: any) => api.post('/api/auth/login', data),
  register: (data: any) => api.post('/api/auth/register', data),
  verifyEmail: (data: any) => api.post('/api/auth/verify-email', data),
  getMe: () => api.get('/api/auth/me'),
};

// Organizations
export const orgApi = {
  create: (data: any) => api.post('/organizations', data),
  list: () => api.get('/organizations/list'),
  get: (id: number) => api.get(`/organizations?id=${id}`),
  createProfile: (data: any) => api.post('/profiles', data),
  listProfiles: (orgId: number) => api.get(`/profiles?organization_id=${orgId}`),
  inviteEmployee: (data: any) => api.post('/employees/invite', data),
  listEmployees: (orgId: number) => api.get(`/employees?organization_id=${orgId}`),
};

// Documents
export const docApi = {
  createTemplate: (data: any) => api.post('/documents/templates', data),
  listTemplates: () => api.get('/documents/templates'),
  createClause: (data: any) => api.post('/documents/clauses', data),
  listClauses: (category?: string) => api.get(`/documents/clauses${category ? `?category=${category}` : ''}`),
  createDocument: (data: any) => api.post('/documents/create', data),
  listDocuments: (orgId: number) => api.get(`/documents/list?organization_id=${orgId}`),
};

// AI
export const aiApi = {
  generate: (data: any) => api.post('/v1/ai/generate', data),
};
