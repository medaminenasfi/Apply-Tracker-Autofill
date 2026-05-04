'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AppLoader } from '@/components/ui/AppLoader';

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
      <div className="min-h-screen">
        <AppLoader variant="section" className="min-h-screen" />
      </div>
    );
  }

  if (!isAdminAuthenticated || !admin) {
    return null;
  }

  return <>{children}</>;
}
