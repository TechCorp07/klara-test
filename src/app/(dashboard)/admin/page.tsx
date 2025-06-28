// src/app/(dashboard)/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { Spinner } from '@/components/ui/spinner';

interface AdminStats {
  total_users: number;
  pending_approvals: number;
  users_by_role: {
    patient: number;
    provider: number;
    caregiver: number;
    pharmco: number;
    researcher: number;
    compliance: number;
  };
  pending_caregiver_requests: number;
  unreviewed_emergency_access: number;
  recent_registrations: number;
  unverified_patients: number;
  system_alerts: number;
  active_users_today: number;
}

interface Activity {
  id: number;
  type: 'user_registration' | 'approval_needed' | 'system_alert' | 'emergency_access' | 'caregiver_request' | 'verification';
  description: string;
  date: string;
  priority?: 'high' | 'medium' | 'low';
  user_id?: number;
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    // In real implementation, this would call /api/users/admin/dashboard-stats/
    setTimeout(() => {
      const mockStats: AdminStats = {
        total_users: 328,
        pending_approvals: 7,
        users_by_role: {
          patient: 250,
          provider: 45,
          caregiver: 20,
          pharmco: 5,
          researcher: 6,
          compliance: 2
        },
        pending_caregiver_requests: 3,
        unreviewed_emergency_access: 1,
        recent_registrations: 8,
        unverified_patients: 12,
        system_alerts: 2,
        active_users_today: 156
      };

      const mockActivities: Activity[] = [
        {
          id: 1,
          type: 'emergency_access',
          description: 'Emergency access event requires review - Dr. Smith',
          date: '2024-01-15',
          priority: 'high',
          user_id: 123
        },
        {
          id: 2,
          type: 'approval_needed',
          description: '7 new user registrations awaiting approval',
          date: '2024-01-18',
          priority: 'high'
        },
        {
          id: 3,
          type: 'system_alert',
          description: 'Database backup completed successfully',
          date: '2024-01-19',
          priority: 'low'
        },
        {
          id: 4,
          type: 'verification',
          description: '5 patients approaching identity verification deadline',
          date: '2024-01-17',
          priority: 'medium'
        },
        {
          id: 5,
          type: 'user_registration',
          description: 'New healthcare provider registered: Dr. Jane Wilson',
          date: '2024-01-16',
          priority: 'medium'
        }
      ];

      setStats(mockStats);
      setActivities(mockActivities);
    }, 500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user?.first_name || 'Administrator'}`;
  };

  const handleBulkApproval = () => {
    console.log('Opening bulk approval interface...');
  };

  const handleEmergencyReview = () => {
    console.log('Opening emergency access review...');
  };

  const handleSystemSettings = () => {
    console.log('Opening system settings...');
  };

  if (isLoading || !user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getGreeting()}</h1>
        <p className="text-lg text-gray-600">System Administration Dashboard</p>
      </div>

      {stats && (
        <>
          {/* Critical Actions Alert */}
          {(stats.pending_approvals > 0 || stats.unreviewed_emergency_access > 0) && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Urgent Actions Required</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {stats.pending_approvals > 0 && (
                        <li>{stats.pending_approvals} user registrations awaiting approval</li>
                      )}
                      {stats.unreviewed_emergency_access > 0 && (
                        <li>{stats.unreviewed_emergency_access} emergency access events require review</li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    {stats.pending_approvals > 0 && (
                      <button onClick={handleBulkApproval} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        Review Approvals
                      </button>
                    )}
                    {stats.unreviewed_emergency_access > 0 && (
                      <button onClick={handleEmergencyReview} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        Review Emergency Access
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.total_users}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                <p className="mt-1 text-3xl font-semibold text-red-600">{stats.pending_approvals}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Active Today</p>
                <p className="mt-1 text-3xl font-semibold text-green-600">{stats.active_users_today}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">System Alerts</p>
                <p className="mt-1 text-3xl font-semibold text-orange-600">{stats.system_alerts}</p>
              </div>
            </div>
          </div>

          {/* User Distribution */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">User Distribution by Role</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats.users_by_role).map(([role, count]) => (
                <div key={role} className="bg-white rounded-lg shadow p-4 text-center">
                  <p className="text-sm font-medium text-gray-500 capitalize">{role}s</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Administrative Metrics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Administrative Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Caregiver Requests</p>
                <p className="mt-1 text-2xl font-semibold text-yellow-600">{stats.pending_caregiver_requests}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Recent Registrations</p>
                <p className="mt-1 text-2xl font-semibold text-blue-600">{stats.recent_registrations}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Unverified Patients</p>
                <p className="mt-1 text-2xl font-semibold text-orange-600">{stats.unverified_patients}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Emergency Access Reviews</p>
                <p className="mt-1 text-2xl font-semibold text-red-600">{stats.unreviewed_emergency_access}</p>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Administrative Activity</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
                      activity.priority === 'high' ? 'bg-red-100 text-red-600' :
                      activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type === 'user_registration' ? '👤' :
                       activity.type === 'approval_needed' ? '✋' :
                       activity.type === 'system_alert' ? '⚠️' :
                       activity.type === 'emergency_access' ? '🚨' :
                       activity.type === 'caregiver_request' ? '👥' :
                       activity.type === 'verification' ? '🔒' : '📋'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                  <div>
                    <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                      {activity.type === 'approval_needed' ? 'Review' :
                       activity.type === 'emergency_access' ? 'Investigate' :
                       'View'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Administrative Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={handleBulkApproval}
            className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            <p className="mt-1 text-sm text-gray-500">Manage users, permissions, and account statuses</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Approval Queue</h3>
            <p className="mt-1 text-sm text-gray-500">Review and approve pending user registrations</p>
          </button>
          <button 
            onClick={handleSystemSettings}
            className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
            <p className="mt-1 text-sm text-gray-500">Configure platform settings and preferences</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Audit Logs</h3>
            <p className="mt-1 text-sm text-gray-500">View system activity and security logs</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Reports & Analytics</h3>
            <p className="mt-1 text-sm text-gray-500">Generate usage reports and system analytics</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">HIPAA Documents</h3>
            <p className="mt-1 text-sm text-gray-500">Manage privacy notices and compliance documents</p>
          </button>
        </div>
      </div>
    </div>
  );
}