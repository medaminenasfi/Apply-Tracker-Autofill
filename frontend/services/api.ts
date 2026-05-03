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

// Base API configuration
const baseConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send HTTP-only cookies
};

console.log('[API CONFIG] baseURL:', baseConfig.baseURL);

// User API - only sends user_token
export const userApi = axios.create({
  ...baseConfig,
  withCredentials: true,
});

userApi.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    if (typeof window !== 'undefined') {
      config.headers['x-app-role'] = 'user';
    }
    console.log('[USER API REQUEST]', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
    return config;
  },
  (error) => Promise.reject(error)
);

userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[USER API ERROR]', {
      url: error.config?.url,
      message: error.message,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

// Admin API - only sends admin_token
export const adminApi = axios.create({
  ...baseConfig,
  withCredentials: true,
});

adminApi.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    if (typeof window !== 'undefined') {
      config.headers['x-app-role'] = 'admin';
    }
    console.log('[ADMIN API REQUEST]', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
    return config;
  },
  (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error') {
      console.error('[ADMIN NETWORK ERROR] Possible CORS or backend down');
    }
    console.error('[ADMIN API ERROR]', {
      url: error.config?.url,
      message: error.message,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

// Legacy API instance for backward compatibility (defaults to user)
const api = userApi;

export default api;
export { fetchWithRetry };
