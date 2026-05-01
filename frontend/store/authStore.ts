import { create } from 'zustand';
import { User } from '@/types';
import api from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  token: null,

  initialize: () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
      }
    }

    set({ user, isAuthenticated, token, isInitialized: true });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const user = response.data.user;
      const token = response.data.access_token;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Set state
      set({ 
        user, 
        isAuthenticated: true,
        token
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', userData);
      
      const user = response.data.user;
      const token = response.data.access_token;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Set state
      set({ 
        user, 
        isAuthenticated: true,
        token
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    set({ user: null, isAuthenticated: false, token: null });
  },

  updateProfile: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await api.put('/profile', userData);
      
      const user = response.data;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      set({ user });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
    set({ user, isAuthenticated: user !== null });
  },
}));
