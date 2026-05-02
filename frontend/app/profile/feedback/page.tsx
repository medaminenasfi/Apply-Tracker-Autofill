'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { feedbackApi, Feedback, FeedbackStatus, FeedbackType } from '@/services/feedback';
import { useToast } from '@/hooks/use-toast';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const data = await feedbackApi.getMyFeedback();
      setFeedback(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load feedback',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Redirect to settings
  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return null;
}
