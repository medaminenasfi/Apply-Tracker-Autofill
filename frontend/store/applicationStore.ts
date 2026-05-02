import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Application, ApplicationStatus, Note } from '@/types';
import api, { fetchWithRetry, checkHealth } from '@/services/api';

interface ApplicationState {
  applications: Application[];
  notes: Record<string, Note[]>; // key = applicationId
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
  fetchApplications: () => Promise<void>;
  addApplication: (appData: any) => Promise<void>;
  updateApplication: (_id: string, updateData: any) => Promise<void>;
  deleteApplication: (_id: string) => Promise<void>;
  moveApplication: (_id: string, status: string) => Promise<void>;
  reorderApplications: (status: string, items: Application[]) => void;
  getApplicationsByStatus: (status: ApplicationStatus) => Application[];
  getAllApplications: () => Application[];
  setApplications: (apps: Application[]) => void;
  getApplicationsByUserId: (userId: string) => Application[];
  getApplicationById: (_id: string) => Promise<Application | null>;
  // Notes-specific methods
  fetchNotes: (applicationId: string) => Promise<Note[]>;
  addNote: (applicationId: string, text: string) => Promise<Note>;
  updateNoteById: (noteId: string, text: string) => Promise<Note>;
  deleteNoteById: (noteId: string) => Promise<void>;
  getNotesByApplication: (applicationId: string) => Note[];
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
  applications: [],
  notes: {},
  isLoading: false,
  hasFetched: false,
  error: null,

  fetchApplications: async () => {
    console.log('[APPLICANT_FETCH_START] Fetching applications...');
    set({ isLoading: true, error: null });
    
    try {
      // Health check before fetching
      const isHealthy = await checkHealth();
      if (!isHealthy) {
        throw new Error('Backend is not healthy');
      }

      const response = await fetchWithRetry(() => api.get('/applications'));
      // Handle new debug response format
      const data = response.data.data || response.data;
      console.log('[APPLICANT_FETCH_SUCCESS] count=', data.length, 'data=', data);
      set({ applications: data, error: null });
      console.log('[STATE_UPDATE] applications=', data.length);
    } catch (error: any) {
      console.error('[APPLICANT_FETCH_ERROR]', error);
      set({ error: error.message || 'Failed to fetch applications' });
      throw new Error(error.response?.data?.message || 'Failed to fetch applications');
    } finally {
      set({ isLoading: false, hasFetched: true });
    }
  },

  addApplication: async (appData) => {
    console.log('[APPLICANT_CREATE_START] data=', appData);
    set({ isLoading: true });
    try {
      const response = await api.post('/applications', appData);
      console.log('[APPLICANT_CREATE_SUCCESS] id=', response.data._id, 'data=', response.data);
      set((state) => ({
        applications: [...state.applications, response.data],
      }));
      console.log('[STATE_UPDATE] applications=', get().applications.length);
    } catch (error: any) {
      console.error('[APPLICANT_CREATE_ERROR]', error);
      throw new Error(error.response?.data?.message || 'Failed to add application');
    } finally {
      set({ isLoading: false });
    }
  },

  updateApplication: async (_id, updateData) => {
    set({ isLoading: true });
    try {
      const response = await api.put(`/applications/${_id}`, updateData);
      console.log('API response from updateApplication:', response.data);
      console.log('API response notes:', response.data.notes);
      set((state) => ({
        applications: state.applications.map((app) =>
          app._id === _id ? response.data : app
        ),
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update application');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteApplication: async (_id) => {
    set({ isLoading: true });
    try {
      await api.delete(`/applications/${_id}`);
      set((state) => ({
        applications: state.applications.filter((app) => app._id !== _id),
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete application');
    } finally {
      set({ isLoading: false });
    }
  },

  moveApplication: async (_id, status) => {
    set({ isLoading: true });
    try {
      const response = await api.patch(`/applications/${_id}/status`, { status });
      set((state) => ({
        applications: state.applications.map((app) =>
          app._id === _id ? response.data : app
        ),
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to move application');
    } finally {
      set({ isLoading: false });
    }
  },

  reorderApplications: (status, items) => {
    set((state) => ({
      applications: state.applications.map((app) => {
        if (app.status === status) {
          const reordered = items.find((item) => item._id === app._id);
          return reordered || app;
        }
        return app;
      }),
    }));
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

  getApplicationById: async (_id) => {
    try {
      const response = await api.get(`/applications/${_id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch application');
    }
  },

  fetchNotes: async (applicationId) => {
    try {
      const response = await api.get(`/notes?applicationId=${applicationId}`);
      console.log('Fetched notes:', response.data);
      set((state) => ({
        notes: {
          ...state.notes,
          [applicationId]: response.data,
        },
      }));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notes');
    }
  },

  addNote: async (applicationId, text) => {
    try {
      const response = await api.post('/notes', { applicationId, text });
      console.log('Note added:', response.data);
      set((state) => ({
        notes: {
          ...state.notes,
          [applicationId]: [response.data, ...(state.notes[applicationId] || [])],
        },
      }));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add note');
    }
  },

  updateNoteById: async (noteId, text) => {
    try {
      const response = await api.patch(`/notes/${noteId}`, { text });
      set((state) => {
        const updatedNotes = { ...state.notes };
        for (const appId in updatedNotes) {
          updatedNotes[appId] = updatedNotes[appId].map((note) =>
            note._id === noteId ? response.data : note
          );
        }
        return { notes: updatedNotes };
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update note');
    }
  },

  deleteNoteById: async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      set((state) => {
        const updatedNotes = { ...state.notes };
        for (const appId in updatedNotes) {
          updatedNotes[appId] = updatedNotes[appId].filter((note) => note._id !== noteId);
        }
        return { notes: updatedNotes };
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete note');
    }
  },

  getNotesByApplication: (applicationId) => {
    return get().notes[applicationId] || [];
  },
    }),
    {
      name: 'application-storage',
      partialize: (state) => ({ applications: state.applications, notes: state.notes, hasFetched: state.hasFetched, error: state.error }),
    }
  )
);

// Extension store for extension-specific API calls
interface ExtensionState {
  getExtensionProfile: () => Promise<any>;
  saveApplicationViaExtension: (applicationData: any) => Promise<any>;
}

export const useExtensionStore = create<ExtensionState>()((set) => ({
  getExtensionProfile: async () => {
    try {
      const response = await api.get('/extension/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch extension profile');
    }
  },

  saveApplicationViaExtension: async (applicationData) => {
    try {
      const response = await api.post('/extension/save-application', applicationData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to save application via extension');
    }
  },
}));
