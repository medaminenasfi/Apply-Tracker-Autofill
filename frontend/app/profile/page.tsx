import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProfileForm } from '@/components/profile/ProfileForm';

export default function ProfilePage() {
  return (
    <DashboardLayout title="Profile">
      <div className="max-w-2xl mx-auto">
        <ProfileForm />
      </div>
    </DashboardLayout>
  );
}
