import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send HTTP-only cookies
});

// Request interceptor to add context role
api.interceptors.request.use(
  (config) => {
    // Only access window if we're in the browser
    if (typeof window !== 'undefined') {
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      config.headers['x-app-role'] = isAdminRoute ? 'admin' : 'user';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // We don't clear localStorage here entirely because we have separate user/admin contexts, 
      // but if we are 401, maybe redirect.
      // A better approach is handled by middleware or specific logout actions.
    }
    return Promise.reject(error);
  }
);

export default api;
