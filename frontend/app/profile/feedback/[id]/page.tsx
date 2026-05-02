'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, FileText, MessageSquare } from 'lucide-react';
import { feedbackApi, Feedback, FeedbackStatus, FeedbackType } from '@/services/feedback';
import { useToast } from '@/hooks/use-toast';

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

export default function FeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      loadFeedback(resolvedParams.id);
    };
    init();
  }, [params]);

  const loadFeedback = async (id: string) => {
    try {
      const data = await feedbackApi.getFeedbackById(id);
      setFeedback(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load feedback',
        variant: 'destructive',
      });
      router.push('/settings');
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

  if (!feedback) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
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
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Your Message</h3>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{feedback.message}</p>
            {feedback.attachment && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">Attachment: {feedback.attachment}</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Admin Reply</h3>
            </div>
            {feedback.adminReply ? (
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-gray-700 whitespace-pre-wrap">{feedback.adminReply}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No reply yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
