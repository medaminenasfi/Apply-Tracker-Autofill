import api, { adminApi } from './api';

export enum FeedbackType {
  BUG = 'BUG',
  IMPROVEMENT = 'IMPROVEMENT',
  GENERAL = 'GENERAL',
}

export enum FeedbackStatus {
  NEW = 'NEW',
  VIEWED = 'VIEWED',
  RESOLVED = 'RESOLVED',
}

export interface Feedback {
  _id: string;
  userId: string;
  type: FeedbackType;
  message: string;
  rating: number;
  attachment?: string;
  adminReply?: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateFeedbackDto {
  type: FeedbackType;
  message: string;
  rating: number;
  attachment?: string;
}

export interface UpdateFeedbackDto {
  status?: FeedbackStatus;
  adminReply?: string;
}

export const feedbackApi = {
  create: async (data: CreateFeedbackDto) => {
    const response = await api.post('/feedback', data);
    return response.data;
  },

  getMyFeedback: async (): Promise<Feedback[]> => {
    const response = await api.get('/feedback/my');
    return response.data;
  },

  getFeedbackById: async (id: string): Promise<Feedback> => {
    const response = await api.get(`/feedback/${id}`);
    return response.data;
  },

  // Admin methods
  getFeedbackByIdAdmin: async (id: string): Promise<Feedback> => {
    const response = await adminApi.get(`/admin/feedback/${id}`);
    return response.data;
  },

  getAllFeedback: async (status?: FeedbackStatus, type?: FeedbackType): Promise<Feedback[]> => {
    const params: any = {};
    if (status) params.status = status;
    if (type) params.type = type;
    const response = await adminApi.get('/admin/feedback', { params });
    return response.data;
  },

  updateFeedback: async (id: string, data: UpdateFeedbackDto): Promise<Feedback> => {
    const response = await adminApi.patch(`/admin/feedback/${id}`, data);
    return response.data;
  },

  deleteFeedback: async (id: string): Promise<void> => {
    await api.delete(`/feedback/${id}`);
  },
};
