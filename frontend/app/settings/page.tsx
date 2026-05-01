import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl space-y-6">
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
