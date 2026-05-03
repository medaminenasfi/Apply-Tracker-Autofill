'use client';

import { useEffect, useState } from 'react';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Trash2, User, Search, Users as UsersIcon } from 'lucide-react';
import { adminApi } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState('');
  const { user: currentAdmin } = useAuth();
  const { setLoading } = useLoadingStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersResponse, appsResponse] = await Promise.all([
        withLoader(() => adminApi.get('/admin/users'), setLoading),
        withLoader(() => adminApi.get('/admin/applications'), setLoading),
      ]);

      const regularUsers = usersResponse.data.filter((user: any) => user.role !== 'admin');
      setUsers(regularUsers);

      const counts: Record<string, number> = {};
      appsResponse.data.forEach((app: any) => {
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

  const handleDelete = async (userId: string, firstName: string) => {
    if (userId === currentAdmin?._id) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (!confirm(`Are you sure you want to delete user ${firstName}?`)) return;

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
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getInitials = (user: any) => {
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.firstName?.toLowerCase().includes(q) || u.lastName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  if (isFetching) {
    return (
      <AdminProtectedRoute>
        <AdminLayout title="Manage Users">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-[#111827]/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout title="Manage Users">
        <div className="space-y-4">
          {/* Header + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">All Users</h2>
              <p className="text-sm text-[#111827]/50 dark:text-[#E5E7EB]/40">{users.length} registered users</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#111827]/30 dark:text-[#E5E7EB]/30" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-[#111827] dark:text-[#E5E7EB] placeholder:text-[#111827]/30 dark:placeholder:text-[#E5E7EB]/30 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#111827]/40 dark:text-[#E5E7EB]/30">
              <User className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] overflow-hidden bg-white dark:bg-white/[0.03]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] dark:border-white/[0.06] bg-[#F9FAFB] dark:bg-white/[0.03]">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">User</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Email</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Applications</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Created</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06]">
                    {filtered.map((user) => (
                      <tr key={user._id} className="hover:bg-[#F9FAFB] dark:hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {getInitials(user)}
                            </div>
                            <span className="font-medium text-sm">{user.firstName} {user.lastName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#111827]/60 dark:text-[#E5E7EB]/50">{user.email}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/15 dark:text-[#3B82F6]">
                            {applicationCounts[user._id] || 0}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#111827]/50 dark:text-[#E5E7EB]/40">{formatDate(user.createdAt)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleDelete(user._id, user.firstName)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filtered.map((user) => (
                  <div key={user._id} className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {getInitials(user)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-[#111827]/50 dark:text-[#E5E7EB]/40 truncate">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(user._id, user.firstName)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#E5E7EB] dark:border-white/[0.06] text-xs text-[#111827]/50 dark:text-[#E5E7EB]/40">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/15 dark:text-[#3B82F6]">
                        {applicationCounts[user._id] || 0} apps
                      </span>
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
