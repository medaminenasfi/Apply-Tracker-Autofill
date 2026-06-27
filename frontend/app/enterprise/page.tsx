'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { userApi } from '@/services/api';

export default function EnterprisePage() {
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    userApi.get('/enterprise/counselor/dashboard').then((r) => setDashboard(r.data)).catch(() => setDashboard(null));
  }, []);

  return (
    <DashboardLayout title="Counselor Dashboard">
      <div className="space-y-4 max-w-4xl">
        <p className="text-muted-foreground text-sm">Enterprise / university licensing overview for counselors.</p>
        {dashboard ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Members" value={dashboard.stats?.activeMembers ?? 0} />
              <Stat label="Applications" value={dashboard.stats?.totalApplications ?? 0} />
              <Stat label="Interview" value={dashboard.stats?.byStatus?.interview ?? 0} />
              <Stat label="Accepted" value={dashboard.stats?.byStatus?.accepted ?? 0} />
            </div>
            <div className="border rounded-xl p-4">
              <p className="font-medium mb-2">Organizations</p>
              {(dashboard.organizations || []).map((org: any) => (
                <p key={org._id} className="text-sm">{org.name} ({org.type})</p>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm">No counselor organizations linked to this account yet.</p>
        )}
      </div>
    </DashboardLayout>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-xl p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
