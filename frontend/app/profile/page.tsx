'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';
import { ProfileSkeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { fetchProfile, user } = useAuthStore();
  const { setLoading } = useLoadingStore();
  const { t } = useTranslation();
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    withLoader(() => fetchProfile(), setLoading)
      .then(() => {
        toast.success(t('profile.loadSuccess'));
        setIsFetching(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error(t('profile.loadError'));
        setIsFetching(false);
      });
  }, [fetchProfile, setLoading]);

  // Show skeleton while fetching
  if (isFetching) {
    return (
      <DashboardLayout title={t('profile.title')}>
        <ProfileSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('profile.title')}>
      <div className="max-w-4xl mx-auto transition-opacity duration-200">
        <ProfileForm />
      </div>
    </DashboardLayout>
  );
}
