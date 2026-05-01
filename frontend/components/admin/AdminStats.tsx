'use client';

import { useApplicationStore } from '@/store/applicationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, CheckCircle, XCircle, Clock, User } from 'lucide-react';

export function AdminStats() {
  const { applications } = useApplicationStore();

  const stats = [
    {
      title: 'Total Applications',
      value: applications.length,
      icon: Briefcase,
      color: 'text-blue-500',
    },
    {
      title: 'Accepted',
      value: applications.filter((a) => a.status === 'Accepted').length,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Rejected',
      value: applications.filter((a) => a.status === 'Rejected').length,
      icon: XCircle,
      color: 'text-red-500',
    },
    {
      title: 'Pending',
      value: applications.filter((a) => a.status === 'Pending').length,
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      title: 'In Interview',
      value: applications.filter((a) => a.status === 'Interview').length,
      icon: User,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total applications
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
