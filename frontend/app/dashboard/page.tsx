'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useApplicationStore } from '@/store/applicationStore';
import { BarChart3, TrendingUp, Briefcase, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { applications, fetchApplications, hasFetched } = useApplicationStore();

  // Fetch applications on mount
  useEffect(() => {
    fetchApplications()
      .then(() => toast.success('Applications loaded successfully'))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load applications');
      });
  }, [fetchApplications]);

  // Filter user's applications
  const userApps = applications.filter((app) => app.userId === user?._id);
  const stats = {
    total: userApps.length,
    applied: userApps.filter((app) => app.status.toLowerCase() === 'applied').length,
    interview: userApps.filter((app) => app.status.toLowerCase() === 'interview').length,
    accepted: userApps.filter((app) => app.status.toLowerCase() === 'accepted').length,
  };

  const statCards = [
    {
      label: 'Total Applications',
      value: stats.total,
      icon: Briefcase,
      color: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Applications Sent',
      value: stats.applied,
      icon: TrendingUp,
      color: 'bg-yellow-100 dark:bg-yellow-900',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Interviews',
      value: stats.interview,
      icon: BarChart3,
      color: 'bg-purple-100 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Offers Accepted',
      value: stats.accepted,
      icon: CheckCircle,
      color: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Track your job applications and manage your career journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                    {hasFetched ? (
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    ) : (
                      <div className="h-9 w-16 bg-muted animate-pulse rounded mt-2" />
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">View Applications</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    See all your applications in one place
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => router.push('/applicant')}
              >
                Go to Applications
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Update Profile</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    Keep your information up to date
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => router.push('/profile')}
              >
                Go to Profile
              </Button>
            </Card>
          </div>
        </div>

        {/* Info Section */}
        <Card className="p-8 bg-muted/50">
          <h2 className="text-xl font-bold mb-4">Tips for Success</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Keep track of all your applications to stay organized</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Update your profile with the latest information</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Follow up on applications after 2 weeks</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Prepare thoroughly for interviews</span>
            </li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
