'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { feedbackApi, Feedback, FeedbackStatus, FeedbackType } from '@/services/feedback';
import { Clock, ArrowRight, FileText, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

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

export default function SettingsPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const data = await feedbackApi.getMyFeedback();
      setFeedback(data);
      toast.success('Settings and feedback loaded successfully');
    } catch (error) {
      console.error('Failed to load feedback:', error);
      toast.error('Failed to load feedback history');
    } finally {
      setLoading(false);
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

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Manage your preferences and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Settings page coming soon. You can manage your preferences here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Feedback</CardTitle>
            <CardDescription>View all your feedback and admin responses</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : feedback.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No feedback submitted yet</p>
                <p className="text-sm mt-2">Click the feedback button in the bottom right to submit your first feedback</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div key={item._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {typeLabels[item.type]}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                      <Link
                        href={`/profile/feedback/${item._id}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">Your Message</span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{item.message}</p>
                      </div>
                      
                      {item.adminReply && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">Admin Reply</span>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-md">
                            <p className="text-sm text-gray-700 line-clamp-2">{item.adminReply}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
