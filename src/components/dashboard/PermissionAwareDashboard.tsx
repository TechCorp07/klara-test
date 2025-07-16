// src/components/dashboard/PermissionAwareDashboard.tsx
'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { PermissionGate } from '@/components/permissions/PermissionGate';

interface DashboardWidget {
  id: string;
  title: string;
  content: ReactNode;
  permission?: string;
  size: 'small' | 'medium' | 'large' | 'full';
  priority: number;
}

interface DashboardStats {
  // Admin stats
  total_users?: number;
  pending_approvals?: number;
  active_sessions?: number;
  new_users_today?: number;
  
  // Patient data stats
  total_patients?: number;
  active_patients?: number;
  
  // Research stats
  active_studies?: number;
  enrolled_participants?: number;
  
  // System metrics
  system_health?: 'healthy' | 'warning' | 'critical';
  uptime_percentage?: number;
  response_time?: number;
  
  // Emergency access
  emergency_events?: number;
  
  // Activities
  recent_activities?: Array<{
    id: string;
    description: string;
    timestamp: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    user_email?: string;
  }>;
}

interface PermissionAwareDashboardProps {
  customWidgets?: DashboardWidget[];
  showDefaultWidgets?: boolean;
  layout?: 'grid' | 'flex';
  maxColumns?: number;
}

/**
 * Clean dashboard component that renders widgets based on user permissions
 */
export function PermissionAwareDashboard({
  customWidgets = [],
  showDefaultWidgets = true,
  layout = 'grid',
  maxColumns = 4
}: PermissionAwareDashboardProps) {
  const { hasPermission, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call with mock data based on permissions
      const mockStats: DashboardStats = {
        // Only include stats user has permission to see
        ...(hasPermission('can_manage_users') && {
          total_users: 1247,
          pending_approvals: 8,
          active_sessions: 34,
          new_users_today: 5
        }),
        
        ...(hasPermission('can_access_patient_data') && {
          total_patients: 892,
          active_patients: 234
        }),
        
        ...(hasPermission('can_access_research_data') && {
          active_studies: 12,
          enrolled_participants: 456
        }),
        
        ...(hasPermission('can_access_admin') && {
          system_health: 'healthy' as const,
          uptime_percentage: 99.8,
          response_time: 120
        }),
        
        ...(hasPermission('can_emergency_access') && {
          emergency_events: 2
        }),
        
        recent_activities: [
          {
            id: '1',
            description: 'New user registration pending approval',
            timestamp: new Date().toISOString(),
            severity: 'medium' as const,
            user_email: 'new.user@example.com'
          },
          {
            id: '2',
            description: 'System backup completed successfully',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            severity: 'low' as const
          }
        ].filter(activity => {
          // Filter activities based on permissions
          if (activity.description.includes('user') && !hasPermission('can_manage_users')) {
            return false;
          }
          if (activity.description.includes('system') && !hasPermission('can_access_admin')) {
            return false;
          }
          return true;
        })
      };

      setStats(mockStats);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error('Dashboard stats error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Define default widgets
  const defaultWidgets: DashboardWidget[] = [
    // User Management Widget
    {
      id: 'total-users',
      title: 'Total Users',
      permission: 'can_manage_users',
      size: 'small',
      priority: 1,
      content: (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-blue-600">
                {isLoading ? '...' : stats?.total_users || 0}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>
      )
    },
    
    // Pending Approvals Widget
    {
      id: 'pending-approvals',
      title: 'Pending Approvals',
      permission: 'can_manage_users',
      size: 'small',
      priority: 2,
      content: (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-orange-600">
                {isLoading ? '...' : stats?.pending_approvals || 0}
              </p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
          {!isLoading && stats?.pending_approvals && stats.pending_approvals > 0 && (
            <div className="mt-2">
              <a
                href="/admin/approvals"
                className="text-sm text-orange-600 hover:text-orange-800 font-medium"
              >
                Review now →
              </a>
            </div>
          )}
        </div>
      )
    },

    // Patient Overview Widget
    {
      id: 'patient-overview',
      title: 'Patient Overview',
      permission: 'can_access_patient_data',
      size: 'medium',
      priority: 3,
      content: (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-green-600">
                {isLoading ? '...' : stats?.total_patients || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Patients</p>
              <p className="text-2xl font-bold text-blue-600">
                {isLoading ? '...' : stats?.active_patients || 0}
              </p>
            </div>
          </div>
        </div>
      )
    },

    // System Health Widget
    {
      id: 'system-health',
      title: 'System Health',
      permission: 'can_access_admin',
      size: 'large',
      priority: 4,
      content: (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`text-lg font-semibold ${
                stats?.system_health === 'healthy' ? 'text-green-600' :
                stats?.system_health === 'warning' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {isLoading ? '...' : stats?.system_health?.toUpperCase() || 'UNKNOWN'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-lg font-semibold text-blue-600">
                {isLoading ? '...' : `${stats?.uptime_percentage || 0}%`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Response Time</p>
              <p className="text-lg font-semibold text-green-600">
                {isLoading ? '...' : `${stats?.response_time || 0}ms`}
              </p>
            </div>
          </div>
        </div>
      )
    },

    // Emergency Access Widget
    {
      id: 'emergency-access',
      title: 'Emergency Access',
      permission: 'can_emergency_access',
      size: 'small',
      priority: 5,
      content: (
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emergency Events</p>
              <p className="text-3xl font-bold text-red-600">
                {isLoading ? '...' : stats?.emergency_events || 0}
              </p>
            </div>
            <div className="text-4xl">🚨</div>
          </div>
          <div className="mt-2">
            <a
              href="/admin/emergency"
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Manage Emergency Access →
            </a>
          </div>
        </div>
      )
    },

    // Recent Activities Widget
    {
      id: 'recent-activities',
      title: 'Recent Activities',
      size: 'full',
      priority: 6,
      content: (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.recent_activities?.length ? (
                stats.recent_activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 py-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      {activity.user_email && (
                        <p className="text-sm text-gray-600">User: {activity.user_email}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {activity.severity && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        activity.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.severity}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activities</p>
              )}
            </div>
          )}
        </div>
      )
    }
  ];

  // Combine and filter widgets based on permissions
  const allWidgets = showDefaultWidgets 
    ? [...defaultWidgets, ...customWidgets]
    : customWidgets;

  const visibleWidgets = allWidgets
    .filter(widget => !widget.permission || hasPermission(widget.permission))
    .sort((a, b) => a.priority - b.priority);

  const getWidgetGridClass = (size: DashboardWidget['size']) => {
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'medium':
        return 'col-span-1 md:col-span-2';
      case 'large':
        return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 'full':
        return 'col-span-full';
      default:
        return 'col-span-1';
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">Dashboard Error</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchDashboardStats}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600">
            Welcome back, {user?.first_name || user?.username}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Widgets Grid */}
      <div className={`grid grid-cols-1 ${maxColumns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : `md:grid-cols-${maxColumns}`} gap-6`}>
        {visibleWidgets.map((widget) => (
          <div key={widget.id} className={getWidgetGridClass(widget.size)}>
            <PermissionGate requiredPermission={widget.permission}>
              {widget.content}
            </PermissionGate>
          </div>
        ))}
      </div>

      {/* No Widgets Message */}
      {visibleWidgets.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Dashboard Widgets Available</h3>
          <p className="text-gray-600">
            You don't have permissions to view any dashboard widgets. Contact your administrator if you believe this is an error.
          </p>
        </div>
      )}
    </div>
  );
}

export default PermissionAwareDashboard;