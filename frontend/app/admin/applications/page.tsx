'use client';

import { useEffect, useState } from 'react';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Trash2, Briefcase, ExternalLink, Search } from 'lucide-react';
import { adminApi } from '@/services/api';
import { toast } from 'sonner';
import { withLoader } from '@/hooks/useLoader';
import { useLoadingStore } from '@/store/loadingStore';
import { useTranslation } from 'react-i18next';

const statusStyles: Record<string, string> = {
  applied: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  interview: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
  accepted: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  rejected: 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400',
};

export default function AdminApplicationsPage() {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { setLoading } = useLoadingStore();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await withLoader(() => adminApi.get('/admin/applications'), setLoading);
      setApplications(response.data);
      setIsFetching(false);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error(t('admin.applications.loadError'));
      setIsFetching(false);
    }
  };

  const handleDelete = async (applicationId: string, companyName: string) => {
    if (!confirm(t('admin.applications.deleteConfirm', { company: companyName }))) return;

    try {
      await withLoader(() => adminApi.delete(`/admin/applications/${applicationId}`), setLoading);
      setApplications(applications.filter((app) => app._id !== applicationId));
      toast.success(t('admin.applications.deleteSuccess'));
    } catch (error) {
      console.error('Failed to delete application:', error);
      toast.error(t('admin.applications.deleteError'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filtered = applications.filter((app) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (app.companyName || app.company || '').toLowerCase().includes(q) || (app.position || '').toLowerCase().includes(q) || (app.userId?.email || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isFetching) {
    return (
      <AdminProtectedRoute>
        <AdminLayout title="Manage Applications">
          <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/[0.08]">
              <div className="h-4 w-48 rounded-lg bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="h-3 w-40 rounded bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
                <div className="h-3 w-24 rounded bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
                <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-white/[0.06] animate-pulse ml-auto" />
                <div className="h-3 w-20 rounded bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
              </div>
            ))}
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout title="Manage Applications">
        <div className="space-y-4">
          {/* Header + Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">All Applications</h2>
              <p className="text-sm text-[#111827]/50 dark:text-[#E5E7EB]/40">{applications.length} total applications</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#111827]/30 dark:text-[#E5E7EB]/30" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-[#111827] dark:text-[#E5E7EB] placeholder:text-[#111827]/30 dark:placeholder:text-[#E5E7EB]/30 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-[#111827] dark:text-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#111827]/40 dark:text-[#E5E7EB]/30">
              <Briefcase className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">No applications found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] overflow-hidden bg-white dark:bg-white/[0.03]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] dark:border-white/[0.06] bg-[#F9FAFB] dark:bg-white/[0.03]">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Company</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Position</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">User</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Source</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Date</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#111827]/50 dark:text-[#E5E7EB]/40">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06]">
                    {filtered.map((app) => (
                      <tr key={app._id} className="hover:bg-[#F9FAFB] dark:hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-3.5 font-medium text-sm">{app.companyName || app.company || 'N/A'}</td>
                        <td className="px-5 py-3.5 text-sm">{app.position || 'N/A'}</td>
                        <td className="px-5 py-3.5 text-sm text-[#111827]/60 dark:text-[#E5E7EB]/50">{app.userId?.email || 'N/A'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[app.status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <SourceBadge source={app.source as 'manual' | 'extension'} />
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#111827]/50 dark:text-[#E5E7EB]/40">{app.dateApplied ? formatDate(app.dateApplied) : app.createdAt ? formatDate(app.createdAt) : 'N/A'}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {app.jobUrl && (
                              <button
                                onClick={() => window.open(app.jobUrl, '_blank')}
                                className="p-2 rounded-lg text-[#111827]/40 dark:text-[#E5E7EB]/40 hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(app._id, app.companyName || app.company || 'Unknown')}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filtered.map((app) => (
                  <div key={app._id} className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{app.companyName || app.company || 'N/A'}</p>
                        <p className="text-xs text-[#111827]/50 dark:text-[#E5E7EB]/40 truncate">{app.position || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <SourceBadge source={app.source as 'manual' | 'extension'} />
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusStyles[app.status] || 'bg-gray-100 text-gray-600'}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E7EB] dark:border-white/[0.06]">
                      <div className="text-xs text-[#111827]/50 dark:text-[#E5E7EB]/40 min-w-0">
                        <p className="truncate">{app.userId?.email || 'N/A'}</p>
                        <p>{app.dateApplied ? formatDate(app.dateApplied) : 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {app.jobUrl && (
                          <button
                            onClick={() => window.open(app.jobUrl, '_blank')}
                            className="p-2 rounded-lg text-[#111827]/40 dark:text-[#E5E7EB]/40 hover:text-[#2563EB] transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(app._id, app.companyName || app.company || 'Unknown')}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
