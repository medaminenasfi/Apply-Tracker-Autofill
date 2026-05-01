import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Application, ApplicationStatus } from '@/types';
import { MOCK_APPLICATIONS } from '@/lib/mock-data';

interface ApplicationState {
  applications: Application[];
  isLoading: boolean;
  addApplication: (app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateApplication: (id: string, app: Partial<Application>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  moveApplication: (id: string, status: ApplicationStatus) => Promise<void>;
  reorderApplications: (status: ApplicationStatus, items: Application[]) => void;
  getApplicationsByStatus: (status: ApplicationStatus) => Application[];
  getAllApplications: () => Application[];
  setApplications: (apps: Application[]) => void;
  getApplicationsByUserId: (userId: string) => Application[];
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: MOCK_APPLICATIONS,
      isLoading: false,

      addApplication: (appData) => {
        const newApp: Application = {
          id: Date.now().toString(),
          ...appData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // TODO: Send to NestJS API: POST /applications
        set((state) => ({
          applications: [...state.applications, newApp],
        }));
      },

      updateApplication: async (id, updateData) => {
        set({ isLoading: true });
        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 300));

          // TODO: Send to NestJS API: PUT /applications/:id
          set((state) => ({
            applications: state.applications.map((app) =>
              app.id === id ? { ...app, ...updateData, updatedAt: new Date().toISOString() } : app
            ),
          }));
        } finally {
          set({ isLoading: false });
        }
      },

      deleteApplication: async (id) => {
        set({ isLoading: true });
        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 300));

          // TODO: Send to NestJS API: DELETE /applications/:id
          set((state) => ({
            applications: state.applications.filter((app) => app.id !== id),
          }));
        } finally {
          set({ isLoading: false });
        }
      },

      moveApplication: async (id, status) => {
        set({ isLoading: true });
        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 200));

          // TODO: Send to NestJS API: PATCH /applications/:id/status
          set((state) => ({
            applications: state.applications.map((app) =>
              app.id === id ? { ...app, status, updatedAt: new Date().toISOString() } : app
            ),
          }));
        } finally {
          set({ isLoading: false });
        }
      },

      reorderApplications: (status, items) => {
        // Update only applications with the given status
        const updatedApplications = get().applications.map((app) => {
          const movedItem = items.find((item) => item.id === app.id);
          return movedItem || app;
        });

        set({ applications: updatedApplications });
      },

      getApplicationsByStatus: (status) => {
        return get().applications.filter((app) => app.status === status);
      },

      getAllApplications: () => {
        return get().applications;
      },

      setApplications: (apps) => {
        set({ applications: apps });
      },

      getApplicationsByUserId: (userId) => {
        return get().applications.filter((app) => app.userId === userId);
      },
    }),
    {
      name: 'application-store',
    }
  )
);
