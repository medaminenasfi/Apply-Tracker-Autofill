'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { admin, isAdminAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, [initialize]);

  useEffect(() => {
    if (isReady && (!isAdminAuthenticated || !admin)) {
      router.push('/admin/login');
    }
  }, [isReady, isAdminAuthenticated, admin, router]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdminAuthenticated || !admin) {
    return null;
  }

  return <>{children}</>;
}
