'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useApplicationStore } from '@/store/applicationStore';
import { BarChart3, TrendingUp, Briefcase, CheckCircle, UserCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';
import { StatCardSkeleton, ListSkeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { applications, fetchApplications, hasFetched } = useApplicationStore();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);
  const { setLoading } = useLoadingStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      withLoader(() => fetchApplications(), setLoading)
        .then(() => toast.success('Applications loaded successfully'))
        .catch((err) => {
          console.error(err);
          toast.error('Failed to load applications');
        });
    }
  }, [user, fetchApplications, setLoading]);

  useEffect(() => {
    if (user && !hasCheckedProfile) {
      // Check if user has skipped the profile complete prompt before
      const hasSkippedProfilePrompt = localStorage.getItem('hasSkippedProfilePrompt');
      
      // Check if profile is incomplete (missing phone, CV, or other required fields)
      const isProfileIncomplete = !user.phone || !user.countryCode;
      
      console.log('Profile check:', { isProfileIncomplete, hasSkippedProfilePrompt, userPhone: user.phone, userCountryCode: user.countryCode });
      
      if (isProfileIncomplete && !hasSkippedProfilePrompt) {
        setShowProfileModal(true);
      }
      
      setHasCheckedProfile(true);
    }
  }, [user, hasCheckedProfile]);

  if (!user) {
    return null;
  }

  // Filter user's applications
  const userApps = applications.filter((app) => app.userId === user?._id || app.userId === user?.userId);
  const stats = {
    total: userApps.length,
    applied: userApps.filter((app) => app.status.toLowerCase() === 'applied').length,
    interview: userApps.filter((app) => app.status.toLowerCase() === 'interview').length,
    accepted: userApps.filter((app) => app.status.toLowerCase() === 'accepted').length,
  };

  // Show skeleton if not fetched yet
  if (!hasFetched) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Track your job applications and manage your career journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
    <>
      <DashboardLayout>
        <div className="space-y-8 transition-opacity duration-200">
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
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
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

    {/* Profile Incomplete Modal */}
    {showProfileModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Your profile is missing some important information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4 text-sm">
              <p className="font-semibold mb-2">Complete your profile to get started:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Add your phone number</li>
                <li>• Upload your CV</li>
                <li>• Set your preferences</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setShowProfileModal(false);
                  router.push('/profile');
                }}
                className="w-full"
              >
                Complete Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.setItem('hasSkippedProfilePrompt', 'true');
                  setShowProfileModal(false);
                }}
                className="w-full"
              >
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}
  </>
  );
}
