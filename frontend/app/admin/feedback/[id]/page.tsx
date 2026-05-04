'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, FileText, Send, Star, X, ZoomIn, CheckCircle } from 'lucide-react';
import { feedbackApi, Feedback, FeedbackStatus, FeedbackType } from '@/services/feedback';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/AdminLayout';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';
import { useTranslation } from 'react-i18next';

const statusStyles: Record<FeedbackStatus, string> = {
  [FeedbackStatus.NEW]: 'bg-slate-500/10 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300',
  [FeedbackStatus.VIEWED]: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  [FeedbackStatus.RESOLVED]: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
};


export default function AdminFeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t, i18n } = useTranslation();
  
  const typeLabels: Record<FeedbackType, string> = {
    [FeedbackType.BUG]: t('feedback.bugReport'),
    [FeedbackType.IMPROVEMENT]: t('feedback.feature'),
    [FeedbackType.GENERAL]: t('feedback.general'),
  };
  
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [adminReply, setAdminReply] = useState('');
  const [status, setStatus] = useState<FeedbackStatus>(FeedbackStatus.NEW);
  const [saving, setSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const router = useRouter();
  const { setLoading } = useLoadingStore();

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      loadFeedback(resolvedParams.id);
    };
    init();
  }, [params]);

  const loadFeedback = async (id: string) => {
    try {
      const data = await withLoader(() => feedbackApi.getFeedbackByIdAdmin(id), setLoading);
      setFeedback(data);
      setStatus(data.status);
      setAdminReply(data.adminReply || '');
      setIsFetching(false);
    } catch (error) {
      toast.error(t('admin.feedback.loadError'));
      router.push('/admin/feedback');
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    const resolvedParams = await params;
    try {
      let replyToSend = adminReply;
      if (status === FeedbackStatus.RESOLVED && !adminReply.trim() && !feedback?.adminReply) {
        replyToSend = 'Thank you for your feedback. We have reviewed it and marked it as resolved.';
      }

      await withLoader(async () => {
        await feedbackApi.updateFeedback(resolvedParams.id, {
          adminReply: replyToSend,
          status,
        });
      }, setLoading);

      toast.success(t('admin.feedback.updateSuccess'));
      await loadFeedback(resolvedParams.id);
    } catch (error) {
      toast.error(t('admin.feedback.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isFetching) {
    return (
      <AdminLayout title={t('admin.feedback.detailsTitle')}>
        <div className="space-y-4">
          <div className="h-8 w-32 rounded-lg bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] space-y-4">
            <div className="h-4 w-48 rounded bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-full rounded bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
            <div className="h-24 w-full rounded-xl bg-slate-100 dark:bg-white/[0.06] animate-pulse mt-4" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!feedback) return null;

  return (
    <AdminLayout title="Feedback Details">
      <div className="space-y-4">
        {/* Back Link */}
        <Link
          href="/admin/feedback"
          className="inline-flex items-center gap-2 text-sm text-[#111827]/60 dark:text-[#E5E7EB]/50 hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('admin.feedback.backToFeedback')}
        </Link>

        {/* Main Card */}
        <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-[#E5E7EB] dark:border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{typeLabels[feedback.type]}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[feedback.status]}`}>
                  {feedback.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#111827]/40 dark:text-[#E5E7EB]/30">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(feedback.createdAt)}
              </div>
            </div>
            <div className="text-sm text-[#111827]/60 dark:text-[#E5E7EB]/40">
              <span className="font-medium text-[#111827] dark:text-[#E5E7EB]">{t('admin.feedback.user')}:</span>{' '}
              {feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName}` : 'Unknown'}
              {feedback.user?.email && ` (${feedback.user.email})`}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">
            {/* Message */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-[#111827]/40 dark:text-[#E5E7EB]/30" />
                <h3 className="text-sm font-semibold">{t('feedback.yourMessage')}</h3>
              </div>
              <p className="text-sm text-[#111827]/70 dark:text-[#E5E7EB]/60 whitespace-pre-wrap bg-[#F9FAFB] dark:bg-white/[0.03] rounded-xl p-3 border border-[#E5E7EB] dark:border-white/[0.06]">
                {feedback.message}
              </p>
            </div>

            {/* Rating */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-[#111827]/40 dark:text-[#E5E7EB]/30" />
                <h3 className="text-sm font-semibold">{t('feedback.rating')}</h3>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-[#111827]/10 dark:text-[#E5E7EB]/10'}`}
                  />
                ))}
                <span className="text-xs text-[#111827]/40 dark:text-[#E5E7EB]/30 ml-2">({feedback.rating}/5)</span>
              </div>
            </div>

            {/* Screenshot */}
            {feedback.attachment && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ZoomIn className="w-4 h-4 text-[#111827]/40 dark:text-[#E5E7EB]/30" />
                  <h3 className="text-sm font-semibold">{t('admin.feedback.screenshot')}</h3>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-[#E5E7EB] dark:border-white/[0.06]">
                  <img
                    src={feedback.attachment}
                    alt="Feedback screenshot"
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setIsImageModalOpen(true)}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-[10px] backdrop-blur-sm">
                    {t('admin.feedback.clickToZoom')}
                  </div>
                </div>
              </div>
            )}

            {/* Admin Response */}
            <div className="pt-4 border-t border-[#E5E7EB] dark:border-white/[0.06]">
              <h3 className="text-sm font-semibold mb-3">{t('admin.feedback.adminResponse')}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#111827]/60 dark:text-[#E5E7EB]/40 mb-1.5">
                    {t('admin.feedback.reply')}
                  </label>
                  <textarea
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-[#F9FAFB] dark:bg-white/[0.03] text-[#111827] dark:text-[#E5E7EB] placeholder:text-[#111827]/30 dark:placeholder:text-[#E5E7EB]/30 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors resize-none"
                    placeholder={t('admin.feedback.writeReply')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827]/60 dark:text-[#E5E7EB]/40 mb-1.5">
                    {t('admin.feedback.status')}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as FeedbackStatus)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-[#F9FAFB] dark:bg-white/[0.03] text-[#111827] dark:text-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                  >
                    <option value={FeedbackStatus.NEW}>{t('statuses.new')}</option>
                    <option value={FeedbackStatus.VIEWED}>{t('statuses.viewed')}</option>
                    <option value={FeedbackStatus.RESOLVED}>{t('statuses.resolved')}</option>
                  </select>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {saving ? t('admin.feedback.sending') : t('admin.feedback.sendReply')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {isImageModalOpen && feedback.attachment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setIsImageModalOpen(false)}>
            <button
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={() => setIsImageModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={feedback.attachment}
              alt="Feedback screenshot zoomed"
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
