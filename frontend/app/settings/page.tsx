'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { billingApi } from '@/services/billing';
import { usersApi } from '@/services/users';
import { toast } from 'sonner';
import Link from 'next/link';

function SettingsContent() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [portalLoading, setPortalLoading] = useState(false);
  const [emailReminders, setEmailReminders] = useState(true);
  const [inAppReminders, setInAppReminders] = useState(true);
  const [prefsLoading, setPrefsLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get('billing') === 'success') {
      toast.success('Subscription activated — welcome to Pro!');
    }
  }, [searchParams]);

  useEffect(() => {
    usersApi
      .getNotificationPreferences()
      .then((prefs) => {
        setEmailReminders(prefs.emailRemindersEnabled);
        setInAppReminders(prefs.inAppRemindersEnabled);
      })
      .catch(() => {})
      .finally(() => setPrefsLoading(false));
  }, []);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const { url } = await billingApi.portal();
      if (url) window.location.href = url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Billing portal unavailable');
    } finally {
      setPortalLoading(false);
    }
  };

  const savePref = async (key: 'emailRemindersEnabled' | 'inAppRemindersEnabled', value: boolean) => {
    try {
      await usersApi.updateNotificationPreferences({ [key]: value });
      toast.success('Preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout title={t('settings.title')}>
      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Billing & Plan</CardTitle>
            <CardDescription>Manage your subscription and application limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium capitalize">{(user as any).plan || 'free'} plan</p>
                <p className="text-sm text-muted-foreground">
                  Free plan includes up to 20 tracked applications. Pro unlocks AI match, ghost save, and unlimited tracking.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/pricing">View plans</Link>
                </Button>
                <Button onClick={handleManageBilling} disabled={portalLoading}>
                  {portalLoading ? 'Opening…' : 'Manage billing'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Control how ApplyFlow reminds you about deadlines and follow-ups.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="email-reminders">Email reminders</Label>
                <p className="text-sm text-muted-foreground">Daily digest when you have pending reminders</p>
              </div>
              <Switch
                id="email-reminders"
                checked={emailReminders}
                disabled={prefsLoading}
                onCheckedChange={(checked) => {
                  setEmailReminders(checked);
                  savePref('emailRemindersEnabled', checked);
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="inapp-reminders">In-app reminders</Label>
                <p className="text-sm text-muted-foreground">Show reminder widget on the tracker</p>
              </div>
              <Switch
                id="inapp-reminders"
                checked={inAppReminders}
                disabled={prefsLoading}
                onCheckedChange={(checked) => {
                  setInAppReminders(checked);
                  savePref('inAppRemindersEnabled', checked);
                }}
              />
            </div>
            <Button variant="outline" asChild>
              <Link href="/notifications">View all notifications</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.appSettings')}</CardTitle>
            <CardDescription>{t('settings.appSettingsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground text-sm">Account: {user.email}</p>
            <p className="text-muted-foreground text-sm">
              <Link href="/privacy" className="text-[#2563EB] hover:underline">Privacy policy</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}
