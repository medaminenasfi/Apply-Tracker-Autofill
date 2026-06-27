'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, TrendingUp } from 'lucide-react';
import { remindersApi, ReminderItem, CvAnalyticsItem } from '@/services/reminders';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [analytics, setAnalytics] = useState<CvAnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([remindersApi.list(), remindersApi.cvAnalytics()])
      .then(([r, a]) => {
        setReminders(r);
        setAnalytics(a);
      })
      .catch(() => {
        setReminders([]);
        setAnalytics([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Notifications">
      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Smart Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active reminders. You are all caught up.</p>
            ) : (
              <div className="space-y-3">
                {reminders.map((item) => (
                  <div
                    key={`${item.applicationId}-${item.type}`}
                    className="rounded-lg border p-4 text-sm"
                  >
                    <p className="font-medium">
                      {item.companyName} — {item.position}
                    </p>
                    <p className="text-muted-foreground mt-1">{item.message}</p>
                    <p className="text-xs text-muted-foreground mt-2 capitalize">{item.type.replace('_', ' ')} · {item.priority} priority</p>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/applicant">Open tracker</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> CV Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.length === 0 ? (
              <p className="text-sm text-muted-foreground">Track applications with a CV version to see analytics.</p>
            ) : (
              <div className="space-y-2">
                {analytics.map((item) => (
                  <div key={item.cvUsed} className="flex justify-between gap-4 text-sm border-b pb-2 last:border-0">
                    <span className="truncate font-medium">{item.cvUsed}</span>
                    <span className="text-muted-foreground shrink-0">
                      {item.interviewRate}% interview · {item.total} apps
                    </span>
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
