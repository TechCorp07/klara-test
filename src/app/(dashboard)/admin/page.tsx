// src/app/(dashboard)/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { PermissionBasedLayout } from '@/app/(dashboard)/_shared/layouts/PermissionBasedLayout';
import { PermissionAwareDashboard } from '@/components/dashboard/PermissionAwareDashboard';

interface AdminDashboardData {
  user_stats: {
    total_users: number;
    pending_approvals: number;
    active_sessions: number;
    new_users_today: number;
    users_by_role: Record<string, number>;
  };
  system_status: {
    overall_health: 'healthy' | 'warning' | 'critical';
    uptime_percentage: number;
    response_time: number;
    active_connections: number;
  };
  security_metrics: {
    failed_login_attempts_today: number;
    locked_accounts: number;
    emergency_access_events: number;
  };
  compliance_status: {
    audit_logs_count: number;
    data_retention_status: 'compliant' | 'warning' | 'non_compliant';
    last_backup: string;
  };
  recent_activities: Array<{
    id: string;
    description: string;
    user_email?: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'user' | 'system' | 'security' | 'compliance';
  }>;
}

/**
 * Phase 2: Permission-Based Admin Dashboard
 * This replaces the old admin page with a permission-aware system
 */
export default function AdminDashboardPage() {
  const { hasPermission, user, getUserRole } = useAuth();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasPermission('can_access_admin')) {
      fetchAdminDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [hasPermission]);

  const fetchAdminDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In production, this would be an actual API call
      // For now, we'll simulate data based on permissions
      const mockData: AdminDashboardData = {
        user_stats: {
          total_users: 1247,
          pending_approvals: 8,
          active_sessions: 34,
          new_users_today: 5,
          users_by_role: {
            admin: 12,
            patient: 892,
            provider: 156,
            researcher: 45,
            caregiver: 89,
            pharmco: 23,
            compliance: 8
          }
        },
        system_status: {
          overall_health: 'healthy',
          uptime_percentage: 99.8,
          response_time: 120,
          active_connections: 234
        },
        security_metrics: {
          failed_login_attempts_today: 3,
          locked_accounts: 0,
          emergency_access_events: 2
        },
        compliance_status: {
          audit_logs_count: 15420,
          data_retention_status: 'compliant',
          last_backup: new Date(Date.now() - 3600000).toISOString()
        },
        recent_activities: [
          {
            id: '1',
            description: 'New user registration pending approval',
            user_email: 'new.user@example.com',
            timestamp: new Date().toISOString(),
            severity: 'medium',
            category: 'user'
          },
          {
            id: '2',
            description: 'System backup completed successfully',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            severity: 'low',
            category: 'system'
          },
          {
            id: '3',
            description: 'Emergency access granted to Dr. Smith',
            user_email: 'dr.smith@example.com',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            severity: 'high',
            category: 'security'
          },
          {
            id: '4',
            description: 'Audit log archival completed',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            severity: 'low',
            category: 'compliance'
          }
        ]
      };

      setDashboardData(mockData);
    } catch (err) {
      setError('Failed to load admin dashboard data');
      console.error('Admin dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom admin-specific widgets
  const adminWidgets = [
    {
      id: 'user-breakdown',
      title: 'User Breakdown by Role',
      permission: 'can_manage_users',
      size: 'large' as const,
      priority: 1,
      content: (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {dashboardData && Object.entries(dashboardData.user_stats.users_by_role).map(([role, count]) => (
                <div key={role} className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{role}s</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    
    {
      id: 'security-overview',
      title: 'Security Overview',
      permission: 'can_access_admin',
      size: 'medium' as const,
      priority: 2,
      content: (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Metrics</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Failed Logins Today</span>
                <span className={`font-semibold ${
                  (dashboardData?.security_metrics.failed_login_attempts_today || 0) > 10 
                    ? 'text-red-600' : 'text-green-600'
                }`}>
                  {dashboardData?.security_metrics.failed_login_attempts_today || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Locked Accounts</span>
                <span className={`font-semibold ${
                  (dashboardData?.security_metrics.locked_accounts || 0) > 0 
                    ? 'text-red-600' : 'text-green-600'
                }`}>
                  {dashboardData?.security_metrics.locked_accounts || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Emergency Access Events</span>
                <span className={`font-semibold ${
                  (dashboardData?.security_metrics.emergency_access_events || 0) > 5 
                    ? 'text-orange-600' : 'text-blue-600'
                }`}>
                  {dashboardData?.security_metrics.emergency_access_events || 0}
                </span>
              </div>
            </div>
          )}
        </div>
      )
    },

    {
      id: 'quick-actions',
      title: 'Quick Actions',
      size: 'medium' as const,
      priority: 8,
      content: (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <PermissionGate requiredPermission="can_manage_users">
              <a
                href="/admin/users/create"
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                + Create New User
              </a>
            </PermissionGate>
            
            <PermissionGate requiredPermission="can_manage_users">
              <a
                href="/admin/approvals"
                className="block w-full bg-orange-600 text-white text-center py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
              >
                📋 Review Approvals ({dashboardData?.user_stats.pending_approvals || 0})
              </a>
            </PermissionGate>
            
            <PermissionGate requiredPermission="can_access_admin">
              <a
                href="/admin/reports"
                className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                📊 Generate Report
              </a>
            </PermissionGate>
            
            <PermissionGate requiredPermission="can_emergency_access">
              <a
                href="/admin/emergency"
                className="block w-full bg-red-600 text-white text-center py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                🚨 Emergency Access
              </a>
            </PermissionGate>
          </div>
        </div>
      )
    }
  ];

  // Header actions for the layout
  const headerActions = (
    <div className="flex items-center space-x-4">
      <PermissionGate requiredPermission="can_manage_users">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          {dashboardData?.user_stats.pending_approvals || 0} pending approvals
        </span>
      </PermissionGate>
      
      <PermissionGate requiredPermission="can_access_admin">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          dashboardData?.system_status.overall_health === 'healthy' 
            ? 'bg-green-100 text-green-800'
            : dashboardData?.system_status.overall_health === 'warning'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          System: {dashboardData?.system_status.overall_health || 'unknown'}
        </span>
      </PermissionGate>
    </div>
  );

  // Check if user has any admin permissions
  const hasAnyAdminPermission = hasPermission('can_access_admin') || 
                                hasPermission('can_manage_users') || 
                                hasPermission('can_emergency_access');

  if (!hasAnyAdminPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the admin dashboard.
          </p>
          <p className="text-sm text-gray-500">
            Current role: {getUserRole()} | User: {user?.email}
          </p>
          <a
            href={`/${getUserRole()}`}
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Your Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <PermissionBasedLayout
      title="Admin Dashboard"
      headerActions={headerActions}
    >
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              System overview and management tools
            </p>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={fetchAdminDashboardData}
            disabled={isLoading}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            {isLoading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Dashboard Error</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchAdminDashboardData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Dashboard - Permission-Aware */}
        <PermissionAwareDashboard
          customWidgets={adminWidgets}
          showDefaultWidgets={true}
          layout="grid"
          maxColumns={4}
        />

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities - Filtered by Permission */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {dashboardData?.recent_activities
                  .filter(activity => {
                    // Filter activities based on permissions
                    if (activity.category === 'user' && !hasPermission('can_manage_users')) return false;
                    if (activity.category === 'system' && !hasPermission('can_access_admin')) return false;
                    if (activity.category === 'security' && !hasPermission('can_access_admin')) return false;
                    if (activity.category === 'compliance' && !hasPermission('can_access_admin')) return false;
                    return true;
                  })
                  .map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        {activity.user_email && (
                          <p className="text-sm text-gray-600">User: {activity.user_email}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        activity.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.severity}
                      </span>
                    </div>
                  )) || (
                  <p className="text-gray-500 text-center py-4">No recent activities</p>
                )}
              </div>
            )}
          </div>

          {/* System Information */}
          <PermissionGate requiredPermission="can_access_admin">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-6 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Health Status</span>
                    <span className={`font-semibold ${
                      dashboardData?.system_status.overall_health === 'healthy' ? 'text-green-600' :
                      dashboardData?.system_status.overall_health === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {dashboardData?.system_status.overall_health?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="font-semibold text-green-600">
                      {dashboardData?.system_status.uptime_percentage || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="font-semibold text-blue-600">
                      {dashboardData?.system_status.response_time || 0}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Connections</span>
                    <span className="font-semibold text-purple-600">
                      {dashboardData?.system_status.active_connections || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Backup</span>
                    <span className="font-semibold text-gray-900">
                      {dashboardData?.compliance_status.last_backup 
                        ? new Date(dashboardData.compliance_status.last_backup).toLocaleString()
                        : 'Unknown'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </PermissionGate>
        </div>
      </div>
    </PermissionBasedLayout>
  );
}