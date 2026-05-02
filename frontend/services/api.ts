import axios from 'axios';

// Retry logic with exponential backoff
const fetchWithRetry = async (
  fn: () => Promise<any>,
  retries = 2,
  delay = 1000
): Promise<any> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    console.log(`[RETRY] Retrying in ${delay}ms... (${retries} retries left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(fn, retries - 1, delay * 2);
  }
};

// Health check
export const checkHealth = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    console.error('[HEALTH CHECK FAILED]', error);
    return false;
  }
};

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
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API ERROR]', {
      url: error.config?.url,
      message: error.message,
      status: error.response?.status,
    });

    // Network error handling
    if (error.message === 'Network Error') {
      console.error('[NETWORK ERROR] Backend may be unreachable');
    }

    if (error.response?.status === 401) {
      // We don't clear localStorage here entirely because we have separate user/admin contexts, 
      // but if we are 401, maybe redirect.
      // A better approach is handled by middleware or specific logout actions.
    }
    return Promise.reject(error);
  }
);

export default api;
export { fetchWithRetry };
