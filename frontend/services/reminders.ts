import { userApi } from './api';

export interface ReminderItem {
  type: 'deadline' | 'follow_up' | 'interview';
  applicationId: string;
  companyName: string;
  position: string;
  message: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

export interface CvAnalyticsItem {
  cvUsed: string;
  total: number;
  interviews: number;
  accepted: number;
  interviewRate: number;
  acceptanceRate: number;
}

export const remindersApi = {
  list: () => userApi.get<ReminderItem[]>('/reminders').then((r) => r.data),
  cvAnalytics: () => userApi.get<CvAnalyticsItem[]>('/reminders/cv-analytics').then((r) => r.data),
};
