import axios from 'axios';

// JWT token validation helper
export const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return true;
    }
    return false;
  } catch (e) {
    return true;
  }
};

// Auth logout handler
const handleAuthError = (role: 'user' | 'admin') => {
  console.log(`[AUTH ERROR] ${role.toUpperCase()} session expired or invalid - logging out`);
  
  // Clear localStorage
  if (role === 'user') {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  } else {
    localStorage.removeItem('admin');
    localStorage.removeItem('isAdminAuthenticated');
  }
  
  // Force page reload to clear state and redirect
  if (typeof window !== 'undefined') {
    window.location.href = role === 'admin' ? '/admin/login' : '/login';
  }
};

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
    
    // Auto-logout on 401
    if (error.response?.status === 401) {
      handleAuthError('user');
    }
    
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
    
    // Auto-logout on 401
    if (error.response?.status === 401) {
      handleAuthError('admin');
    }
    
    return Promise.reject(error);
  }
);

// Legacy API instance for backward compatibility (defaults to user)
const api = userApi;

export default api;
export { fetchWithRetry };
