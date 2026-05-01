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
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  initialize: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  fetchProfile: () => Promise<User>;
  uploadCV: (file: File) => Promise<string>;
  createAdmin: (email: string, password: string) => Promise<any>;
  getCV: () => Promise<{ hasCV: boolean; cvUrl: string | null; filename: string | null }>;
  deleteCV: () => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string>;
  deleteProfilePicture: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  token: null,

  uploadProfilePicture: async (file: File) => {
    set({ isLoading: true });
    try {
      console.log('Uploading profile picture:', file.name);
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await api.post('/profile/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Profile picture upload response:', response.data);
      
      // Refresh profile to get updated profile picture URL
      await useAuthStore.getState().fetchProfile();
      
      return response.data.profilePictureUrl;
    } catch (error: any) {
      console.error('Failed to upload profile picture:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProfilePicture: async () => {
    set({ isLoading: true });
    try {
      await api.delete('/profile/profile-picture');
      
      // Refresh profile to remove profile picture URL
      await useAuthStore.getState().fetchProfile();
    } catch (error: any) {
      console.error('Failed to delete profile picture:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete profile picture');
    } finally {
      set({ isLoading: false });
    }
  },

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

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      set({ user: null, isAuthenticated: false, token: null });
    }
  },

  updateProfile: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await api.put('/profile', userData);
      
      const profile = response.data;
      const currentUser = get().user;
      
      // Update user object with profile data, preserving required fields
      const updatedUser: User = {
        _id: currentUser?._id || '',
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        university: profile.university,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
        role: currentUser?.role || 'user',
        createdAt: currentUser?.createdAt || '',
      };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      set({ user: updatedUser });
    } catch (error: any) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.response?.data?.error || 'Profile update failed');
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

  forgotPassword: async (email: string) => {
    set({ isLoading: true });
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send password reset email');
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    set({ isLoading: true });
    try {
      await api.post('/auth/reset-password', { token, newPassword });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/profile');
      const profile = response.data;
      console.log('Fetched profile data:', profile);
      const currentUser = get().user;
      
      // Merge profile data with user data, preserving required fields
      const updatedUser: User = {
        _id: currentUser?._id || '',
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        university: profile.university,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
        profilePictureUrl: profile.profilePictureUrl,
        role: currentUser?.role || 'user',
        createdAt: currentUser?.createdAt || '',
      };
      
      console.log('Updated user object:', updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      set({ user: updatedUser });
      return updatedUser;
    } catch (error: any) {
      console.error('Fetch profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    } finally {
      set({ isLoading: false });
    }
  },

  uploadCV: async (file: File) => {
    set({ isLoading: true });
    try {
      const formData = new FormData();
      formData.append('cv', file);
      
      const response = await api.post('/profile/cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh profile to get updated CV URL
      await useAuthStore.getState().fetchProfile();
      
      return response.data.cvUrl;
    } catch (error: any) {
      console.error('Failed to upload CV:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload CV');
    } finally {
      set({ isLoading: false });
    }
  },

  createAdmin: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/admin/create-admin', { email, password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create admin');
    } finally {
      set({ isLoading: false });
    }
  },

  getCV: async () => {
    try {
      const response = await api.get('/profile/cv');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch CV info');
    }
  },

  deleteCV: async () => {
    set({ isLoading: true });
    try {
      const response = await api.delete('/profile/cv');
      
      // Refresh profile to get updated data
      await useAuthStore.getState().fetchProfile();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete CV');
    } finally {
      set({ isLoading: false });
    }
  },
}));
