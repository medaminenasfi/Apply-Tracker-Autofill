import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { DEMO_USER, ADMIN_USER } from '@/lib/mock-data';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Mock authentication with demo credentials
          if (email === 'demo@applyflow.com' && password === '123456') {
            set({ user: DEMO_USER, isAuthenticated: true });
          } else if (email === 'admin@applyflow.com' && password === '123456') {
            set({ user: ADMIN_USER, isAuthenticated: true });
          } else {
            throw new Error('Invalid credentials');
          }
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (userData) => {
        set({ isLoading: true });
        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Create new user
          const newUser: User = {
            id: Date.now().toString(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: 'user',
            createdAt: new Date().toISOString(),
          };

          // TODO: Send to NestJS API: POST /auth/signup
          set({ user: newUser, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: async (userData) => {
        const currentUser = get().user;
        if (!currentUser) throw new Error('No user logged in');

        set({ isLoading: true });
        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // TODO: Send to NestJS API: PUT /users/:id
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
        } finally {
          set({ isLoading: false });
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: user !== null });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
