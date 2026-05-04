'use client';

import { useAuthStore } from '@/store/authStore';
import { AppLoader } from './AppLoader';

export function AuthLoader() {
  const { isInitialized } = useAuthStore();

  if (!isInitialized) {
    return <AppLoader variant="fullscreen" />;
  }

  return null;
}
