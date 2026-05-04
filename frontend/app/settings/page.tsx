'use client';

import { useTranslation } from 'react-i18next';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout title={t('settings.title')}>
      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">{t('settings.appSettings')}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('settings.appSettingsDesc')}</p>
          </CardHeader>
          <CardContent>
            <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
            <p className="text-muted-foreground">
              {t('settings.settingsComingSoon')}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
