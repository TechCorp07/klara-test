// src/app/(dashboard)/admin/components/PendingApprovalsCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { FormButton } from '@/components/ui/common/FormButton';

interface PendingUser {
  id: number;
  username: string;
  email: string;
  role: string;
  date_joined: string;
  profile: {
    first_name: string;
    last_name: string;
    phone_number?: string;
    institution?: string;
    company_name?: string;
    license_number?: string;
    npi?: string;
    specialization?: string;
  };
  registration_data?: {
    registration_ip?: string;
    documents_submitted?: string[];
    verification_status?: string;
  };
}

interface PendingApprovalsData {
  count: number;
  results: PendingUser[];
  priority_count: number; // Users with credentials requiring quick review
  overdue_count: number; // Users pending for more than X days
}

export default function PendingApprovalsCard() {
  const [data, setData] = useState<PendingApprovalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await apiClient.get('/users/users/pending-approvals/?limit=5');
      setData(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
      setError('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApproval = async (userId: number) => {
    setProcessingIds(prev => new Set(prev).add(userId));
    try {
      await apiClient.post(`/users/users/${userId}/approve/`, {
        note: 'Quick approval from dashboard'
      });
      
      // Refresh the data
      await fetchPendingApprovals();
    } catch (error) {
      console.error('Failed to approve user:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleQuickReject = async (userId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setProcessingIds(prev => new Set(prev).add(userId));
    try {
      await apiClient.post(`/users/users/${userId}/reject/`, {
        note: reason
      });
      
      // Refresh the data
      await fetchPendingApprovals();
    } catch (error) {
      console.error('Failed to reject user:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      provider: 'text-blue-700 bg-blue-100',
      researcher: 'text-purple-700 bg-purple-100',
      pharmco: 'text-green-700 bg-green-100',
      compliance: 'text-orange-700 bg-orange-100',
      patient: 'text-gray-700 bg-gray-100',
      caregiver: 'text-pink-700 bg-pink-100',
    };
    return colors[role as keyof typeof colors] || 'text-gray-700 bg-gray-100';
  };

  const getPriorityLevel = (user: PendingUser) => {
    // Higher priority for healthcare providers with credentials
    if (user.role === 'provider' && user.profile.license_number) return 'high';
    if (user.role === 'researcher' && user.profile.institution) return 'medium';
    if (user.role === 'pharmco') return 'medium';
    return 'normal';
  };

  const getDaysWaiting = (dateJoined: string) => {
    const joinDate = new Date(dateJoined);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>{error || 'Failed to load pending approvals'}</p>
          <button
            onClick={fetchPendingApprovals}
            className="mt-2 text-sm text-blue-600 hover:text-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
          <p className="text-sm text-gray-500">
            {data.count} user{data.count !== 1 ? 's' : ''} awaiting approval
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/admin/approvals')}
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View All →
        </button>
      </div>

      {/* Summary Stats */}
      {(data.priority_count > 0 || data.overdue_count > 0) && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-4 text-sm">
            {data.priority_count > 0 && (
              <span className="text-yellow-800">
                🔥 {data.priority_count} priority review{data.priority_count !== 1 ? 's' : ''}
              </span>
            )}
            {data.overdue_count > 0 && (
              <span className="text-orange-800">
                ⏰ {data.overdue_count} overdue approval{data.overdue_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Pending Users List */}
      {data.results.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No pending approvals</p>
          <p className="text-sm">All users have been processed!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.results.map((user) => {
            const priority = getPriorityLevel(user);
            const daysWaiting = getDaysWaiting(user.date_joined);
            const isProcessing = processingIds.has(user.id);

            return (
              <div
                key={user.id}
                className={`border rounded-lg p-4 ${
                  priority === 'high' ? 'border-red-200 bg-red-50' :
                  priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                  'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {user.profile.first_name} {user.profile.last_name}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                      {priority === 'high' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-red-700 bg-red-100">
                          Priority
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Waiting {daysWaiting} day{daysWaiting !== 1 ? 's' : ''}</span>
                      {user.profile.institution && (
                        <span>• {user.profile.institution}</span>
                      )}
                      {user.profile.license_number && (
                        <span>• License: {user.profile.license_number}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <FormButton
                      onClick={() => handleQuickApproval(user.id)}
                      loading={isProcessing}
                      size="sm"
                      variant="success"
                      disabled={isProcessing}
                    >
                      ✓ Approve
                    </FormButton>
                    <FormButton
                      onClick={() => handleQuickReject(user.id)}
                      loading={isProcessing}
                      size="sm"
                      variant="danger"
                      disabled={isProcessing}
                    >
                      ✗ Reject
                    </FormButton>
                    <button
                      onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}
                      className="text-xs text-blue-600 hover:text-blue-500 px-2 py-1"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      {data.count > 0 && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <button
              onClick={() => router.push('/dashboard/admin/approvals')}
              className="text-blue-600 hover:text-blue-500"
            >
              Review All Pending →
            </button>
            <button
              onClick={() => router.push('/dashboard/admin/approvals?bulk=true')}
              className="text-green-600 hover:text-green-500"
            >
              Bulk Actions →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}