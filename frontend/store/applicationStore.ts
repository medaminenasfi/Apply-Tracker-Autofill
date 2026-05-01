import { create } from 'zustand';
import { Application, ApplicationStatus, Note } from '@/types';
import api from '@/services/api';

interface ApplicationState {
  applications: Application[];
  notes: Record<string, Note[]>; // key = applicationId
  isLoading: boolean;
  fetchApplications: () => Promise<void>;
  addApplication: (appData: any) => Promise<void>;
  updateApplication: (_id: string, updateData: any) => Promise<void>;
  deleteApplication: (_id: string) => Promise<void>;
  moveApplication: (_id: string, status: string) => Promise<void>;
  reorderApplications: (status: string, items: Application[]) => void;
  updateNote: (_id: string, noteIndex: number, text: string) => Promise<Application>;
  deleteNote: (_id: string, noteIndex: number) => Promise<Application>;
  getApplicationsByStatus: (status: ApplicationStatus) => Application[];
  getAllApplications: () => Application[];
  setApplications: (apps: Application[]) => void;
  getApplicationsByUserId: (userId: string) => Application[];
  // Notes-specific methods
  fetchNotes: (applicationId: string) => Promise<Note[]>;
  addNote: (applicationId: string, text: string) => Promise<Note>;
  updateNoteById: (noteId: string, text: string) => Promise<Note>;
  deleteNoteById: (noteId: string) => Promise<void>;
  getNotesByApplication: (applicationId: string) => Note[];
}

export const useApplicationStore = create<ApplicationState>()((set, get) => ({
  applications: [],
  notes: {},
  isLoading: false,

  fetchApplications: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/applications');
      set({ applications: response.data });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch applications');
    } finally {
      set({ isLoading: false });
    }
  },

  addApplication: async (appData) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/applications', appData);
      set((state) => ({
        applications: [...state.applications, response.data],
      }));
    } catch (error: any) {
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

  updateNote: async (_id, noteIndex, text) => {
    set({ isLoading: true });
    try {
      const response = await api.patch(`/applications/${_id}/notes/${noteIndex}`, { text });
      set((state) => ({
        applications: state.applications.map((app) =>
          app._id === _id ? response.data : app
        ),
      }));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update note');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteNote: async (_id, noteIndex) => {
    set({ isLoading: true });
    try {
      const response = await api.delete(`/applications/${_id}/notes/${noteIndex}`);
      set((state) => ({
        applications: state.applications.map((app) =>
          app._id === _id ? response.data : app
        ),
      }));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete note');
    } finally {
      set({ isLoading: false });
    }
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
}));
