'use client';

import { useEffect, useState } from 'react';
import { Bell, TrendingUp } from 'lucide-react';
import { remindersApi, ReminderItem, CvAnalyticsItem } from '@/services/reminders';
import { usersApi } from '@/services/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RemindersWidget() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [analytics, setAnalytics] = useState<CvAnalyticsItem[]>([]);
  const [inAppEnabled, setInAppEnabled] = useState(true);

  useEffect(() => {
    usersApi
      .getNotificationPreferences()
      .then((prefs) => setInAppEnabled(prefs.inAppRemindersEnabled))
      .catch(() => setInAppEnabled(true));

    remindersApi.list().then(setReminders).catch(() => setReminders([]));
    remindersApi.cvAnalytics().then(setAnalytics).catch(() => setAnalytics([]));
  }, []);

  if (!inAppEnabled) return null;
  if (!reminders.length && !analytics.length) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 mb-4">
      {reminders.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" /> Smart Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reminders.slice(0, 5).map((item) => (
              <div key={`${item.applicationId}-${item.type}`} className="text-sm border-b border-slate-100 dark:border-white/5 pb-2 last:border-0">
                <p className="font-medium">{item.companyName} — {item.position}</p>
                <p className="text-muted-foreground">{item.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {analytics.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> CV Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.map((item) => (
              <div key={item.cvUsed} className="text-sm flex justify-between gap-2">
                <span className="truncate">{item.cvUsed}</span>
                <span className="text-muted-foreground shrink-0">
                  {item.interviewRate}% interview · {item.total} apps
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
