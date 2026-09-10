import axios from 'axios';

const apiOrigin = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const API = axios.create({
  baseURL: apiOrigin ? `${apiOrigin}/api/v1` : '/api/v1',
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.endsWith('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('adminToken');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.replace('/admin');
      }
    }
    return Promise.reject(error);
  },
);

export default API;
