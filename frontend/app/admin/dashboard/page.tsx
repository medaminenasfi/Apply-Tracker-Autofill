'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Users, Briefcase, Clock, TrendingUp, CheckCircle, XCircle, ArrowRight, MessageCircle, UserPlus, FileText, Activity, Zap } from 'lucide-react';
import { adminApi } from '@/services/api';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { format, subDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    totalFeedback: 0,
    applicationsByStatus: {
      pending: 0,
      interview: 0,
      accepted: 0,
      rejected: 0,
    },
  });
  const [applications, setApplications] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const { setLoading } = useLoadingStore();

  useEffect(() => {
    loadStats();
    loadApplications();
  }, []);

  const loadStats = async () => {
    try {
      const response = await withLoader(() => adminApi.get('/admin/stats'), setLoading);
      setStats(response.data);
    } catch (error: any) {
      console.error('ADMIN STATS ERROR:', error.response?.data || error);
      toast.error(t('admin.dashboard.loadStatsError'));
    } finally {
      setIsFetching(false);
    }
  };

  const loadApplications = async () => {
    try {
      const response = await withLoader(() => adminApi.get('/admin/applications'), setLoading);
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10 dark:bg-blue-500/15' },
    { label: 'Total Applications', value: stats?.totalApplications || 0, icon: Briefcase, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10 dark:bg-emerald-500/15' },
    { label: 'Total Feedback', value: stats?.totalFeedback || 0, icon: MessageCircle, gradient: 'from-teal-500 to-cyan-500', bg: 'bg-teal-500/10 dark:bg-teal-500/15' },
    { label: 'Pending', value: stats?.applicationsByStatus?.pending || 0, icon: Clock, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10 dark:bg-amber-500/15' },
    { label: 'Interviews', value: stats?.applicationsByStatus?.interview || 0, icon: TrendingUp, gradient: 'from-purple-500 to-violet-500', bg: 'bg-purple-500/10 dark:bg-purple-500/15' },
    { label: 'Accepted', value: stats?.applicationsByStatus?.accepted || 0, icon: CheckCircle, gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10 dark:bg-green-500/15' },
    { label: 'Rejected', value: stats?.applicationsByStatus?.rejected || 0, icon: XCircle, gradient: 'from-red-500 to-rose-500', bg: 'bg-red-500/10 dark:bg-red-500/15' },
  ];

  const quickActions = [
    { label: 'Manage Users', desc: 'View and manage all registered users', icon: Users, href: '/admin/users', gradient: 'from-[#2563EB] to-[#3B82F6]' },
    { label: 'Manage Applications', desc: 'View and manage all job applications', icon: Briefcase, href: '/admin/applications', gradient: 'from-[#7C3AED] to-[#8B5CF6]' },
    { label: 'Manage Feedback', desc: 'Review user feedback and respond', icon: MessageCircle, href: '/admin/feedback', gradient: 'from-emerald-500 to-teal-500' },
  ];

  // Chart data
  const statusData = [
    { name: 'Applied', value: stats?.applicationsByStatus?.pending || 0, color: '#2563EB' },
    { name: 'Interview', value: stats?.applicationsByStatus?.interview || 0, color: '#F59E0B' },
    { name: 'Accepted', value: stats?.applicationsByStatus?.accepted || 0, color: '#22C55E' },
    { name: 'Rejected', value: stats?.applicationsByStatus?.rejected || 0, color: '#EF4444' },
  ];

  const comparisonData = [
    { name: 'Users', value: stats?.totalUsers || 0, color: '#2563EB' },
    { name: 'Applications', value: stats?.totalApplications || 0, color: '#7C3AED' },
  ];

  // Get last 7 days trend
  const getTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const apps = applications.filter((app) => {
        const appDate = new Date(app.dateApplied || app.createdAt);
        return format(appDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      }).length;
      return { date: format(date, 'MMM dd'), count: apps };
    });
    return last7Days;
  };

  const trendData = getTrendData();

  // Recent activities (mock for now, could be from backend)
  const recentActivities = [
    { icon: UserPlus, title: 'New user registered', time: '2 hours ago', color: 'text-blue-500' },
    { icon: Briefcase, title: 'Application submitted', time: '3 hours ago', color: 'text-emerald-500' },
    { icon: MessageCircle, title: 'Feedback received', time: '5 hours ago', color: 'text-purple-500' },
    { icon: CheckCircle, title: 'Application accepted', time: '1 day ago', color: 'text-green-500' },
    { icon: XCircle, title: 'Application rejected', time: '1 day ago', color: 'text-red-500' },
  ];

  // Skeleton
  if (isFetching) {
    return (
      <AdminProtectedRoute>
        <AdminLayout title="Admin Dashboard">
          <div className="space-y-6">
            <div>
              <div className="h-8 w-48 rounded-lg bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
              <div className="h-4 w-72 rounded-lg bg-slate-100 dark:bg-white/[0.06] animate-pulse mt-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-5 h-28 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-64 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] animate-pulse" />
              <div className="h-64 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] animate-pulse" />
            </div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout title="Admin Dashboard">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
            <p className="text-[#111827]/50 dark:text-[#E5E7EB]/40 text-sm mt-1">Platform statistics at a glance</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[#111827]/40 dark:text-[#E5E7EB]/40">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1.5">{stat.value}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Analytics Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Analytics Overview
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Applications by Status */}
              <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <h4 className="text-sm font-semibold mb-4">Applications by Status</h4>
                {statusData.every((d) => d.value === 0) ? (
                  <div className="h-48 flex items-center justify-center text-[#111827]/40 dark:text-[#E5E7EB]/30 text-sm">
                    No data available yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={192}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0B1220',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#E5E7EB',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="flex flex-wrap gap-3 mt-4">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-[#111827]/60 dark:text-[#E5E7EB]/50">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users vs Applications */}
              <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <h4 className="text-sm font-semibold mb-4">Users vs Applications</h4>
                <ResponsiveContainer width="100%" height={192}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B1220',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#E5E7EB',
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Application Trend */}
              <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <h4 className="text-sm font-semibold mb-4">Application Trend (7 Days)</h4>
                {trendData.every((d) => d.count === 0) ? (
                  <div className="h-48 flex items-center justify-center text-[#111827]/40 dark:text-[#E5E7EB]/30 text-sm">
                    No data available yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={192}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0B1220',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#E5E7EB',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#2563EB"
                        strokeWidth={2}
                        dot={{ fill: '#2563EB', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Recent Activity
            </h3>
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-5">
              <div className="space-y-3">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F9FAFB] dark:hover:bg-white/[0.03] transition-colors">
                      <div className={`p-2 rounded-lg bg-[#111827]/5 dark:bg-white/[0.03] ${activity.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-[#111827]/40 dark:text-[#E5E7EB]/30">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => router.push(action.href)}
                    className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg mb-3`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-sm">{action.label}</h4>
                    <p className="text-xs text-[#111827]/40 dark:text-[#E5E7EB]/40 mt-1">{action.desc}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs font-medium text-[#2563EB] dark:text-[#3B82F6] group-hover:gap-2 transition-all">
                      <span>View</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
