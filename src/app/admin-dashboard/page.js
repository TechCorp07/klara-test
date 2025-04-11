"use client";

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/lib/services/auditService';
import { healthcare } from '@/lib/services/healthcareService';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Fetch system stats
  const { data: systemStats } = useQuery({
    queryKey: ['systemStats'],
    queryFn: () => auditService.getSystemStats(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load system statistics');
      console.error('Error fetching system stats:', error);
    }
  });
  
  // Fetch pending approvals
  const { data: pendingApprovals } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => healthcare.getPendingApprovals(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load pending approvals');
      console.error('Error fetching pending approvals:', error);
    }
  });
  
  // Fetch recent users
  const { data: recentUsers } = useQuery({
    queryKey: ['recentUsers'],
    queryFn: () => auditService.getRecentUsers(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load recent users');
      console.error('Error fetching recent users:', error);
    }
  });
  
  // Fetch system alerts
  const { data: systemAlerts } = useQuery({
    queryKey: ['systemAlerts'],
    queryFn: () => auditService.getSystemAlerts(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load system alerts');
      console.error('Error fetching system alerts:', error);
    }
  });
  
  // Redirect if user is not an admin
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'superadmin') {
      window.location.href = '/dashboard';
    }
  }, [user]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.first_name || 'Administrator'}!</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-blue-600">
            {systemStats?.total_users || 0}
          </p>
          <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm">
            Manage users →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Pending Approvals</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {pendingApprovals?.total_count || 0}
          </p>
          <Link href="/admin/approvals" className="text-blue-600 hover:text-blue-800 text-sm">
            Review →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">System Alerts</h2>
          <p className="text-3xl font-bold text-red-600">
            {systemAlerts?.total_count || 0}
          </p>
          <Link href="/admin/alerts" className="text-blue-600 hover:text-blue-800 text-sm">
            View alerts →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">System Health</h2>
          <p className="text-3xl font-bold text-green-600">
            {systemStats?.system_health || 0}%
          </p>
          <Link href="/admin/system" className="text-blue-600 hover:text-blue-800 text-sm">
            View details →
          </Link>
        </div>
      </div>
      
      {/* Pending Approvals and System Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Pending Approvals</h2>
            <Link href="/admin/approvals" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          {pendingApprovals && pendingApprovals.results && pendingApprovals.results.length > 0 ? (
            <div className="space-y-4">
              {pendingApprovals.results.slice(0, 5).map((approval) => (
                <div key={approval.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{approval.type.charAt(0).toUpperCase() + approval.type.slice(1)} Approval</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      approval.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : approval.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Requested by: {approval.requested_by}</p>
                  <p className="text-sm text-gray-600">Date: {new Date(approval.requested_at).toLocaleDateString()}</p>
                  <div className="flex justify-end mt-1 space-x-2">
                    <button className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded">
                      Approve
                    </button>
                    <button className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending approvals.</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">System Alerts</h2>
            <Link href="/admin/alerts" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          {systemAlerts && systemAlerts.results && systemAlerts.results.length > 0 ? (
            <div className="space-y-4">
              {systemAlerts.results.slice(0, 5).map((alert) => (
                <div key={alert.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{alert.title}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.severity === 'critical' 
                        ? 'bg-red-100 text-red-800' 
                        : alert.severity === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  <p className="text-sm text-gray-600">Time: {new Date(alert.created_at).toLocaleString()}</p>
                  <div className="flex justify-end mt-1">
                    <button className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No system alerts.</p>
          )}
        </div>
      </div>
      
      {/* Recent Users and System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Users</h2>
            <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          {recentUsers && recentUsers.results && recentUsers.results.length > 0 ? (
            <div className="space-y-4">
              {recentUsers.results.slice(0, 5).map((user) => (
                <div key={user.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : user.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Email: {user.email}</p>
                  <p className="text-sm text-gray-600">Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                  <p className="text-sm text-gray-600">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent users.</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">System Health</h2>
            <Link href="/admin/system" className="text-blue-600 hover:text-blue-800 text-sm">View details</Link>
          </div>
          
          {systemStats && systemStats.system_metrics ? (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium">API Server</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    systemStats.system_metrics.api_health > 90 
                      ? 'bg-green-100 text-green-800' 
                      : systemStats.system_metrics.api_health > 70
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {systemStats.system_metrics.api_health}% Healthy
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${systemStats.system_metrics.api_health}%` }}></div>
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Database</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    systemStats.system_metrics.db_health > 90 
                      ? 'bg-green-100 text-green-800' 
                      : systemStats.system_metrics.db_health > 70
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {systemStats.system_metrics.db_health}% Healthy
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${systemStats.system_metrics.db_health}%` }}></div>
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Storage</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    systemStats.system_metrics.storage_usage < 70 
                      ? 'bg-green-100 text-green-800' 
                      : systemStats.system_metrics.storage_usage < 90
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {systemStats.system_metrics.storage_usage}% Used
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: `${systemStats.system_metrics.storage_usage}%` }}></div>
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Memory</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    systemStats.system_metrics.memory_usage < 70 
                      ? 'bg-green-100 text-green-800' 
                      : systemStats.system_metrics.memory_usage < 90
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {systemStats.system_metrics.memory_usage}% Used
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${systemStats.system_metrics.memory_usage}%` }}></div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No system health data available.</p>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/users/new" className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Add User</span>
            </div>
          </Link>
          
          <Link href="/admin/system/backup" className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Backup System</span>
            </div>
          </Link>
          
          <Link href="/admin/reports" className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Generate Reports</span>
            </div>
          </Link>
          
          <Link href="/admin/settings" className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>System Settings</span>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Admin Resources */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Admin Resources</h2>
          <Link href="/admin/resources" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">User Management</h3>
            <p className="text-sm text-gray-600 mb-2">
              Manage users, roles, and permissions.
            </p>
            <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm">
              Manage users →
            </Link>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">System Logs</h3>
            <p className="text-sm text-gray-600 mb-2">
              View system logs and audit trails.
            </p>
            <Link href="/admin/logs" className="text-blue-600 hover:text-blue-800 text-sm">
              View logs →
            </Link>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Configuration</h3>
            <p className="text-sm text-gray-600 mb-2">
              Configure system settings and preferences.
            </p>
            <Link href="/admin/configuration" className="text-blue-600 hover:text-blue-800 text-sm">
              Configure →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
