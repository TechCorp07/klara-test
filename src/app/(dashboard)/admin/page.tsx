// src/app/(dashboard)/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/lib/auth/use-auth';
import { apiClient } from '@/lib/api/client';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface DashboardData {
  user_stats: {
    total_users: number;
    pending_approvals: number;
    active_sessions: number;
    new_users_today: number;
  };
  recent_activities: Array<{
    id: number;
    type: string;
    description: string;
    timestamp: string;
    user_email?: string;
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
  const { user } = useAuth();
  const { permissions } = usePermissions();
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check permissions
  const canViewDashboard = permissions?.has_admin_access || false;
  
  useEffect(() => {
    // Redirect if not admin
    if (permissions && !canViewDashboard) {
      router.push('/dashboard');
      return;
    }

    if (canViewDashboard) {
      fetchDashboardData();
    }
  }, [canViewDashboard, permissions, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get('/admin/dashboard-overview/');
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      
      if (error.response?.status === 403) {
        setError('You do not have permission to view the admin dashboard.');
      } else if (error.response?.status === 404) {
        setError('Admin dashboard endpoint not found. Please check backend configuration.');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking permissions
  if (!permissions || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading admin dashboard...</span>
      </div>
    );
  }

  // Show error if no permission
  if (!canViewDashboard) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Access Denied
          </h3>
          <p className="text-red-700">
            You do not have permission to view the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">System overview and management</p>
        </div>

        {dashboardData && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {dashboardData.user_stats.total_users}
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-600">Pending Approvals</h3>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  {dashboardData.user_stats.pending_approvals}
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-600">Active Sessions</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {dashboardData.user_stats.active_sessions}
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-600">New Users Today</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {dashboardData.user_stats.new_users_today}
                </p>
              </Card>
            </div>

            {/* System Status */}
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Overall Health</p>
                  <p className={`text-lg font-semibold ${
                    dashboardData.system_status.overall_health === 'healthy' ? 'text-green-600' :
                    dashboardData.system_status.overall_health === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {dashboardData.system_status.overall_health.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-lg font-semibold">
                    {dashboardData.system_status.uptime_percentage}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className="text-lg font-semibold">
                    {dashboardData.system_status.response_time}ms
                  </p>
                </div>
              </div>
            </Card>

            {/* Recent Activities */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activities</h2>
              <div className="space-y-3">
                {dashboardData.recent_activities.map((activity) => (
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
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminGuard>
  );
}