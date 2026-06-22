'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { AnswerVaultSection } from '@/components/profile/AnswerVaultSection';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';
import { ProfileSkeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function ProfilePageContent() {
  const { fetchProfile } = useAuthStore();
  const { setLoading } = useLoadingStore();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [isFetching, setIsFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'vault') {
      setActiveTab('vault');
    }
  }, [searchParams]);

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
  }, [fetchProfile, setLoading, t]);

  if (isFetching) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto transition-opacity duration-200">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
        <TabsList className="bg-slate-100 dark:bg-white/[0.06]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="vault">Answer Vault</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="vault">
          <AnswerVaultSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();

  return (
    <DashboardLayout title={t('profile.title')}>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfilePageContent />
      </Suspense>
    </DashboardLayout>
  );
}
