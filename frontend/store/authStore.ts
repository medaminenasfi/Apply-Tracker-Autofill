import { create } from 'zustand';
import { User } from '@/types';
import api, { adminApi, isTokenExpired } from '@/services/api';

let authCheckInterval: NodeJS.Timeout | null = null;

// Periodic auth check function
const startAuthCheck = () => {
  if (authCheckInterval) clearInterval(authCheckInterval);
  
  authCheckInterval = setInterval(() => {
    if (typeof window === 'undefined') return;
    
    const userToken = document.cookie.split(';').find(c => c.trim().startsWith('user_token='))?.split('=')[1];
    const adminToken = document.cookie.split(';').find(c => c.trim().startsWith('admin_token='))?.split('=')[1];
    
    let needsLogout = false;
    let logoutRole: 'user' | 'admin' | null = null;
    
    if (userToken && isTokenExpired(userToken)) {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      needsLogout = true;
      logoutRole = 'user';
    }
    
    if (adminToken && isTokenExpired(adminToken)) {
      localStorage.removeItem('admin');
      localStorage.removeItem('isAdminAuthenticated');
      needsLogout = true;
      logoutRole = logoutRole || 'admin';
    }
    
    if (needsLogout && logoutRole) {
      clearInterval(authCheckInterval!);
      authCheckInterval = null;
      window.location.href = logoutRole === 'admin' ? '/admin/login' : '/login';
    }
  }, 60000); // Check every minute
};

interface AuthState {
  user: User | null;
  admin: any | null; // using any for now or specify Admin type
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  adminLogout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  setAdmin: (admin: any | null) => void;
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

// Cookies are handled by backend only - no frontend cookie management

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  admin: null,
  isAuthenticated: false,
  isAdminAuthenticated: false,
  isLoading: false,
  isInitialized: false,

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
      const updatedUser = await useAuthStore.getState().fetchProfile();
      
      // Update profilePictureUpdatedAt timestamp for cache-busting
      const currentUser = get().user;
      if (currentUser) {
        const userWithTimestamp = {
          ...updatedUser,
          profilePictureUpdatedAt: Date.now()
        };
        localStorage.setItem('user', JSON.stringify(userWithTimestamp));
        set({ user: userWithTimestamp });
      }
      
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

    const userStr = localStorage.getItem('user');
    const adminStr = localStorage.getItem('admin');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const isAdminAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

    // Check token expiration by reading from cookies
    const userToken = document.cookie.split(';').find(c => c.trim().startsWith('user_token='))?.split('=')[1];
    const adminToken = document.cookie.split(';').find(c => c.trim().startsWith('admin_token='))?.split('=')[1];

    // Clear expired user session
    let userValid = isAuthenticated;
    if (userToken && isTokenExpired(userToken)) {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      userValid = false;
    }

    // Clear expired admin session
    let adminValid = isAdminAuthenticated;
    if (adminToken && isTokenExpired(adminToken)) {
      localStorage.removeItem('admin');
      localStorage.removeItem('isAdminAuthenticated');
      adminValid = false;
    }

    // Only load user state if user is authenticated and token is valid
    let user = null;
    if (userStr && userValid) {
      try { user = JSON.parse(userStr); } catch (e) {}
    }

    // Only load admin state if admin is authenticated and token is valid
    let admin = null;
    if (adminStr && adminValid) {
      try { admin = JSON.parse(adminStr); } catch (e) {}
    }

    set({ user, admin, isAuthenticated: userValid, isAdminAuthenticated: adminValid, isInitialized: true });
    
    // Start periodic auth check if user or admin is authenticated
    if (userValid || adminValid) {
      startAuthCheck();
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });

      const user = response.data.user;
      const token = response.data.access_token;

      // Prevent admin from logging in as normal user
      if (user.role === 'admin') {
        throw new Error('Please use the admin login portal.');
      }

      // Cookie is set by backend - no frontend cookie management

      // Fetch full profile to get profile picture URL
      try {
        const profileResponse = await api.get('/profile');
        const fullProfile = profileResponse.data;
        // Merge user data with profile data
        const fullUser = {
          ...user,
          ...fullProfile,
          userId: fullProfile.userId || user.userId,
          profilePictureUpdatedAt: Date.now()
        };

        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(fullUser));
        localStorage.setItem('isAuthenticated', 'true');

        // Set state
        set({
          user: fullUser,
          isAuthenticated: true
        });
      } catch (profileError) {
        console.error('Failed to fetch profile after login:', profileError);
        // Fallback to basic user data
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        set({
          user,
          isAuthenticated: true
        });
      }
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

      // Cookie is set by backend - no frontend cookie management

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');

      // Set state
      set({
        user,
        isAuthenticated: true
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
      if (authCheckInterval) {
        clearInterval(authCheckInterval);
        authCheckInterval = null;
      }
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      set({ user: null, isAuthenticated: false });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },

  adminLogout: async () => {
    try {
      // Call backend to clear admin_token cookie
      await adminApi.post('/auth/logout');
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      if (authCheckInterval) {
        clearInterval(authCheckInterval);
        authCheckInterval = null;
      }
      localStorage.removeItem('admin');
      localStorage.removeItem('isAdminAuthenticated');
      set({ admin: null, isAdminAuthenticated: false });
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
        userId: currentUser?.userId,
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

  setAdmin: (admin) => {
    if (admin) {
      localStorage.setItem('admin', JSON.stringify(admin));
      localStorage.setItem('isAdminAuthenticated', 'true');
    } else {
      localStorage.removeItem('admin');
      localStorage.removeItem('isAdminAuthenticated');
    }
    set({ admin, isAdminAuthenticated: admin !== null });
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
        userId: profile.userId || currentUser?.userId,
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
