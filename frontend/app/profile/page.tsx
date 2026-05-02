'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';
import { CardSkeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { fetchProfile, user } = useAuthStore();
  const { setLoading } = useLoadingStore();
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    withLoader(() => fetchProfile(), setLoading)
      .then(() => {
        toast.success('Profile loaded successfully');
        setIsFetching(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load latest profile data');
        setIsFetching(false);
      });
  }, [fetchProfile, setLoading]);

  // Show skeleton while fetching
  if (isFetching) {
    return (
      <DashboardLayout title="Profile">
        <div className="max-w-2xl mx-auto space-y-6 transition-opacity duration-200">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-2xl mx-auto transition-opacity duration-200">
        <ProfileForm />
      </div>
    </DashboardLayout>
  );
}
