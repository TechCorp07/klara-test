// src/app/(dashboard)/admin/components/UserManagementCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

interface UserStats {
  total_users: number;
  users_by_role: Record<string, number>;
  recent_registrations: number;
  pending_approvals: number;
  locked_accounts: number;
  users_requiring_verification: number;
  new_users_last_7_days: number;
  active_users_today: number;
  inactive_users: number;
}

interface RecentUser {
  id: number;
  username: string;
  email: string;
  role: string;
  date_joined: string;
  is_approved: boolean;
  profile?: {
    first_name: string;
    last_name: string;
    institution?: string;
    company_name?: string;
  };
}

export default function UserManagementCard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Fetch user statistics
      const statsResponse = await apiClient.get('/users/admin/user-stats/');
      setStats(statsResponse.data);

      // Fetch recent users
      const recentResponse = await apiClient.get('/users/users/?ordering=-date_joined&page_size=5');
      setRecentUsers(recentResponse.data.results || []);
      
      setError(null);
    } catch (error: unknown) {
      console.error('Failed to fetch user stats:', error);
      setError('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      patient: 'text-gray-700 bg-gray-100',
      provider: 'text-blue-700 bg-blue-100',
      researcher: 'text-purple-700 bg-purple-100',
      compliance: 'text-orange-700 bg-orange-100',
      caregiver: 'text-pink-700 bg-pink-100',
      pharmco: 'text-green-700 bg-green-100',
      admin: 'text-red-700 bg-red-100',
    };
    return colors[role as keyof typeof colors] || 'text-gray-700 bg-gray-100';
  };

  const getRolePercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            <div className="h-3 bg-gray-200 rounded w-3/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>{error || 'Failed to load user statistics'}</p>
          <button
            onClick={fetchUserStats}
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
        <h3 className="text-lg font-medium text-gray-900">User Management</h3>
        <button
          onClick={() => router.push('/dashboard/admin/users')}
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Manage All →
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{stats.total_users}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-green-600">{stats.new_users_last_7_days}</p>
          <p className="text-sm text-gray-500">New (7 days)</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-red-600">{stats.pending_approvals}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
      </div>

      {/* User Distribution by Role */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Users by Role</h4>
        <div className="space-y-2">
          {Object.entries(stats.users_by_role)
            .sort(([,a], [,b]) => b - a) // Sort by count descending
            .map(([role, count]) => {
              const percentage = getRolePercentage(count, stats.total_users);
              return (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
                      {role}
                    </span>
                    <span className="text-sm text-gray-600">{count} users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{percentage}%</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Recent User Registrations */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Registrations</h4>
        {recentUsers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No recent registrations</p>
        ) : (
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">
                        {user.profile?.first_name?.[0] || user.username[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.profile?.first_name && user.profile?.last_name 
                        ? `${user.profile.first_name} ${user.profile.last_name}`
                        : user.username
                      }
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    {(user.profile?.institution || user.profile?.company_name) && (
                      <p className="text-xs text-gray-400 truncate">
                        {user.profile.institution || user.profile.company_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                  {!user.is_approved && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Items */}
      {(stats.pending_approvals > 0 || stats.locked_accounts > 0 || stats.users_requiring_verification > 0) && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Items Requiring Attention</h4>
          <div className="space-y-2">
            {stats.pending_approvals > 0 && (
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm text-yellow-800">
                  {stats.pending_approvals} user approval{stats.pending_approvals !== 1 ? 's' : ''} pending
                </span>
                <button
                  onClick={() => router.push('/dashboard/admin/approvals')}
                  className="text-xs text-yellow-700 hover:text-yellow-600 font-medium"
                >
                  Review →
                </button>
              </div>
            )}
            
            {stats.locked_accounts > 0 && (
              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-sm text-red-800">
                  {stats.locked_accounts} locked account{stats.locked_accounts !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => router.push('/dashboard/admin/users?is_locked=true')}
                  className="text-xs text-red-700 hover:text-red-600 font-medium"
                >
                  Manage →
                </button>
              </div>
            )}
            
            {stats.users_requiring_verification > 0 && (
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                <span className="text-sm text-orange-800">
                  {stats.users_requiring_verification} user{stats.users_requiring_verification !== 1 ? 's' : ''} need verification
                </span>
                <button
                  onClick={() => router.push('/dashboard/admin/users?verification_status=pending')}
                  className="text-xs text-orange-700 hover:text-orange-600 font-medium"
                >
                  Review →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-t pt-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/dashboard/admin/users')}
            className="text-sm text-blue-600 hover:text-blue-500 hover:bg-blue-50 p-2 rounded text-center border border-blue-200"
          >
            View All Users
          </button>
          <button
            onClick={() => router.push('/dashboard/admin/users/create')}
            className="text-sm text-green-600 hover:text-green-500 hover:bg-green-50 p-2 rounded text-center border border-green-200"
          >
            Add New User
          </button>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="border-t pt-4 mt-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-blue-600">{stats.active_users_today}</p>
            <p className="text-xs text-gray-500">Active Today</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-600">{stats.inactive_users}</p>
            <p className="text-xs text-gray-500">Inactive Users</p>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="border-t pt-2 mt-4">
        <p className="text-xs text-gray-400 text-center">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}