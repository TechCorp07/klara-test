// src/app/(dashboard)/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import SystemOverviewCard from './components/SystemOverviewCard';
import UserManagementCard from './components/UserManagementCard';
import PendingApprovalsCard from './components/PendingApprovalsCard';
import SystemHealthCard from './components/SystemHealthCard';
import DashboardStats from './common/DashboardStats';

interface DashboardData {
  quick_stats: {
    total_users: number;
    pending_approvals: number;
    active_users_today: number;
    system_alerts: number;
    emergency_access_events: number;
    failed_logins_24h: number;
  };
  recent_activities: Array<{
    id: string;
    type: 'user_registration' | 'user_approval' | 'security_alert' | 'emergency_access' | 'system_update';
    description: string;
    timestamp: string;
    user?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, unknown>;
  }>;
  system_status: {
    overall_health: 'healthy' | 'warning' | 'critical';
    uptime_percentage: number;
    response_time: number;
    active_sessions: number;
  };
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboardInterface />
    </AdminGuard>
  );
}

function AdminDashboardInterface() {
  const { permissions } = usePermissions();
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Permission checks
  const canViewDashboard = permissions?.has_admin_access || false;
  const canManageUsers = permissions?.has_user_management_access || false;
  const canViewReports = permissions?.has_admin_access || false;
  const canManageSystem = permissions?.has_system_settings_access || false;
  const canViewAudit = permissions?.has_audit_access || false;

  useEffect(() => {
    if (canViewDashboard) {
      fetchDashboardData();
      // Refresh data every 5 minutes
      const interval = setInterval(fetchDashboardData, 300000);
      return () => clearInterval(interval);
    }
  }, [canViewDashboard]);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/admin/dashboard-overview/');
      setDashboardData(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'user_management':
        router.push('/dashboard/admin/users');
        break;
      case 'approval_queue':
        router.push('/dashboard/admin/approvals');
        break;
      case 'system_settings':
        router.push('/dashboard/admin/system-settings');
        break;
      case 'audit_logs':
        router.push('/dashboard/admin/audit-logs');
        break;
      case 'reports':
        router.push('/dashboard/admin/reports');
        break;
      case 'monitoring':
        router.push('/dashboard/admin/monitoring');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return '👤';
      case 'user_approval':
        return '✅';
      case 'security_alert':
        return '🚨';
      case 'emergency_access':
        return '🆘';
      case 'system_update':
        return '🔧';
      default:
        return '📋';
    }
  };

  const getActivityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!canViewDashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">🚫 Administrative Access Required</h3>
          <p className="mb-4">This dashboard requires administrative privileges.</p>
          <p className="text-sm">Contact your system administrator for access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          System overview, user management, and administrative controls
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Dashboard Stats */}
      <div className="mb-8">
        <DashboardStats />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* System Overview */}
        <SystemOverviewCard />
        
        {/* User Management */}
        <UserManagementCard />
        
        {/* System Health */}
        <SystemHealthCard />
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Pending Approvals */}
        <PendingApprovalsCard />

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <button 
              onClick={() => handleQuickAction('monitoring')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View All →
            </button>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : dashboardData?.recent_activities && dashboardData.recent_activities.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recent_activities.slice(0, 8).map((activity) => (
                <div 
                  key={activity.id} 
                  className={`border-l-4 p-3 rounded ${getActivityColor(activity.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                          {activity.user && (
                            <>
                              <span className="text-xs text-gray-300">•</span>
                              <p className="text-xs text-gray-500">{activity.user}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {activity.severity && activity.severity !== 'low' && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activity.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        activity.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.severity}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Administrative Tools */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Administrative Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* User Management */}
          {canManageUsers && (
            <button 
              onClick={() => handleQuickAction('user_management')}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors group"
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">👥</span>
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
              </div>
              <p className="text-sm text-gray-500">Manage users, permissions, and account statuses</p>
              <div className="mt-2 text-xs text-blue-600 group-hover:text-blue-700">
                View all users →
              </div>
            </button>
          )}

          {/* Approval Queue */}
          <button 
            onClick={() => handleQuickAction('approval_queue')}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors group"
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">✅</span>
              <h3 className="text-lg font-medium text-gray-900">Approval Queue</h3>
            </div>
            <p className="text-sm text-gray-500">Review and approve pending user registrations</p>
            {(dashboardData?.quick_stats.pending_approvals ?? 0) > 0 && (
              <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {dashboardData?.quick_stats.pending_approvals} pending
              </div>
            )}
          </button>

          {/* System Settings */}
          {canManageSystem && (
            <button 
              onClick={() => handleQuickAction('system_settings')}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors group"
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">⚙️</span>
                <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
              </div>
              <p className="text-sm text-gray-500">Configure platform settings and preferences</p>
              <div className="mt-2 text-xs text-blue-600 group-hover:text-blue-700">
                Manage settings →
              </div>
            </button>
          )}

          {/* Audit Logs */}
          {canViewAudit && (
            <button 
              onClick={() => handleQuickAction('audit_logs')}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors group"
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">📋</span>
                <h3 className="text-lg font-medium text-gray-900">Audit Logs</h3>
              </div>
              <p className="text-sm text-gray-500">View system activity and security logs</p>
              <div className="mt-2 text-xs text-blue-600 group-hover:text-blue-700">
                View logs →
              </div>
            </button>
          )}

          {/* Reports & Analytics */}
          {canViewReports && (
            <button 
              onClick={() => handleQuickAction('reports')}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors group"
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">📊</span>
                <h3 className="text-lg font-medium text-gray-900">Reports & Analytics</h3>
              </div>
              <p className="text-sm text-gray-500">Generate usage reports and system analytics</p>
              <div className="mt-2 text-xs text-blue-600 group-hover:text-blue-700">
                View reports →
              </div>
            </button>
          )}

          {/* System Monitoring */}
          <button 
            onClick={() => handleQuickAction('monitoring')}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors group"
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">📈</span>
              <h3 className="text-lg font-medium text-gray-900">System Monitoring</h3>
            </div>
            <p className="text-sm text-gray-500">Real-time alerts and performance monitoring</p>
            {(dashboardData?.quick_stats?.system_alerts ?? 0) > 0 && (
              <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {dashboardData?.quick_stats?.system_alerts ?? 0} alerts
              </div>
            )}
          </button>

          {/* HIPAA Documents */}
          {canManageSystem && (
            <button className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors group">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">🏥</span>
                <h3 className="text-lg font-medium text-gray-900">HIPAA Documents</h3>
              </div>
              <p className="text-sm text-gray-500">Manage privacy notices and compliance documents</p>
              <div className="mt-2 text-xs text-blue-600 group-hover:text-blue-700">
                Manage documents →
              </div>
            </button>
          )}

          {/* Emergency Access */}
          {canViewAudit && (
            <button className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors group">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">🆘</span>
                <h3 className="text-lg font-medium text-gray-900">Emergency Access</h3>
              </div>
              <p className="text-sm text-gray-500">Review emergency access requests and logs</p>
              {(dashboardData?.quick_stats?.emergency_access_events ?? 0) > 0 && (
                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {dashboardData?.quick_stats?.emergency_access_events ?? 0} pending
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* System Status Footer */}
      {dashboardData?.system_status && (
        <div className="mt-8 bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${
                  dashboardData.system_status.overall_health === 'healthy' ? 'bg-green-500' :
                  dashboardData.system_status.overall_health === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium text-gray-900">
                  System Status: {dashboardData.system_status.overall_health === 'healthy' ? 'Operational' : 'Issues Detected'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Uptime: {dashboardData.system_status.uptime_percentage}%
              </div>
              <div className="text-sm text-gray-500">
                Response: {dashboardData.system_status.response_time}ms
              </div>
              <div className="text-sm text-gray-500">
                Active Sessions: {dashboardData.system_status.active_sessions}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
