'use client';

import { useAuthStore } from '@/store/authStore';

export function AuthLoader() {
  const { isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-background">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return null;
}
