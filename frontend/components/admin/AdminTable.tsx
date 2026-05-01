'use client';

import { useApplicationStore } from '@/store/applicationStore';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { ApplicationStatus } from '@/types';

const statusColors: Record<ApplicationStatus, { bg: string; text: string }> = {
  Applied: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
  Pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
  Interview: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200' },
  Accepted: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
  Rejected: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
};

export function AdminTable() {
  const { applications, updateApplication } = useApplicationStore();
  const { user: currentUser } = useAuthStore();
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'All'>('All');

  // Find user names for applications
  const demoUsers = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Admin User' },
  ];

  const getUserName = (userId: string) => {
    const user = demoUsers.find((u) => u.id === userId);
    return user?.name || 'Unknown';
  };

  const filteredApplications =
    filterStatus === 'All'
      ? applications
      : applications.filter((app) => app.status === filterStatus);

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    await updateApplication(applicationId, { status: newStatus });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus as any}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Interview">Interview</SelectItem>
            <SelectItem value="Accepted">Accepted</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Company</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app) => {
                const colors = statusColors[app.status];
                return (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.company}</TableCell>
                    <TableCell>{app.position}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getUserName(app.userId)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={app.status}
                        onValueChange={(value) =>
                          handleStatusChange(app.id, value as ApplicationStatus)
                        }
                      >
                        <SelectTrigger className="w-40">
                          <Badge
                            variant="outline"
                            className={`${colors.bg} ${colors.text} border-0 cursor-pointer`}
                          >
                            {app.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Applied">Applied</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Interview">Interview</SelectItem>
                          <SelectItem value="Accepted">Accepted</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(app.dateApplied), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {app.priority || 'medium'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No applications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
