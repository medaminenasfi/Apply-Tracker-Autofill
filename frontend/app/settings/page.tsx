'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

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
      </div>
    </DashboardLayout>
  );
}
