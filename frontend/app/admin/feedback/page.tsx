'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Filter, ArrowRight } from 'lucide-react';
import { feedbackApi, Feedback, FeedbackStatus, FeedbackType } from '@/services/feedback';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/AdminLayout';

const statusColors: Record<FeedbackStatus, string> = {
  [FeedbackStatus.NEW]: 'bg-gray-100 text-gray-800',
  [FeedbackStatus.VIEWED]: 'bg-blue-100 text-blue-800',
  [FeedbackStatus.RESOLVED]: 'bg-green-100 text-green-800',
};

const typeLabels: Record<FeedbackType, string> = {
  [FeedbackType.BUG]: 'Bug Report',
  [FeedbackType.IMPROVEMENT]: 'Improvement',
  [FeedbackType.GENERAL]: 'General',
};

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<FeedbackType | ''>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFeedback();
  }, [statusFilter, typeFilter]);

  const loadFeedback = async () => {
    try {
      const data = await feedbackApi.getAllFeedback(
        statusFilter || undefined,
        typeFilter || undefined
      );
      setFeedback(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load feedback',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: FeedbackStatus) => {
    try {
      await feedbackApi.updateFeedback(id, { status: newStatus });
      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });
      loadFeedback();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Manage Feedback">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manage Feedback">
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FeedbackStatus | '')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value={FeedbackStatus.NEW}>New</option>
            <option value={FeedbackStatus.VIEWED}>Viewed</option>
            <option value={FeedbackStatus.RESOLVED}>Resolved</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FeedbackType | '')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value={FeedbackType.BUG}>Bug Report</option>
            <option value={FeedbackType.IMPROVEMENT}>Improvement</option>
            <option value={FeedbackType.GENERAL}>General</option>
          </select>
        </div>
      </div>

      {feedback.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No feedback found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feedback.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.user?.email || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {typeLabels[item.type]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item._id, e.target.value as FeedbackStatus)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[item.status]}`}
                    >
                      <option value={FeedbackStatus.NEW}>New</option>
                      <option value={FeedbackStatus.VIEWED}>Viewed</option>
                      <option value={FeedbackStatus.RESOLVED}>Resolved</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      href={`/admin/feedback/${item._id}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
