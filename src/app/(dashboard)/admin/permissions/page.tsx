// src/app/(dashboard)/admin/permissions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { PermissionBasedLayout } from '@/app/(dashboard)/_shared/layouts/PermissionBasedLayout';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_approved: boolean;
  date_joined: string;
  permissions: Record<string, boolean>;
}

interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
  role: string;
}

interface PermissionChange {
  user_id: number;
  permission: string;
  old_value: boolean;
  new_value: boolean;
  changed_by: number;
  timestamp: string;
  reason?: string;
}

interface PermissionAuditEntry {
  id: string;
  user_id: number;
  permission: string;
  action: 'granted' | 'revoked' | 'checked';
  granted: boolean;
  timestamp: string;
  changed_by?: number;
  reason?: string;
}

/**
 * Phase 3: Permission Management Interface
 * Admin interface for managing user permissions with audit trails
 */
export default function PermissionManagementPage() {
  const { hasPermission, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissionTemplates, setPermissionTemplates] = useState<PermissionTemplate[]>([]);
  const [auditLog, setAuditLog] = useState<PermissionAuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'templates' | 'audit'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Available permissions based on your backend API response
  const availablePermissions = [
    { key: 'is_admin', label: 'Admin Access', description: 'Full administrative access' },
    { key: 'is_superadmin', label: 'Super Admin', description: 'Super administrator privileges' },
    { key: 'is_staff', label: 'Staff Member', description: 'Staff member privileges' },
    { key: 'can_access_admin', label: 'Admin Dashboard', description: 'Access admin dashboard' },
    { key: 'can_manage_users', label: 'User Management', description: 'Create, edit, and manage users' },
    { key: 'can_access_patient_data', label: 'Patient Data Access', description: 'Access patient health data' },
    { key: 'can_access_research_data', label: 'Research Data Access', description: 'Access research and study data' },
    { key: 'can_emergency_access', label: 'Emergency Access', description: 'Emergency access to restricted data' }
  ];

  useEffect(() => {
    if (hasPermission('can_manage_users')) {
      fetchPermissionData();
    }
  }, [hasPermission]);

  const fetchPermissionData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API calls - replace with actual API calls
      const mockUsers: User[] = [
        {
          id: 1,
          username: 'admin@example.com',
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_approved: true,
          date_joined: '2025-01-01',
          permissions: {
            is_admin: true,
            is_superadmin: false,
            is_staff: true,
            can_access_admin: true,
            can_manage_users: true,
            can_access_patient_data: true,
            can_access_research_data: true,
            can_emergency_access: true
          }
        },
        {
          id: 2,
          username: 'doctor@example.com',
          email: 'doctor@example.com',
          first_name: 'Dr. Jane',
          last_name: 'Smith',
          role: 'provider',
          is_approved: true,
          date_joined: '2025-01-05',
          permissions: {
            is_admin: false,
            is_superadmin: false,
            is_staff: true,
            can_access_admin: false,
            can_manage_users: false,
            can_access_patient_data: true,
            can_access_research_data: false,
            can_emergency_access: false
          }
        },
        {
          id: 3,
          username: 'patient@example.com',
          email: 'patient@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'patient',
          is_approved: true,
          date_joined: '2025-01-10',
          permissions: {
            is_admin: false,
            is_superadmin: false,
            is_staff: false,
            can_access_admin: false,
            can_manage_users: false,
            can_access_patient_data: false,
            can_access_research_data: false,
            can_emergency_access: false
          }
        }
      ];

      const mockTemplates: PermissionTemplate[] = [
        {
          id: 'admin-template',
          name: 'Administrator',
          description: 'Full administrative access with user management',
          role: 'admin',
          permissions: {
            is_admin: true,
            is_staff: true,
            can_access_admin: true,
            can_manage_users: true,
            can_access_patient_data: true,
            can_access_research_data: true,
            can_emergency_access: true
          }
        },
        {
          id: 'provider-template',
          name: 'Healthcare Provider',
          description: 'Access to patient data and clinical features',
          role: 'provider',
          permissions: {
            is_staff: true,
            can_access_patient_data: true,
            can_emergency_access: false
          }
        },
        {
          id: 'researcher-template',
          name: 'Researcher',
          description: 'Access to research data and studies',
          role: 'researcher',
          permissions: {
            is_staff: true,
            can_access_research_data: true
          }
        }
      ];

      const mockAudit: PermissionAuditEntry[] = [
        {
          id: '1',
          user_id: 2,
          permission: 'can_access_patient_data',
          action: 'granted',
          granted: true,
          timestamp: new Date().toISOString(),
          changed_by: 1,
          reason: 'New provider onboarding'
        },
        {
          id: '2',
          user_id: 3,
          permission: 'can_emergency_access',
          action: 'revoked',
          granted: false,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          changed_by: 1,
          reason: 'Security review'
        }
      ];

      setUsers(mockUsers);
      setPermissionTemplates(mockTemplates);
      setAuditLog(mockAudit);
    } catch (err) {
      setError('Failed to load permission data');
      console.error('Permission data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPermissions = async (userId: number, permissions: Record<string, boolean>, reason?: string) => {
    try {
      setIsSaving(true);
      setError(null);

      // In production, this would be an API call
      // await apiClient.put(`/admin/users/${userId}/permissions`, { permissions, reason });

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, permissions }
          : user
      ));

      // Add to audit log
      const newAuditEntry: PermissionAuditEntry = {
        id: Date.now().toString(),
        user_id: userId,
        permission: 'bulk_update',
        action: 'granted',
        granted: true,
        timestamp: new Date().toISOString(),
        changed_by: currentUser?.id || 0,
        reason
      };
      
      setAuditLog(prev => [newAuditEntry, ...prev]);
      setSuccess('Permissions updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update permissions');
      console.error('Permission update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const applyPermissionTemplate = async (userId: number, templateId: string) => {
    const template = permissionTemplates.find(t => t.id === templateId);
    if (!template) return;

    await updateUserPermissions(userId, template.permissions, `Applied template: ${template.name}`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getPermissionCount = (permissions: Record<string, boolean>) => {
    return Object.values(permissions).filter(Boolean).length;
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      provider: 'Healthcare Provider',
      patient: 'Patient',
      researcher: 'Researcher',
      caregiver: 'Caregiver',
      pharmco: 'Pharmaceutical Company',
      compliance: 'Compliance Officer'
    };
    return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Check permission to access this page
  if (!hasPermission('can_manage_users')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to manage user permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PermissionBasedLayout title="Permission Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Permission Management</h1>
            <p className="text-gray-600 mt-1">
              Manage user permissions and access controls
            </p>
          </div>
          <button
            onClick={fetchPermissionData}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Permissions ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Permission Templates ({permissionTemplates.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Audit Log ({auditLog.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Users
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Administrator</option>
                    <option value="provider">Healthcare Provider</option>
                    <option value="patient">Patient</option>
                    <option value="researcher">Researcher</option>
                    <option value="caregiver">Caregiver</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Users ({filteredUsers.length})
                </h3>
              </div>
              
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading users...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {user.first_name[0]}{user.last_name[0]}
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </h4>
                            <p className="text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getRoleDisplayName(user.role)}
                              </span>
                              <span className="text-sm text-gray-500">
                                {getPermissionCount(user.permissions)} permissions
                              </span>
                              <span className={`text-sm ${user.is_approved ? 'text-green-600' : 'text-orange-600'}`}>
                                {user.is_approved ? 'Approved' : 'Pending Approval'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                          Edit Permissions
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No users found matching your criteria.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {permissionTemplates.map((template) => (
                <div key={template.id} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Role:</span>
                      <span className="font-medium">{getRoleDisplayName(template.role)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Permissions:</span>
                      <span className="font-medium">{getPermissionCount(template.permissions)}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Included Permissions:</h4>
                    <div className="space-y-1">
                      {availablePermissions.map((perm) => (
                        template.permissions[perm.key] && (
                          <div key={perm.key} className="flex items-center text-sm text-green-600">
                            <span className="mr-2">✓</span>
                            {perm.label}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Permission Audit Log
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {auditLog.map((entry) => {
                const user = users.find(u => u.id === entry.user_id);
                const changedBy = users.find(u => u.id === entry.changed_by);
                
                return (
                  <div key={entry.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            entry.action === 'granted' ? 'bg-green-100 text-green-800' :
                            entry.action === 'revoked' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {entry.action}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {entry.permission}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          User: {user ? `${user.first_name} ${user.last_name} (${user.email})` : `ID: ${entry.user_id}`}
                        </p>
                        {entry.changed_by && (
                          <p className="text-sm text-gray-600">
                            Changed by: {changedBy ? `${changedBy.first_name} ${changedBy.last_name}` : `ID: ${entry.changed_by}`}
                          </p>
                        )}
                        {entry.reason && (
                          <p className="text-sm text-gray-600">
                            Reason: {entry.reason}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {auditLog.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No audit entries found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Permission Edit Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Edit Permissions: {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Permission Templates */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apply Permission Template
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {permissionTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => applyPermissionTemplate(selectedUser.id, template.id)}
                        className="text-left p-3 border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={isSaving}
                      >
                        <div className="font-medium text-gray-900">{template.name}</div>
                        <div className="text-sm text-gray-600">{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Individual Permissions */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Individual Permissions</h4>
                  <div className="space-y-3">
                    {availablePermissions.map((perm) => (
                      <div key={perm.key} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={perm.key}
                            type="checkbox"
                            checked={selectedUser.permissions[perm.key] || false}
                            onChange={(e) => {
                              setSelectedUser({
                                ...selectedUser,
                                permissions: {
                                  ...selectedUser.permissions,
                                  [perm.key]: e.target.checked
                                }
                              });
                            }}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor={perm.key} className="text-sm font-medium text-gray-900">
                            {perm.label}
                          </label>
                          <p className="text-sm text-gray-600">{perm.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reason for Change */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Changes (Optional)
                  </label>
                  <textarea
                    id="reason"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter reason for permission changes..."
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const reasonTextarea = document.getElementById('reason') as HTMLTextAreaElement;
                      updateUserPermissions(
                        selectedUser.id,
                        selectedUser.permissions,
                        reasonTextarea?.value || undefined
                      );
                      setSelectedUser(null);
                    }}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionBasedLayout>
  );
}