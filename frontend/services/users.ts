import { userApi } from './api';

export interface NotificationPreferences {
  emailRemindersEnabled: boolean;
  inAppRemindersEnabled: boolean;
}

export const usersApi = {
  getNotificationPreferences: () =>
    userApi.get<NotificationPreferences>('/users/notification-preferences').then((r) => r.data),
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) =>
    userApi.patch<NotificationPreferences>('/users/notification-preferences', prefs).then((r) => r.data),
};
