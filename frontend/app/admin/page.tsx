'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminTable } from '@/components/admin/AdminTable';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <DashboardLayout title="Admin Panel">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            View and manage all user applications
          </p>
        </div>

        <AdminStats />

        <div>
          <h3 className="text-lg font-semibold mb-4">All Applications</h3>
          <AdminTable />
        </div>
      </div>
    </DashboardLayout>
  );
}
