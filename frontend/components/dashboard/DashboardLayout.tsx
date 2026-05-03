'use client';

import { ReactNode } from 'react';
import { Sidebar, MobileSidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FeedbackButton from '@/components/feedback/FeedbackButton';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-x-hidden bg-[#F9FAFB] dark:bg-[#020617] text-[#111827] dark:text-[#E5E7EB]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile drawer sidebar */}
      <MobileSidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
      <FeedbackButton />
    </div>
  );
}
