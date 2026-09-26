import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const dashboardApi = {
  getOverview: (service = 'all') => api.get(`/dashboard/overview?service=${service}`),
  getFunnel: (service = 'all') => api.get(`/dashboard/funnel?service=${service}`),
  getDevices: (service = 'all') => api.get(`/dashboard/devices?service=${service}`),
  getLandingPages: () => api.get('/dashboard/landing-pages'),
  getForms: (service = 'all') => api.get(`/dashboard/forms?service=${service}`),
  getCampaigns: () => api.get('/dashboard/campaigns'),
  getGeo: () => api.get('/dashboard/geo'),
  getTechHealth: () => api.get('/dashboard/tech-health'),
  getDiagnostics: (service = 'all', device = 'all') => api.get(`/dashboard/diagnostics?service=${service}&device=${device}`),
  askAiAnalyst: (query, serviceSlug = 'all') => api.post('/ai/analyze', { query, serviceSlug }),
  simulateLead: (payload) => api.post('/crm/simulate-lead', payload)
};

export default api;
