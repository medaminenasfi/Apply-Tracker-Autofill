'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, FileText, Send } from 'lucide-react';
import { feedbackApi, Feedback, FeedbackStatus, FeedbackType } from '@/services/feedback';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/AdminLayout';

const statusColors: Record<FeedbackStatus, string> = {
  [FeedbackStatus.NEW]: 'bg-gray-100 text-gray-800',
  [FeedbackStatus.VIEWED]: 'bg-blue-100 text-blue-800',
  [FeedbackStatus.RESOLVED]: 'bg-green-100 text-green-800',
};

const typeLabels: Record<FeedbackType, string> = {
  [FeedbackType.BUG]: 'Bug Report',
  [FeedbackType.IMPROVEMENT]: 'Improvement',
  [FeedbackType.GENERAL]: 'General',
};

export default function AdminFeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [adminReply, setAdminReply] = useState('');
  const [status, setStatus] = useState<FeedbackStatus>(FeedbackStatus.NEW);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      loadFeedback(resolvedParams.id);
    };
    init();
  }, [params]);

  useEffect(() => {
    if (feedback) {
      setAdminReply(feedback.adminReply || '');
      setStatus(feedback.status);
    }
  }, [feedback]);

  const loadFeedback = async (id: string) => {
    try {
      const data = await feedbackApi.getFeedbackByIdAdmin(id);
      setFeedback(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load feedback',
        variant: 'destructive',
      });
      router.push('/admin/feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const resolvedParams = await params;
    setSaving(true);
    try {
      // Only add auto-reply if status is RESOLVED and NO reply exists yet
      let replyToSend = adminReply;
      if (status === FeedbackStatus.RESOLVED && !adminReply.trim() && !feedback?.adminReply) {
        replyToSend = 'Thank you for your feedback. We have reviewed it and marked it as resolved.';
      }

      await feedbackApi.updateFeedback(resolvedParams.id, {
        adminReply: replyToSend,
        status,
      });

      toast({
        title: 'Success',
        description: 'Feedback updated successfully',
      });

      // Reload feedback to get updated data
      await loadFeedback(resolvedParams.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update feedback',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Feedback Details">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!feedback) {
    return null;
  }

  return (
    <AdminLayout title="Feedback Details">
      <Link
        href="/admin/feedback"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Feedback
      </Link>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">
                {typeLabels[feedback.type]}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[feedback.status]}`}>
                {feedback.status}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {formatDate(feedback.createdAt)}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">User:</span>{' '}
            {feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName}` : 'Unknown'}
            {feedback.user?.email && ` (${feedback.user.email})`}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">User Message</h3>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{feedback.message}</p>
            {feedback.attachment && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">Attachment: {feedback.attachment}</span>
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Admin Response</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reply
                </label>
                <textarea
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your reply..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FeedbackStatus)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={FeedbackStatus.NEW}>New</option>
                  <option value={FeedbackStatus.VIEWED}>Viewed</option>
                  <option value={FeedbackStatus.RESOLVED}>Resolved</option>
                </select>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {saving ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
