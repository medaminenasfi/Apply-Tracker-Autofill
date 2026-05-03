'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { feedbackApi, Feedback, FeedbackStatus, FeedbackType } from '@/services/feedback';
import { Clock, FileText, MessageSquare, Trash2, Star, Bug, Sparkles, MessageSquareText, Inbox, FileImage, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';
import { ListSkeleton } from '@/components/ui/skeleton';
import FeedbackButton from '@/components/feedback/FeedbackButton';

const statusConfig: Record<FeedbackStatus, { bg: string; text: string; border: string; label: string }> = {
  [FeedbackStatus.NEW]: {
    bg: 'bg-slate-100 dark:bg-slate-500/10',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-500/20',
    label: 'New'
  },
  [FeedbackStatus.VIEWED]: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-500/20',
    label: 'In Progress'
  },
  [FeedbackStatus.RESOLVED]: {
    bg: 'bg-green-50 dark:bg-green-500/10',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-500/20',
    label: 'Resolved'
  },
};

const typeConfig: Record<FeedbackType, { icon: any; color: string; bg: string; label: string }> = {
  [FeedbackType.BUG]: { icon: Bug, color: '#EF4444', bg: 'bg-red-50 dark:bg-red-500/10', label: 'Bug Report' },
  [FeedbackType.IMPROVEMENT]: { icon: Sparkles, color: '#7C3AED', bg: 'bg-purple-50 dark:bg-purple-500/10', label: 'Feature' },
  [FeedbackType.GENERAL]: { icon: MessageSquareText, color: '#2563EB', bg: 'bg-blue-50 dark:bg-blue-500/10', label: 'General' },
};

type FilterType = 'all' | 'new' | 'resolved' | 'bug' | 'feature' | 'general';

export default function FeedbackPage() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { setLoading } = useLoadingStore();

  useEffect(() => {
    if (user) {
      loadFeedback();
    }
  }, [user]);

  const loadFeedback = async () => {
    try {
      const data = await withLoader(() => feedbackApi.getMyFeedback(), setLoading);
      setFeedback(data);
      setIsFetching(false);
    } catch (error) {
      console.error('Failed to load feedback:', error);
      toast.error('Failed to load feedback history');
      setIsFetching(false);
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await withLoader(() => feedbackApi.deleteFeedback(feedbackId), setLoading);
      setFeedback(feedback.filter((item) => item._id !== feedbackId));
      toast.success('Feedback deleted successfully');
    } catch (error) {
      console.error('Failed to delete feedback:', error);
      toast.error('Failed to delete feedback');
    }
  };

  const filteredFeedback = feedback.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'new') return item.status === FeedbackStatus.NEW;
    if (activeFilter === 'resolved') return item.status === FeedbackStatus.RESOLVED;
    if (activeFilter === 'bug') return item.type === FeedbackType.BUG;
    if (activeFilter === 'feature') return item.type === FeedbackType.IMPROVEMENT;
    if (activeFilter === 'general') return item.type === FeedbackType.GENERAL;
    return true;
  });

  const summary = {
    total: feedback.length,
    new: feedback.filter((f) => f.status === FeedbackStatus.NEW).length,
    inProgress: feedback.filter((f) => f.status === FeedbackStatus.VIEWED).length,
    resolved: feedback.filter((f) => f.status === FeedbackStatus.RESOLVED).length,
  };

  // Show skeleton while fetching
  if (isFetching) {
    return (
      <DashboardLayout title="My Feedback">
        <div className="space-y-6 transition-opacity duration-200">
          <ListSkeleton count={3} />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout title="My Feedback">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Feedback</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track your feedback and admin responses</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220] shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Feedback</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.total}</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-500/20 bg-slate-50 dark:bg-slate-500/5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">New</p>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{summary.new}</p>
          </div>
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{summary.inProgress}</p>
          </div>
          <div className="p-4 rounded-xl border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">Resolved</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{summary.resolved}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {[
            { id: 'all' as FilterType, label: 'All' },
            { id: 'new' as FilterType, label: 'New' },
            { id: 'resolved' as FilterType, label: 'Resolved' },
            { id: 'bug' as FilterType, label: 'Bug' },
            { id: 'feature' as FilterType, label: 'Feature' },
            { id: 'general' as FilterType, label: 'General' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white shadow-lg shadow-[#2563EB]/25'
                  : 'bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Feedback Grid */}
        {filteredFeedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/10 dark:bg-[#2563EB]/15 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-[#2563EB]" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No feedback found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-sm">
              {activeFilter !== 'all' ? 'Try a different filter.' : 'No feedback submitted yet.'}
            </p>
            <FeedbackButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeedback.map((item) => {
              const type = typeConfig[item.type];
              const status = statusConfig[item.status];
              const TypeIcon = type.icon;

              return (
                <div
                  key={item._id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.05] shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${type.bg}`}>
                        <TypeIcon className="w-3 h-3" style={{ color: type.color }} />
                        <span style={{ color: type.color }}>{type.label}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${status.bg} ${status.text} ${status.border}`}>
                        {status.label}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      aria-label="Delete feedback"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(item.createdAt)}
                  </div>

                  {/* User Message */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Message</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed line-clamp-3">{item.message}</p>
                  </div>

                  {/* Rating */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rating</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 transition-colors ${
                            star <= item.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-slate-600 dark:text-slate-400 ml-2">({item.rating}/5)</span>
                    </div>
                  </div>

                  {/* Attachment Preview */}
                  {item.attachment && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileImage className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attachment</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                        <FileImage className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-600 dark:text-slate-400 truncate">Image attached</span>
                      </div>
                    </div>
                  )}

                  {/* Admin Reply */}
                  {item.adminReply && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Admin Reply</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#7C3AED]/5 dark:bg-[#7C3AED]/10 border border-[#7C3AED]/10 dark:border-[#7C3AED]/20">
                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed line-clamp-3">{item.adminReply}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
