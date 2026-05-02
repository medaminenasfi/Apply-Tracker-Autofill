'use client';

import { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchProfile()
      .then(() => toast.success('Profile loaded successfully'))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load latest profile data');
      });
  }, [fetchProfile]);

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-2xl mx-auto">
        <ProfileForm />
      </div>
    </DashboardLayout>
  );
}
