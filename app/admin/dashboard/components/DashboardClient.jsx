"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { StatsCard, DataPanel, QuickActionButton } from '@/components/dashboard/DashboardComponents';
import Link from 'next/link';

import DashboardLayout from '@/components/dashboard/DashboardLayout';

// SVG icons for quick actions
const UserIcon = () => (
  <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const BackupIcon = () => (
  <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const ReportIcon = () => (
  <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);


/**
 * Enhanced dashboard component with admin functionality
 * - System statistics overview
 * - User management 
 * - Pending approvals
 * - Audit logs
 * - System settings
 */
export default function DashboardClient() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Fetch admin dashboard data
    const fetchAdminData = async () => {
      try {
        // This would be replaced with actual API calls
        setTimeout(() => {
          setPendingUsers([
            {
              id: 101,
              name: 'John Smith',
              email: 'john.smith@example.com',
              role: 'patient',
              registration_date: '2023-04-10T14:30:00Z',
              status: 'pending'
            },
            {
              id: 102,
              name: 'Emily Johnson',
              email: 'emily.johnson@example.com',
              role: 'provider',
              registration_date: '2023-04-11T09:15:00Z',
              status: 'pending'
            },
            {
              id: 103,
              name: 'Michael Brown',
              email: 'michael.brown@example.com',
              role: 'pharmco',
              registration_date: '2023-04-12T16:45:00Z',
              status: 'pending'
            }
          ]);
          
          setActiveUsers([
            {
              id: 1,
              name: 'Dr. Sarah Smith',
              email: 'sarah.smith@example.com',
              role: 'provider',
              registration_date: '2023-01-15T10:00:00Z',
              last_login: '2023-04-14T08:30:00Z',
              status: 'active'
            },
            {
              id: 2,
              name: 'Robert Williams',
              email: 'robert.williams@example.com',
              role: 'patient',
              registration_date: '2023-02-20T14:30:00Z',
              last_login: '2023-04-13T11:45:00Z',
              status: 'active'
            },
            {
              id: 3,
              name: 'Lisa Chen',
              email: 'lisa.chen@example.com',
              role: 'provider',
              registration_date: '2023-01-10T09:15:00Z',
              last_login: '2023-04-15T09:30:00Z',
              status: 'active'
            },
            {
              id: 4,
              name: 'James Johnson',
              email: 'james.johnson@example.com',
              role: 'patient',
              registration_date: '2023-03-05T11:30:00Z',
              last_login: '2023-04-12T15:20:00Z',
              status: 'active'
            },
            {
              id: 5,
              name: 'Maria Garcia',
              email: 'maria.garcia@example.com',
              role: 'pharmco',
              registration_date: '2023-02-15T13:45:00Z',
              last_login: '2023-04-14T10:15:00Z',
              status: 'active'
            }
          ]);
          
          setSystemStats({
            total_users: 156,
            active_users_today: 42,
            new_registrations_week: 15,
            pending_approvals: 3,
            total_appointments: 287,
            upcoming_appointments: 53,
            total_telemedicine_sessions: 124,
            active_community_discussions: 38,
            system_uptime: '99.98%',
            api_response_time: '245ms',
            database_size: '1.2 GB',
            storage_usage: '68%'
          });
          
          setAuditLogs([
            {
              id: 1001,
              user: {
                id: 1,
                name: 'Dr. Sarah Smith',
                email: 'sarah.smith@example.com'
              },
              action: 'patient_record_access',
              resource: 'Patient #2 Medical Records',
              timestamp: '2023-04-15T09:45:00Z',
              ip_address: '192.168.1.105',
              details: 'Accessed patient medical history and lab results'
            },
            {
              id: 1002,
              user: {
                id: 5,
                name: 'Maria Garcia',
                email: 'maria.garcia@example.com'
              },
              action: 'medication_update',
              resource: 'Medication Database',
              timestamp: '2023-04-14T14:30:00Z',
              ip_address: '192.168.1.110',
              details: 'Updated medication information for Lisinopril'
            },
            {
              id: 1003,
              user: {
                id: 10,
                name: 'Admin User',
                email: 'admin@klararety.com'
              },
              action: 'user_approval',
              resource: 'User Management',
              timestamp: '2023-04-14T11:20:00Z',
              ip_address: '192.168.1.100',
              details: 'Approved new provider account for Dr. Emily Johnson'
            },
            {
              id: 1004,
              user: {
                id: 3,
                name: 'Lisa Chen',
                email: 'lisa.chen@example.com'
              },
              action: 'appointment_creation',
              resource: 'Appointment System',
              timestamp: '2023-04-13T15:10:00Z',
              ip_address: '192.168.1.108',
              details: 'Created new appointment with Patient #4'
            },
            {
              id: 1005,
              user: {
                id: 10,
                name: 'Admin User',
                email: 'admin@klararety.com'
              },
              action: 'system_configuration',
              resource: 'System Settings',
              timestamp: '2023-04-12T10:05:00Z',
              ip_address: '192.168.1.100',
              details: 'Updated email notification settings'
            }
          ]);
          
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load admin dashboard data');
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleApproveUser = async (userId) => {
    setIsProcessing(true);
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user status
      const approvedUser = pendingUsers.find(user => user.id === userId);
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      
      // Add to active users
      approvedUser.status = 'active';
      approvedUser.last_login = null;
      setActiveUsers([...activeUsers, approvedUser]);
      
      // Update system stats
      setSystemStats({
        ...systemStats,
        pending_approvals: systemStats.pending_approvals - 1,
        total_users: systemStats.total_users + 1
      });
      
      toast.success(`User ${approvedUser.name} approved successfully`);
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectUser = async (userId) => {
    setIsProcessing(true);
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove user from pending list
      const rejectedUser = pendingUsers.find(user => user.id === userId);
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      
      // Update system stats
      setSystemStats({
        ...systemStats,
        pending_approvals: systemStats.pending_approvals - 1
      });
      
      toast.success(`User ${rejectedUser.name} rejected`);
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeactivateUser = async (userId) => {
    setIsProcessing(true);
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user status
      setActiveUsers(activeUsers.map(user => {
        if (user.id === userId) {
          return { ...user, status: 'inactive' };
        }
        return user;
      }));
      
      toast.success('User deactivated successfully');
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Failed to deactivate user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateUser = async (userId) => {
    setIsProcessing(true);
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user status
      setActiveUsers(activeUsers.map(user => {
        if (user.id === userId) {
          return { ...user, status: 'active' };
        }
        return user;
      }));
      
      toast.success('User reactivated successfully');
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast.error('Failed to reactivate user');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    return formatDate(dateString);
  };

  const filteredActiveUsers = searchQuery
    ? activeUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeUsers;

  const filteredAuditLogs = searchQuery
    ? auditLogs.filter(log =>
        log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : auditLogs;

  if (isLoading) {
    return (
      <DashboardLayout 
        title="Admin Dashboard" 
        subtitle="Manage users, monitor system performance, and view audit logs"
        role={user?.role || 'admin'}
      >
        <div className="flex items-center justify-center h-64">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600">Loading admin dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Admin Dashboard" 
      subtitle="Manage users, monitor system performance, and view audit logs"
      role={user?.role || 'admin'}
    >
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search users, audit logs, or actions..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* System Stats */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">System Overview</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Key metrics and system performance indicators.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{systemStats.total_users}</dd>
                  <dd className="mt-1 text-sm text-gray-500">{systemStats.active_users_today} active today</dd>
                </dl>
              </div>
            </div>
            
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{systemStats.pending_approvals}</dd>
                  <dd className="mt-1 text-sm text-gray-500">{systemStats.new_registrations_week} new this week</dd>
                </dl>
              </div>
            </div>
            
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Appointments</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{systemStats.total_appointments}</dd>
                  <dd className="mt-1 text-sm text-gray-500">{systemStats.upcoming_appointments} upcoming</dd>
                </dl>
              </div>
            </div>
            
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">System Performance</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{systemStats.system_uptime}</dd>
                  <dd className="mt-1 text-sm text-gray-500">Uptime | {systemStats.api_response_time} avg response</dd>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-base font-medium text-gray-900 mb-2">Community Activity</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Active Discussions</span>
                  <span className="text-sm font-medium text-gray-900">{systemStats.active_community_discussions}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Telemedicine Sessions</span>
                  <span className="text-sm font-medium text-gray-900">{systemStats.total_telemedicine_sessions}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-base font-medium text-gray-900 mb-2">System Resources</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Database Size</span>
                  <span className="text-sm font-medium text-gray-900">{systemStats.database_size}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Storage Usage</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">{systemStats.storage_usage}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: systemStats.storage_usage }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            href="/admin/users/new"
            label="Add User"
            icon={<UserIcon />}
            bgColor="bg-blue-100"
            textColor="text-blue-800"
            hoverColor="hover:bg-blue-200"
          />
          
          <QuickActionButton
            href="/admin/system/backup"
            label="Backup System"
            icon={<BackupIcon />}
            bgColor="bg-green-100"
            textColor="text-green-800"
            hoverColor="hover:bg-green-200"
          />
          
          <QuickActionButton
            href="/admin/reports"
            label="Generate Reports"
            icon={<ReportIcon />}
            bgColor="bg-purple-100"
            textColor="text-purple-800"
            hoverColor="hover:bg-purple-200"
          />
          
          <QuickActionButton
            href="/admin/settings"
            label="System Settings"
            icon={<SettingsIcon />}
            bgColor="bg-yellow-100"
            textColor="text-yellow-800"
            hoverColor="hover:bg-yellow-200"
          />
        </div>
      </div>
{/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange('users')}
          >
            User Management
          </button>
          <button
            className={`${
              activeTab === 'approvals'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange('approvals')}
          >
            Pending Approvals {pendingUsers.length > 0 && <span className="ml-1 bg-primary-500 text-white px-2 py-0.5 rounded-full text-xs">{pendingUsers.length}</span>}
          </button>
          <button
            className={`${
              activeTab === 'audit'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange('audit')}
          >
            Audit Logs
          </button>
          <button
            className={`${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange('settings')}
          >
            System Settings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Management</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              View and manage all registered users.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActiveUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found matching your search criteria
                    </td>
                  </tr>
                ) : (
                  filteredActiveUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-800 font-medium">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'provider' ? 'bg-blue-100 text-blue-800' : 
                          user.role === 'patient' ? 'bg-green-100 text-green-800' : 
                          user.role === 'pharmco' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.registration_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login ? getRelativeTime(user.last_login) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 
                          user.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          className="text-primary-600 hover:text-primary-900 mr-4"
                          onClick={() => {
                            // View user details
                            toast.info(`Viewing details for ${user.name}`);
                          }}
                        >
                          View
                        </button>
                        {user.status === 'active' ? (
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeactivateUser(user.id)}
                            disabled={isProcessing}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleReactivateUser(user.id)}
                            disabled={isProcessing}
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Approvals</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Review and approve new user registrations.
            </p>
          </div>
          
          {pendingUsers.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
              <p className="mt-1 text-sm text-gray-500">
                All user registration requests have been processed.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {pendingUsers.map((user) => (
                <li key={user.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-800 text-lg font-medium">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'provider' ? 'bg-blue-100 text-blue-800' : 
                        user.role === 'patient' ? 'bg-green-100 text-green-800' : 
                        user.role === 'pharmco' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                      <span className="mt-1 text-sm text-gray-500">
                        Registered: {getRelativeTime(user.registration_date)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => {
                        // View user details
                        toast.info(`Viewing details for ${user.name}`);
                      }}
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => handleRejectUser(user.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => handleApproveUser(user.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Approve'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Audit Logs</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              System activity and security audit trail.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No audit logs found matching your search criteria
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                        <div className="text-sm text-gray-500">{log.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.action.includes('access') ? 'bg-blue-100 text-blue-800' : 
                          log.action.includes('update') || log.action.includes('creation') ? 'bg-green-100 text-green-800' : 
                          log.action.includes('approval') ? 'bg-purple-100 text-purple-800' : 
                          log.action.includes('configuration') ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-4 sm:px-6 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => {
                // Export audit logs
                toast.info('Exporting audit logs');
              }}
            >
              Export Logs
            </button>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">Showing {filteredAuditLogs.length} of {auditLogs.length} logs</span>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => {
                  // Load more logs
                  toast.info('Loading more logs');
                }}
              >
                Load More
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">System Settings</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Configure system-wide settings and preferences.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium text-gray-900">Security Settings</h4>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="two-factor-required"
                        name="two-factor-required"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="two-factor-required" className="ml-3 block text-sm font-medium text-gray-700">
                        Require Two-Factor Authentication
                      </label>
                    </div>
                    <span className="text-sm text-gray-500">For all staff and provider accounts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="password-expiry"
                        name="password-expiry"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="password-expiry" className="ml-3 block text-sm font-medium text-gray-700">
                        Password Expiry
                      </label>
                    </div>
                    <span className="text-sm text-gray-500">Require password change every 90 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="session-timeout"
                        name="session-timeout"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="session-timeout" className="ml-3 block text-sm font-medium text-gray-700">
                        Session Timeout
                      </label>
                    </div>
                    <span className="text-sm text-gray-500">Automatically log out after 30 minutes of inactivity</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium text-gray-900">Email Configuration</h4>
                <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="smtp-server" className="block text-sm font-medium text-gray-700">
                      SMTP Server
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="smtp-server"
                        id="smtp-server"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue="smtp.klararety.com"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="smtp-port" className="block text-sm font-medium text-gray-700">
                      SMTP Port
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="smtp-port"
                        id="smtp-port"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue="587"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="smtp-username" className="block text-sm font-medium text-gray-700">
                      SMTP Username
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="smtp-username"
                        id="smtp-username"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue="notifications@klararety.com"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="smtp-password" className="block text-sm font-medium text-gray-700">
                      SMTP Password
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="smtp-password"
                        id="smtp-password"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue="••••••••••••"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-6">
                    <label htmlFor="from-email" className="block text-sm font-medium text-gray-700">
                      From Email Address
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="from-email"
                        id="from-email"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue="no-reply@klararety.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium text-gray-900">System Maintenance</h4>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-medium text-gray-700">Database Backup</span>
                      <span className="block text-sm text-gray-500">Last backup: April 14, 2023 at 2:00 AM</span>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => {
                        // Trigger backup
                        toast.info('Database backup initiated');
                      }}
                    >
                      Run Backup Now
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-medium text-gray-700">System Logs</span>
                      <span className="block text-sm text-gray-500">Current log size: 256 MB</span>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => {
                        // Clear logs
                        toast.info('System logs cleared');
                      }}
                    >
                      Clear Logs
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-medium text-gray-700">Cache Management</span>
                      <span className="block text-sm text-gray-500">Clear application cache</span>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => {
                        // Clear cache
                        toast.info('Application cache cleared');
                      }}
                    >
                      Clear Cache
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
                onClick={() => {
                  // Reset settings
                  toast.info('Settings reset to defaults');
                }}
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => {
                  // Save settings
                  toast.success('System settings saved successfully');
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
