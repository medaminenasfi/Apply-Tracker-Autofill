'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { AddApplicationModal } from '@/components/dashboard/AddApplicationModal';
import { useApplicationStore } from '@/store/applicationStore';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';
import { ListSkeleton } from '@/components/ui/skeleton';

export default function ApplicantPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fetchApplications, hasFetched, applications } = useApplicationStore();
  const { user } = useAuth();
  const { setLoading } = useLoadingStore();

  useEffect(() => {
    if (user) {
      console.log('[APPLICANT_PAGE] Fetching applications for user:', user._id);
      withLoader(() => fetchApplications(), setLoading)
        .then(() => {
          console.log('[APPLICANT_PAGE] Applications fetched successfully');
          toast.success('Applications loaded successfully');
        })
        .catch((err) => {
          console.error('[APPLICANT_PAGE] Error fetching applications:', err);
          toast.error('Failed to load applications');
        });
    }
  }, [user, fetchApplications, setLoading]);

  const userApplications = applications; // Backend already scopes by userId

  console.log('[APPLICANT_PAGE] applications count:', userApplications.length);

  // Show skeleton if not fetched yet
  if (!hasFetched) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Applications</h1>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
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
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-2">
            Track your job applications
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Button>
      </div>
      <div className="transition-opacity duration-200">
        {userApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">No applications yet</p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline">
              Add your first application
            </Button>
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
