'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, TrendingUp, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
        toast.success('Dashboard statistics loaded successfully');
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Total Applications',
      value: stats?.totalApplications || 0,
      icon: Briefcase,
      color: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Pending',
      value: stats?.applicationsByStatus?.pending || 0,
      icon: Clock,
      color: 'bg-yellow-100 dark:bg-yellow-900',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Interviews',
      value: stats?.applicationsByStatus?.interview || 0,
      icon: TrendingUp,
      color: 'bg-purple-100 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Accepted',
      value: stats?.applicationsByStatus?.accepted || 0,
      icon: CheckCircle,
      color: 'bg-emerald-100 dark:bg-emerald-900',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Rejected',
      value: stats?.applicationsByStatus?.rejected || 0,
      icon: XCircle,
      color: 'bg-red-100 dark:bg-red-900',
      textColor: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <AdminProtectedRoute>
      <AdminLayout title="Admin Dashboard">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        <Icon className={`h-5 w-5 ${stat.textColor}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Manage Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    View and manage all registered users
                  </p>
                  <Button
                    onClick={() => router.push('/admin/users')}
                    className="w-full"
                  >
                    Go to Users
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Manage Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    View and manage all job applications
                  </p>
                  <Button
                    onClick={() => router.push('/admin/applications')}
                    className="w-full"
                  >
                    Go to Applications
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
