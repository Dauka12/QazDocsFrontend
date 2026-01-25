import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  searchUsers: (query: string) => api.get(`/api/auth/users/search?q=${query}`),
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

// Counterparties
export const counterpartyApi = {
  create: (data: any) => api.post('/counterparties', data),
  list: (orgId: number) => api.get(`/counterparties?organization_id=${orgId}`),
};

// Assignments
export const assignmentApi = {
  assign: (docId: number, data: any) => api.post(`/documents/${docId}/assign`, data),
  listByDoc: (docId: number) => api.get(`/documents/${docId}/assignments`),
  listMy: () => api.get('/assignments/my'),
  complete: (id: number, data: any) => api.post(`/assignments/${id}/complete`, data),
  reject: (id: number, data: any) => api.post(`/assignments/${id}/reject`, data),
  return: (id: number, data: any) => api.post(`/assignments/${id}/return`, data),
};

// Documents
export const docApi = {
  createTemplate: (data: any) => api.post('/documents/templates', data),
  listTemplates: () => api.get('/documents/templates'),
  createClause: (data: any) => api.post('/documents/clauses', data),
  listClauses: (category?: string) => api.get(`/documents/clauses${category ? `?category=${category}` : ''}`),
  createDocument: (data: any) => api.post('/documents/create', data),
  listMyDocuments: () => api.get('/documents/list?scope=personal'),
  listOrganizationDocuments: (orgId: number) => api.get(`/documents/list?organization_id=${orgId}&scope=organization`),
  wizard: (data: any) => api.post('/documents/wizard', data),
  update: (id: number, data: any) => api.patch(`/documents/${id}`, data),
  approve: (id: number) => api.post(`/documents/${id}/approve`),
  exportPdf: (id: number) => api.get(`/documents/${id}/export/pdf`, { responseType: 'blob' }),
  exportDocx: (id: number) => api.get(`/documents/${id}/export/docx`, { responseType: 'blob' }),
};

// Signing
export const signingApi = {
  init: (documentId: number) => api.post('/signing/init', { document_id: documentId }),
  verify: (operationId: number, signedXML: string) => api.post('/signing/verify', { operation_id: operationId, signed_xml: signedXML }),
  publicVerify: (publicId: string) => api.get(`/public/documents/${publicId}`),
  listSignatures: (docId: number) => api.get(`/documents/${docId}/signatures`),
};

// AI
export const aiApi = {
  generate: (data: any) => api.post('/v1/ai/generate', data),
};

// Lawyer Review Requests (for free_lawyer)
export const lawyerReviewApi = {
  create: (data: any) => api.post('/api/legal-requests', data),
  inbox: (status?: string) => api.get(`/api/legal-requests/inbox${status ? `?status=${status}` : ''}`),
  sent: () => api.get('/api/legal-requests/sent'),
  get: (id: number) => api.get(`/api/legal-requests/${id}`),
  accept: (id: number) => api.post(`/api/legal-requests/${id}/accept`),
  complete: (id: number, data: any) => api.post(`/api/legal-requests/${id}/complete`, data),
  decline: (id: number, data: any) => api.post(`/api/legal-requests/${id}/decline`, data),
  searchLawyers: (query: string) => api.get(`/api/users/lawyers?q=${query}`),
};
