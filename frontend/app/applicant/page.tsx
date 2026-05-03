'use client';

import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { AddApplicationModal } from '@/components/dashboard/AddApplicationModal';
import { useApplicationStore } from '@/store/applicationStore';
import { useAuth } from '@/hooks/useAuth';
import { useSidebarStore } from '@/store/sidebarStore';
import { Plus, Search, Filter, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';
import { ListSkeleton } from '@/components/ui/skeleton';

export default function ApplicantPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fetchApplications, hasFetched, applications } = useApplicationStore();
  const { user } = useAuth();
  const { setLoading } = useLoadingStore();
  const { collapseSidebar } = useSidebarStore();
  const hasCollapsed = useRef(false);

  // Collapse sidebar on mount for more board space (deferred to avoid router initialization issues)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasCollapsed.current) {
        collapseSidebar();
        hasCollapsed.current = true;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [collapseSidebar]);

  useEffect(() => {
    if (user) {
      withLoader(() => fetchApplications(), setLoading)
        .then(() => {
          toast.success('Applications loaded successfully');
        })
        .catch(() => {
          toast.error('Failed to load applications');
        });
    }
  }, [user, fetchApplications, setLoading]);

  const userApplications = applications;

  // Show skeleton if not fetched yet
  if (!hasFetched) {
    return (
      <DashboardLayout title="Applications">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
              <p className="text-sm text-[#111827]/50 dark:text-[#E5E7EB]/40 mt-1">Track and manage your job applications</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:shadow-lg hover:shadow-[#2563EB]/25 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Add Application
            </button>
          </div>
          <ListSkeleton count={6} />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout title="Applications">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-sm text-[#111827]/50 dark:text-[#E5E7EB]/40 mt-1">
            {userApplications.length} application{userApplications.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:shadow-lg hover:shadow-[#2563EB]/25 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      {/* Board */}
      <div className="transition-opacity duration-200">
        {userApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/10 dark:bg-[#2563EB]/15 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-[#2563EB]" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No applications yet</h3>
            <p className="text-sm text-[#111827]/40 dark:text-[#E5E7EB]/35 mb-5 max-w-sm">Start tracking your job applications by adding your first one.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] hover:bg-[#111827]/5 dark:hover:bg-white/[0.04] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add your first application
            </button>
          </div>
        ) : (
          <KanbanBoard />
        )}
      </div>
      <AddApplicationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </DashboardLayout>
  );
}
