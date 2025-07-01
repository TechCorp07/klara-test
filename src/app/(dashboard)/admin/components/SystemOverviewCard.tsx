// src/app/(dashboard)/admin/components/SystemOverviewCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface SystemMetrics {
  total_users: number;
  active_sessions: number;
  pending_approvals: number;
  failed_logins_24h: number;
  emergency_access_events: number;
  system_uptime: string;
  database_health: 'healthy' | 'warning' | 'critical';
  last_backup: string;
}

export default function SystemOverviewCard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      const response = await apiClient.get('/api/admin/system-metrics/');
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">System Overview</h3>
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(metrics.database_health)}`}>
            {metrics.database_health.charAt(0).toUpperCase() + metrics.database_health.slice(1)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-semibold text-gray-900">{metrics.total_users.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Sessions</p>
            <p className="text-2xl font-semibold text-green-600">{metrics.active_sessions}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">System Uptime</p>
            <p className="text-sm font-medium text-gray-900">{metrics.system_uptime}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
            <p className="text-2xl font-semibold text-red-600">{metrics.pending_approvals}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Failed Logins (24h)</p>
            <p className="text-2xl font-semibold text-orange-600">{metrics.failed_logins_24h}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Last Backup</p>
            <p className="text-sm font-medium text-gray-900">{metrics.last_backup}</p>
          </div>
        </div>
      </div>

      {metrics.emergency_access_events > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>{metrics.emergency_access_events}</strong> emergency access events require review
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
}

export default function UserManagementCard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await apiClient.get('/api/admin/user-stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
          </div>
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

      <div className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">{stats.total_users}</p>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-green-600">{stats.recent_registrations}</p>
            <p className="text-sm text-gray-500">New (7 days)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-red-600">{stats.pending_approvals}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
        </div>

        {/* User Distribution by Role */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Users by Role</h4>
          <div className="space-y-2">
            {Object.entries(stats.users_by_role).map(([role, count]) => {
              const percentage = stats.total_users > 0 ? (count / stats.total_users) * 100 : 0;
              return (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{role}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Items */}
        {(stats.pending_approvals > 0 || stats.locked_accounts > 0 || stats.users_requiring_verification > 0) && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Action Required</h4>
            <div className="space-y-2">
              {stats.pending_approvals > 0 && (
                <button
                  onClick={() => router.push('/dashboard/admin/approvals')}
                  className="w-full text-left p-2 rounded bg-red-50 hover:bg-red-100 border border-red-200"
                >
                  <span className="text-sm text-red-700">
                    {stats.pending_approvals} users awaiting approval
                  </span>
                </button>
              )}
              {stats.locked_accounts > 0 && (
                <button
                  onClick={() => router.push('/dashboard/admin/users?filter=locked')}
                  className="w-full text-left p-2 rounded bg-orange-50 hover:bg-orange-100 border border-orange-200"
                >
                  <span className="text-sm text-orange-700">
                    {stats.locked_accounts} locked accounts
                  </span>
                </button>
              )}
              {stats.users_requiring_verification > 0 && (
                <button
                  onClick={() => router.push('/dashboard/admin/users?filter=verification')}
                  className="w-full text-left p-2 rounded bg-yellow-50 hover:bg-yellow-100 border border-yellow-200"
                >
                  <span className="text-sm text-yellow-700">
                    {stats.users_requiring_verification} users need verification
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// src/app/(dashboard)/admin/components/PendingApprovalsCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

interface PendingUser {
  id: number;
  username: string;
  email: string;
  role: string;
  date_joined: string;
  profile: {
    first_name: string;
    last_name: string;
    institution?: string;
    company_name?: string;
  };
}

export default function PendingApprovalsCard() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await apiClient.get('/api/admin/pending-approvals/?page_size=5');
      setPendingUsers(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (userId: number) => {
    setProcessingIds(prev => [...prev, userId]);
    try {
      await apiClient.post(`/api/admin/users/${userId}/approve/`);
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to approve user:', error);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== userId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {pendingUsers.length} pending
          </span>
          <button
            onClick={() => router.push('/dashboard/admin/approvals')}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View All →
          </button>
        </div>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="text-center py-6">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingUsers.map((user) => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.profile.first_name?.[0] || user.username[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.profile.first_name && user.profile.last_name 
                          ? `${user.profile.first_name} ${user.profile.last_name}`
                          : user.username
                        }
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="capitalize">{user.role}</span>
                        <span>•</span>
                        <span>{formatDate(user.date_joined)}</span>
                      </div>
                      {(user.profile.institution || user.profile.company_name) && (
                        <p className="text-xs text-gray-500 truncate">
                          {user.profile.institution || user.profile.company_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push(`/dashboard/admin/approvals?user=${user.id}`)}
                    className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleQuickApprove(user.id)}
                    disabled={processingIds.includes(user.id)}
                    className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded font-medium disabled:opacity-50"
                  >
                    {processingIds.includes(user.id) ? 'Approving...' : 'Quick Approve'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// src/app/(dashboard)/admin/components/SystemHealthCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical';
  services: {
    database: 'healthy' | 'warning' | 'critical';
    cache: 'healthy' | 'warning' | 'critical';
    email: 'healthy' | 'warning' | 'critical';
    storage: 'healthy' | 'warning' | 'critical';
    websockets: 'healthy' | 'warning' | 'critical';
  };
  metrics: {
    response_time: number;
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
  };
  last_updated: string;
}

export default function SystemHealthCard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemHealth();
    // Refresh every 60 seconds
    const interval = setInterval(fetchSystemHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const response = await apiClient.get('/api/admin/system-health/');
      setHealth(response.data);
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'critical':
        return (
          <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading || !health) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">System Health</h3>
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(health.overall_status)}`}>
          {getStatusIcon(health.overall_status)}
          <span className="ml-1 capitalize">{health.overall_status}</span>
        </div>
      </div>

      {/* Services Status */}
      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-medium text-gray-700">Services</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(health.services).map(([service, status]) => (
            <div key={service} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600 capitalize">{service}</span>
              <div className="flex items-center">
                {getStatusIcon(status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Performance Metrics</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Response Time</span>
            <span className="text-sm font-medium">{health.metrics.response_time}ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">CPU Usage</span>
            <span className="text-sm font-medium">{health.metrics.cpu_usage}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Memory Usage</span>
            <span className="text-sm font-medium">{health.metrics.memory_usage}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Disk Usage</span>
            <span className="text-sm font-medium">{health.metrics.disk_usage}%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(health.last_updated).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
