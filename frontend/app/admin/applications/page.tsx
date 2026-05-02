'use client';

import { useEffect, useState } from 'react';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, ArrowLeft, Briefcase, ExternalLink } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';
import { CardSkeleton, ListSkeleton } from '@/components/ui/skeleton';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const { setLoading } = useLoadingStore();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await withLoader(() => api.get('/admin/applications'), setLoading);
      setApplications(response.data);
      setIsFetching(false);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
      setIsFetching(false);
    }
  };

  // Show skeleton while fetching
  if (isFetching) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="space-y-6 transition-opacity duration-200">
            <ListSkeleton count={5} />
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  const handleDelete = async (applicationId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete application for ${companyName}?`)) {
      return;
    }

    try {
      await withLoader(() => api.delete(`/admin/applications/${applicationId}`), setLoading);
      setApplications(applications.filter((app) => app._id !== applicationId));
      toast.success('Application deleted successfully');
    } catch (error) {
      console.error('Failed to delete application:', error);
      toast.error('Failed to delete application');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout title="Manage Applications">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">All Applications</h2>
              <p className="text-muted-foreground">Manage all job applications across all users</p>
            </div>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Applications Table */}
          <Card>
            <CardContent className="p-0">
              {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mb-4 opacity-50" />
                  <p>No applications found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>User Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app._id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{app.companyName}</TableCell>
                          <TableCell>{app.position}</TableCell>
                          <TableCell className="text-muted-foreground">{app.userEmail || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(app.status)}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{app.dateApplied ? formatDate(app.dateApplied) : 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {app.jobUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(app.jobUrl, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(app._id, app.companyName)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
