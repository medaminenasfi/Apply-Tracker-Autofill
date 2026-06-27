'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, MessageCircle, Bug, Lightbulb, MessageSquare, Star } from 'lucide-react';
import { feedbackApi, Feedback, FeedbackStatus, FeedbackType } from '@/services/feedback';
import { toast } from 'sonner';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';
import { useTranslation } from 'react-i18next';

const statusStyles: Record<FeedbackStatus, string> = {
  [FeedbackStatus.NEW]: 'bg-slate-500/10 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300',
  [FeedbackStatus.VIEWED]: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  [FeedbackStatus.RESOLVED]: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
};


const typeIcons: Record<FeedbackType, typeof Bug> = {
  [FeedbackType.BUG]: Bug,
  [FeedbackType.IMPROVEMENT]: Lightbulb,
  [FeedbackType.GENERAL]: MessageSquare,
};

export default function AdminFeedbackPage() {
  const { t } = useTranslation();
  
  const typeLabels: Record<FeedbackType, string> = {
    [FeedbackType.BUG]: t('feedback.bugReport'),
    [FeedbackType.IMPROVEMENT]: t('feedback.feature'),
    [FeedbackType.GENERAL]: t('feedback.general'),
  };
  
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState<FeedbackStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const { setLoading } = useLoadingStore();

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const data = await withLoader(() => feedbackApi.getAllFeedback(), setLoading);
      setFeedback(data);
      setIsFetching(false);
    } catch (error) {
      toast.error(t('admin.feedback.loadError'));
      setIsFetching(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: FeedbackStatus) => {
    try {
      await withLoader(() => feedbackApi.updateFeedback(id, { status: newStatus }), setLoading);
      toast.success('Status updated successfully');
      loadFeedback();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filtered = feedback.filter((item) => {
    const matchStatus = filter === 'all' || item.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || (item.user?.firstName || '').toLowerCase().includes(q) || (item.user?.lastName || '').toLowerCase().includes(q) || (item.user?.email || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const summaryCards = [
    { label: 'Total', value: feedback.length, gradient: 'from-blue-500 to-blue-600' },
    { label: 'New', value: feedback.filter((f) => f.status === FeedbackStatus.NEW).length, gradient: 'from-slate-500 to-slate-600' },
    { label: 'Resolved', value: feedback.filter((f) => f.status === FeedbackStatus.RESOLVED).length, gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Bug Reports', value: feedback.filter((f) => f.type === FeedbackType.BUG).length, gradient: 'from-red-500 to-rose-500' },
  ];

  if (isFetching) {
    return (
      <AdminProtectedRoute>
        <AdminLayout title="Manage Feedback">
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] animate-pulse" />
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="h-3 w-32 rounded bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
                <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-white/[0.06] animate-pulse ml-auto" />
                <div className="h-3 w-20 rounded bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout title="Manage Feedback">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold">Feedback</h2>
          <p className="text-sm text-[#111827]/50 dark:text-[#E5E7EB]/40">Review user feedback and respond to issues</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#111827]/40 dark:text-[#E5E7EB]/40">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#111827]/30 dark:text-[#E5E7EB]/30" />
            <input
              type="text"
              placeholder="Search by user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-[#F9FAFB] dark:bg-white/[0.03] text-[#111827] dark:text-[#E5E7EB] placeholder:text-[#111827]/30 dark:placeholder:text-[#E5E7EB]/30 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FeedbackStatus | 'all')}
            className="px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-[#F9FAFB] dark:bg-white/[0.03] text-[#111827] dark:text-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value={FeedbackStatus.NEW}>New</option>
            <option value={FeedbackStatus.VIEWED}>Viewed</option>
            <option value={FeedbackStatus.RESOLVED}>Resolved</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#111827]/40 dark:text-[#E5E7EB]/30">
            <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">No feedback found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] overflow-hidden bg-white dark:bg-white/[0.03]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] dark:border-white/[0.06] bg-[#F9FAFB] dark:bg-white/[0.03]">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">User</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Rating</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Created</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06]">
                  {filtered.map((item) => {
                    const TypeIcon = typeIcons[item.type] || MessageSquare;
                    return (
                      <tr key={item._id} className="hover:bg-[#F9FAFB] dark:hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium">{item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Unknown'}</p>
                          <p className="text-xs text-[#111827]/40 dark:text-[#E5E7EB]/40">{item.user?.email || ''}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 text-sm">
                            <TypeIcon className="h-3.5 w-3.5 text-[#111827]/40 dark:text-[#E5E7EB]/40" />
                            <span>{typeLabels[item.type]}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item._id, e.target.value as FeedbackStatus)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer appearance-none ${statusStyles[item.status]} bg-none`}
                            style={{ backgroundImage: 'none' }}
                          >
                            <option value={FeedbackStatus.NEW}>New</option>
                            <option value={FeedbackStatus.VIEWED}>Viewed</option>
                            <option value={FeedbackStatus.RESOLVED}>Resolved</option>
                          </select>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= (item.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-[#111827]/10 dark:text-[#E5E7EB]/10'}`} />
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#111827]/50 dark:text-[#E5E7EB]/40">{formatDate(item.createdAt)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/admin/feedback/${item._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#2563EB] dark:text-[#3B82F6] hover:bg-[#2563EB]/5 dark:hover:bg-[#2563EB]/10 transition-colors"
                          >
                            View
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((item) => {
                const TypeIcon = typeIcons[item.type] || MessageSquare;
                return (
                  <Link
                    key={item._id}
                    href={`/admin/feedback/${item._id}`}
                    className="block rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Unknown'}</p>
                        <p className="text-xs text-[#111827]/40 dark:text-[#E5E7EB]/40 truncate">{item.user?.email || ''}</p>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${statusStyles[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E7EB] dark:border-white/[0.06]">
                      <div className="flex items-center gap-3 text-xs text-[#111827]/50 dark:text-[#E5E7EB]/40">
                        <span className="flex items-center gap-1"><TypeIcon className="h-3 w-3" />{typeLabels[item.type]}</span>
                        <span className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= (item.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-[#111827]/10 dark:text-[#E5E7EB]/10'}`} />
                          ))}
                        </span>
                      </div>
                      <span className="text-xs text-[#111827]/40 dark:text-[#E5E7EB]/30">{formatDate(item.createdAt)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
    </AdminProtectedRoute>
  );
}
