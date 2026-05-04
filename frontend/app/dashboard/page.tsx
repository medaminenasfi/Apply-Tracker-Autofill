'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useApplicationStore } from '@/store/applicationStore';
import {
  BarChart3, TrendingUp, Briefcase, CheckCircle, UserCheck, ArrowRight,
  Send, CalendarClock, XCircle, User, Sparkles, RefreshCw, Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';
import { StatCardSkeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import type { Application } from '@/types';
import { useTranslation } from 'react-i18next';

// ── AI Tips ──
const AI_TIPS = [
  'Apply between 9–11 AM for higher response rates.',
  'Tailor your CV to each job description for 3x more callbacks.',
  'Follow up after 5–7 days if you haven\'t heard back.',
  'Use keywords from the job posting in your resume.',
  'Apply within 48 hours of a job posting for the best chances.',
  'Quantify achievements on your CV — numbers stand out.',
  'Write a unique cover letter for roles you really want.',
  'Research the company culture before your interview.',
  'Practice the STAR method for behavioral questions.',
  'Keep your LinkedIn profile updated — recruiters check it.',
];

// ── Helper: build last-7-day chart data from applications ──
function buildWeeklyData(applications: Application[], locale: string = 'en-US') {
  const days: { name: string; count: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString(locale, { weekday: 'short' });
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 86_400_000;
    const count = applications.filter((a) => {
      const t = new Date(a.createdAt).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    days.push({ name: label, count });
  }
  return days;
}

// ── Helper: count apps this week ──
function countThisWeek(applications: Application[]) {
  const now = Date.now();
  const weekAgo = now - 7 * 86_400_000;
  return applications.filter((a) => new Date(a.createdAt).getTime() >= weekAgo).length;
}

// ── Recent activity helper ──
function getRecentActivity(applications: Application[]) {
  const sorted = [...applications].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return sorted.slice(0, 5);
}

const statusActivityConfig: Record<string, { icon: typeof Send; color: string; bg: string; verb: string }> = {
  applied:   { icon: Send,         color: '#2563EB', bg: 'rgba(37,99,235,0.12)',  verb: 'Applied to' },
  interview: { icon: CalendarClock, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', verb: 'Interview at' },
  accepted:  { icon: CheckCircle,   color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  verb: 'Accepted at' },
  rejected:  { icon: XCircle,       color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  verb: 'Rejected from' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { applications, fetchApplications, hasFetched, isLoading, error } = useApplicationStore();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const requestIdRef = useRef(0);
  const { setLoading } = useLoadingStore();
  const { t, i18n } = useTranslation();
  const dateFnsLocale = i18n.language === 'fr' ? fr : enUS;

  // Randomize initial tip
  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * AI_TIPS.length));
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Auth readiness guard - only fetch if user exists
  useEffect(() => {
    if (user) {
      const currentRequestId = ++requestIdRef.current;
      withLoader(() => fetchApplications(), setLoading)
        .then(() => {
          toast.success('Applications loaded successfully');
        })
        .catch(() => {
          toast.error('Failed to load applications');
        });
    }
  }, [user, fetchApplications, setLoading]);

  useEffect(() => {
    if (user && !hasCheckedProfile) {
      const hasSkippedProfilePrompt = localStorage.getItem('hasSkippedProfilePrompt');
      const isProfileIncomplete = !user.phone || !user.countryCode;
      if (isProfileIncomplete && !hasSkippedProfilePrompt) {
        setShowProfileModal(true);
      }
      setHasCheckedProfile(true);
    }
  }, [user, hasCheckedProfile]);

  // Derived data
  const stats = useMemo(() => ({
    total: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }), [applications]);

  const dateLocale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
  const weeklyData = useMemo(() => buildWeeklyData(applications, dateLocale), [applications, dateLocale]);
  const thisWeekCount = useMemo(() => countThisWeek(applications), [applications]);
  const recentActivity = useMemo(() => getRecentActivity(applications), [applications]);
  const successRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;
  const interviewRate = stats.total > 0 ? Math.round((stats.interview / stats.total) * 100) : 0;

  if (!user) return null;

  // ── Loading skeleton ──
  if (!hasFetched || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.welcome')}!</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('common.loading')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="h-48 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] animate-pulse" />
            <div className="h-48 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] animate-pulse" />
            <div className="h-48 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.welcome')}!</h1>
          </div>
          <div className="p-8 rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-900/10">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">Unable to Load Applications</h3>
            <p className="text-sm text-red-500 dark:text-red-400/70 mb-4">{error}</p>
            <Button onClick={() => fetchApplications()}>{t('common.retry')}</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Stat cards config ──
  const statCards = [
    {
      label: t('dashboard.totalApps'),
      value: stats.total,
      icon: Briefcase,
      bg: 'bg-[#2563EB]/10 dark:bg-[#2563EB]/15',
      iconBg: 'bg-gradient-to-br from-[#2563EB] to-[#7C3AED]',
      textColor: 'text-[#2563EB] dark:text-[#3B82F6]',
      sub: `+${thisWeekCount} ${t('dashboard.thisWeek').toLowerCase()}`,
    },
    {
      label: t('dashboard.applied'),
      value: stats.applied,
      icon: Send,
      bg: 'bg-[#F59E0B]/10 dark:bg-[#F59E0B]/15',
      iconBg: 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]',
      textColor: 'text-[#F59E0B] dark:text-[#FBBF24]',
      sub: 'Awaiting response',
    },
    {
      label: t('dashboard.interviews'),
      value: stats.interview,
      icon: CalendarClock,
      bg: 'bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/15',
      iconBg: 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]',
      textColor: 'text-[#8B5CF6] dark:text-[#A78BFA]',
      sub: interviewRate > 0 ? `${interviewRate}% conversion` : 'No interviews yet',
    },
    {
      label: t('dashboard.accepted'),
      value: stats.accepted,
      icon: CheckCircle,
      bg: 'bg-[#22C55E]/10 dark:bg-[#22C55E]/15',
      iconBg: 'bg-gradient-to-br from-[#22C55E] to-[#16A34A]',
      textColor: 'text-[#22C55E] dark:text-[#4ADE80]',
      sub: successRate > 0 ? 'Strong performance' : 'Keep going!',
    },
  ];

  return (
    <>
      <DashboardLayout>
        <div className="space-y-8 transition-opacity duration-200">
          {/* ── Welcome ── */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('dashboard.welcome')}, {user.firstName}!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Here&apos;s an overview of your job search progress.
            </p>
          </div>

          {/* ── Row 1: Stats ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`p-5 rounded-2xl border border-transparent ${stat.bg} hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                      <p className={`text-3xl font-bold mt-1.5 ${stat.textColor}`}>{stat.value}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{stat.sub}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl shadow-lg ${stat.iconBg}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Row 2: Insights ── */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2563EB]" />
              Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Applications per Week chart */}
              <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Applications This Week</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Last 7 days</p>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(15,23,42,0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#fff',
                        }}
                        labelStyle={{ color: '#94A3B8' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#2563EB"
                        strokeWidth={2}
                        fill="url(#blueGrad)"
                        dot={false}
                        activeDot={{ r: 4, fill: '#2563EB' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Success Rate */}
              <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Success Rate</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Accepted / Total</p>
                <p className="text-4xl font-bold text-[#22C55E]">{successRate}%</p>
                <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] transition-all duration-700"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                  {stats.accepted} of {stats.total} applications
                </p>
              </div>

              {/* Interview Rate */}
              <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Interview Rate</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Interviews / Total</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-[#F59E0B]">{interviewRate}%</p>
                  {interviewRate > 20 && (
                    <span className="text-xs font-semibold text-[#22C55E] flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> Good
                    </span>
                  )}
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] transition-all duration-700"
                    style={{ width: `${interviewRate}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                  {stats.interview} of {stats.total} applications
                </p>
              </div>
            </div>
          </div>

          {/* ── Row 3: Recent Activity + AI Tips ── */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            {/* Recent Activity */}
            <div className="xl:col-span-3 p-5 rounded-2xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1]">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#8B5CF6]" />
                {t('dashboard.recentActivity')}
              </h3>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 py-8 text-center">{t('dashboard.noActivity')}</p>
              ) : (
                <div className="space-y-1">
                  {recentActivity.map((app) => {
                    const cfg = statusActivityConfig[app.status] || statusActivityConfig.applied;
                    const StatusIcon = cfg.icon;
                    return (
                      <div
                        key={app._id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: cfg.bg }}
                        >
                          <StatusIcon className="w-4 h-4" style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 dark:text-slate-200 truncate">
                            <span className="font-medium">{cfg.verb}</span> {app.companyName}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{app.position}</p>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                          {formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true, locale: dateFnsLocale })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Tips */}
            <div className="xl:col-span-2 p-5 rounded-2xl border border-slate-200 dark:border-white/[0.1]"
              style={{
                background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06))',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  {t('dashboard.aiTip')}
                </h3>
                <button
                  onClick={() => setTipIndex((prev) => (prev + 1) % AI_TIPS.length)}
                  className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/[0.06] transition-colors"
                  title="Next tip"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                </button>
              </div>
              <div className="relative">
                <div className="p-4 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06]">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    &ldquo;{AI_TIPS[tipIndex]}&rdquo;
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-1 justify-center">
                {AI_TIPS.slice(0, 5).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === tipIndex % 5 ? 'bg-[#7C3AED]' : 'bg-slate-200 dark:bg-white/[0.1]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Row 4: Quick Actions ── */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('dashboard.quickActions')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/applicant')}
                className="group p-5 rounded-2xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] hover:-translate-y-0.5 hover:shadow-lg hover:border-[#2563EB]/30 dark:hover:border-[#2563EB]/20 transition-all duration-300 text-left"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{t('dashboard.goToApps')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      See all your applications in the Kanban board
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#2563EB]/10 dark:bg-[#2563EB]/15 group-hover:bg-[#2563EB]/20 transition-colors">
                    <ArrowRight className="w-4 h-4 text-[#2563EB]" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/profile')}
                className="group p-5 rounded-2xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] hover:-translate-y-0.5 hover:shadow-lg hover:border-[#8B5CF6]/30 dark:hover:border-[#8B5CF6]/20 transition-all duration-300 text-left"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Update Profile</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Keep your information up to date
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/15 group-hover:bg-[#8B5CF6]/20 transition-colors">
                    <User className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* ── Profile Incomplete Modal ── */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-md p-6">
            <div className="text-center mb-5">
              <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-[#2563EB]/10 dark:bg-[#2563EB]/15 flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-[#2563EB]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Complete Your Profile</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Your profile is missing some important information.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.04] p-4 text-sm mb-5">
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">To get started:</p>
              <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[#2563EB]" /> Add your phone number</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[#2563EB]" /> Upload your CV</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[#2563EB]" /> Set your preferences</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setShowProfileModal(false); router.push('/profile'); }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:shadow-lg hover:shadow-[#2563EB]/25 transition-all duration-300"
              >
                Complete Profile
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { localStorage.setItem('hasSkippedProfilePrompt', 'true'); setShowProfileModal(false); }}
                className="w-full px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
