'use client';

import { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const { fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchProfile().catch(console.error);
  }, [fetchProfile]);

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-2xl mx-auto">
        <ProfileForm />
      </div>
    </DashboardLayout>
  );
}
