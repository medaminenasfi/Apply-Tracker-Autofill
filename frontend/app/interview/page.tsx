'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { userApi } from '@/services/api';
import { toast } from 'sonner';

export default function InterviewPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [session, setSession] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [index, setIndex] = useState(0);

  const start = async () => {
    try {
      const res = await userApi.post('/interview/sessions', { jobTitle, jobDescription: '' });
      setSession(res.data);
      setIndex(0);
      setAnswer('');
    } catch {
      toast.error('Could not start session');
    }
  };

  const submit = async () => {
    if (!session) return;
    try {
      const res = await userApi.post(`/interview/sessions/${session._id}/answer`, {
        questionIndex: index,
        answer,
      });
      setSession(res.data);
      setAnswer('');
      if (index + 1 < (res.data.questions?.length || 0)) {
        setIndex(index + 1);
      } else {
        toast.success('Interview simulation complete');
      }
    } catch {
      toast.error('Failed to submit answer');
    }
  };

  return (
    <DashboardLayout title="Interview Simulator">
      <div className="max-w-2xl space-y-4">
        {!session ? (
          <>
            <Input placeholder="Job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            <Button onClick={start} disabled={!jobTitle.trim()}>Start simulation</Button>
          </>
        ) : (
          <>
            <p className="font-medium">Question {index + 1}: {session.questions?.[index]}</p>
            <textarea
              className="w-full min-h-[120px] border rounded-lg p-3 bg-transparent"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer…"
            />
            <Button onClick={submit} disabled={!answer.trim()}>Submit answer</Button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
