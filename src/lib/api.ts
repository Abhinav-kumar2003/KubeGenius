import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor for Auth
// eslint-disable-next-line @typescript-eslint/no-explicit-any
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const metricsApi = {
  getCpu: () => api.get('/metrics/cpu'),
  getMemory: () => api.get('/metrics/memory'),
  getRequests: () => api.get('/metrics/requests'),
  getCluster: () => api.get('/metrics/cluster'),
};

export const k8sApi = {
  getDeployments: () => api.get('/k8s/deployments'),
  getPods: () => api.get('/k8s/pods'),
  getNodes: () => api.get('/k8s/nodes'),
  scaleDeployment: (name: string, replicas: number) => 
    api.post('/k8s/scale', { name, replicas }),
};

export const mlApi = {
  getPredictions: () => api.get('/ml/predict'),
  getStatus: () => api.get('/ml/status'),
};
