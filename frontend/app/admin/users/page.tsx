'use client';

import { useEffect, useState } from 'react';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, ArrowLeft, Shield, User } from 'lucide-react';
import { adminApi } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';
import { CardSkeleton, ListSkeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});
  const [isFetching, setIsFetching] = useState(true);
  const { user: currentAdmin } = useAuth();
  const { setLoading } = useLoadingStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users and applications in parallel
      const [usersResponse, appsResponse] = await Promise.all([
        withLoader(() => adminApi.get('/admin/users'), setLoading),
        withLoader(() => adminApi.get('/admin/applications'), setLoading),
      ]);

      // Filter to show only regular users, not admins
      const regularUsers = usersResponse.data.filter((user: any) => user.role !== 'admin');
      setUsers(regularUsers);

      // Count applications per user by userId
      const counts: Record<string, number> = {};
      appsResponse.data.forEach((app: any) => {
        // userId is populated as an object, get the _id from it
        const userId = app.userId?._id || app.userId;
        if (userId) {
          counts[userId] = (counts[userId] || 0) + 1;
        }
      });
      setApplicationCounts(counts);

      setIsFetching(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
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

  const handleDelete = async (userId: string, firstName: string) => {
    // Prevent admin from deleting themselves
    if (userId === currentAdmin?._id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!confirm(`Are you sure you want to delete user ${firstName}?`)) {
      return;
    }

    try {
      await withLoader(() => adminApi.delete(`/admin/users/${userId}`), setLoading);
      setUsers(users.filter((user) => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout title="Manage Users">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">All Users</h2>
              <p className="text-muted-foreground">Manage all registered users</p>
            </div>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <User className="h-12 w-12 mb-4 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Applicants</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lg">{applicationCounts[user._id] || 0}</span>
                              <span className="text-muted-foreground text-sm">applicants</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(user._id, user.firstName)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
