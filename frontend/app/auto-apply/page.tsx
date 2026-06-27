'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { userApi } from '@/services/api';
import { toast } from 'sonner';

export default function AutoApplyPage() {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    userApi.get('/auto-apply/queue').then((r) => setQueue(r.data)).catch(() => setQueue([]));
  }, []);

  const approve = async (id: string) => {
    try {
      await userApi.post(`/auto-apply/queue/${id}/approve`);
      setQueue((q) => q.filter((item) => item._id !== id));
      toast.success('Application approved and logged');
    } catch {
      toast.error('Failed to approve');
    }
  };

  return (
    <DashboardLayout title="Ghost Mode — Auto Apply">
      <div className="space-y-4 max-w-3xl">
        <p className="text-muted-foreground text-sm">
          Review jobs discovered by Ghost Mode. One-click approve to log them in your tracker.
        </p>
        {queue.length === 0 ? (
          <p className="text-sm">No pending applications. Add search criteria from settings when available.</p>
        ) : (
          queue.map((item) => (
            <div key={item._id} className="border rounded-xl p-4 flex justify-between gap-4 items-center">
              <div>
                <p className="font-semibold">{item.companyName}</p>
                <p className="text-sm text-muted-foreground">{item.position}</p>
              </div>
              <Button onClick={() => approve(item._id)}>Approve</Button>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
