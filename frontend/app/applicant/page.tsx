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

export default function ApplicantPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fetchApplications, isLoading, hasFetched, applications } = useApplicationStore();
  const { user } = useAuth();

  useEffect(() => {
    fetchApplications()
      .then(() => toast.success('Applications loaded successfully'))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load applications');
      });
  }, [fetchApplications]);

  const userApplications = user ? applications.filter((app) => app.userId === user._id) : [];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-2">
            Manage your job applications {hasFetched ? `(${userApplications.length})` : ''}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2" disabled={isLoading}>
          <Plus className="h-5 w-5" />
          Add Application
        </Button>
      </div>

      {isLoading || !hasFetched ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      ) : userApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4">No applications yet</p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline">
            Add your first application
          </Button>
        </div>
      ) : (
        <div className="flex-1">
          <KanbanBoard />
        </div>
      )}

      <AddApplicationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </DashboardLayout>
  );
}
