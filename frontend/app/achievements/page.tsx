'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { userApi } from '@/services/api';
import { toast } from 'sonner';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [githubUser, setGithubUser] = useState('');

  const load = () => {
    userApi.get('/achievements').then((r) => setAchievements(r.data)).catch(() => setAchievements([]));
  };

  useEffect(() => { load(); }, []);

  const harvest = async () => {
    try {
      await userApi.post('/achievements/harvest/github', { username: githubUser });
      load();
      toast.success('GitHub achievements imported');
    } catch {
      toast.error('Harvest failed');
    }
  };

  return (
    <DashboardLayout title="Achievements & Career Journal">
      <div className="space-y-6 max-w-3xl">
        <div className="flex gap-2">
          <Input placeholder="GitHub username" value={githubUser} onChange={(e) => setGithubUser(e.target.value)} />
          <Button onClick={harvest} disabled={!githubUser.trim()}>Harvest GitHub</Button>
        </div>
        <div className="space-y-3">
          {achievements.map((a) => (
            <div key={a._id} className="border rounded-lg p-3">
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-muted-foreground">{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
