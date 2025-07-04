// src/app/(dashboard)/admin/users/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import FormButton from '@/components/ui/common/FormButton';
import { Spinner } from '@/components/ui/spinner';
import { UserFilters, Pagination, BulkActions } from '../common';
import type { 
  UserFilters as UserFiltersType,
  AdminUserDetail,
  BulkActionRequest,
  BulkActionResponse,
  BulkActionType
} from '@/types/admin.types';
  
export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <UserManagementInterface />
    </AdminGuard>
  );
}

function UserManagementInterface() {
  const { permissions } = usePermissions();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUserDetail[]>([]);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });
  const [filters, setFilters] = useState<UserFiltersType>({
    page: parseInt(searchParams.get('page') || '1'),
    page_size: parseInt(searchParams.get('page_size') || '25'),
    search: searchParams.get('search') || '',
    role: searchParams.get('role') || '',
    is_active: searchParams.get('is_active') === 'true' ? true : 
               searchParams.get('is_active') === 'false' ? false : undefined,
    is_approved: searchParams.get('is_approved') === 'true' ? true : 
                 searchParams.get('is_approved') === 'false' ? false : undefined,
    is_locked: searchParams.get('is_locked') === 'true' ? true : 
               searchParams.get('is_locked') === 'false' ? false : undefined,
    verification_status: searchParams.get('verification_status') || '',
    date_joined_after: searchParams.get('date_joined_after') || '',
    date_joined_before: searchParams.get('date_joined_before') || '',
    last_login_after: searchParams.get('last_login_after') || '',
    last_login_before: searchParams.get('last_login_before') || '',
    ordering: searchParams.get('ordering') || '-date_joined',
  });
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [, setShowCreateModal] = useState(false);

  const canManageUsers = permissions?.has_user_management_access || false;
  const canViewUsers = permissions?.has_admin_access || false;

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/users/users/?${params}`);
      setUsers(response.data.results || []);
      setPagination({
        count: response.data.count || 0,
        next: response.data.next,
        previous: response.data.previous,
      });
      setError(null);
    } catch (error: unknown) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (canViewUsers) {
      fetchUsers();
    }
  }, [filters, canViewUsers, fetchUsers]);

  const updateFilters = (newFilters: Partial<UserFiltersType>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    setSelectedUsers([]); // Clear selection when filters change
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        params.set(key, value.toString());
      }
    });
    router.push(`/dashboard/admin/users?${params}`);
  };

  const handleBulkAction = async (action: string, note?: string) => {
    if (!canManageUsers || selectedUsers.length === 0) return;  

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const bulkRequest: BulkActionRequest = {
        action: action as BulkActionType,
        user_ids: selectedUsers,
        note,
      };

      let endpoint = '';
      switch (action as BulkActionType) {
        case 'approve': endpoint = '/users/admin/bulk-approve/'; break;
        case 'reject': endpoint = '/users/admin/bulk-deny/'; break;
        case 'activate': endpoint = '/users/admin/bulk-activate/'; break;
        case 'deactivate': endpoint = '/users/admin/bulk-deactivate/'; break;
        case 'lock': endpoint = '/users/admin/bulk-lock/'; break;
        case 'unlock': endpoint = '/users/admin/bulk-unlock/'; break;
        case 'reset_password': endpoint = '/users/admin/bulk-reset-password/'; break;
        default: throw new Error('Unknown action');
      }

      const response = await apiClient.post(endpoint, bulkRequest);
      const result: BulkActionResponse = response.data;

      if (result.success) {
        setSuccess(`Successfully processed ${result.processed_count} user${result.processed_count !== 1 ? 's' : ''}`);
        if (result.failed_count > 0) {
          setError(`${result.failed_count} user${result.failed_count !== 1 ? 's' : ''} failed to process`);
        }
      } else {
        setError(result.message || 'Bulk action failed');
      }

      setSelectedUsers([]);
      await fetchUsers();
    } catch (error: unknown) {
      console.error('Bulk action failed:', error);
      
      // Type checking before accessing properties
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'data' in error.response && error.response.data && 
          typeof error.response.data === 'object' && 'detail' in error.response.data) {
        setError(error.response.data.detail as string || 'Bulk action failed');
      } else {
        setError('Bulk action failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(user => user.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
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
      superadmin: 'text-red-700 bg-red-200',
    };
    return colors[role as keyof typeof colors] || 'text-gray-700 bg-gray-100';
  };

  const getStatusBadge = (user: AdminUserDetail) => {
    if (!user.is_active) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Inactive</span>;
    }
    if (!user.is_approved) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Pending</span>;
    }
    if (user.security_info?.account_locked_until && new Date(user.security_info.account_locked_until) > new Date()) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Locked</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Active</span>;
  };

  if (!canViewUsers) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You don&apos;t have permission to view users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        {canManageUsers && (
          <div className="flex items-center space-x-3">
            <FormButton
              onClick={() => setShowCreateModal(true)}
              variant="outline"
              size="sm"
            >
              Create Admin User
            </FormButton>
            <FormButton
              onClick={() => router.push('/dashboard/admin/approvals')}
              size="sm"
            >
              Pending Approvals
            </FormButton>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Filters */}
      <UserFilters
        filters={filters}
        currentFilters={filters}
        onFiltersChange={updateFilters}
        showAdvanced={true}
      />

      {/* Bulk Actions */}
      {canManageUsers && (
        <BulkActions
          selectedItems={selectedUsers}
          selectedUserIds={selectedUsers}
          onAction={handleBulkAction}
          onBulkApprove={() => handleBulkAction('approve')}
          onBulkDeny={() => handleBulkAction('reject')}
          onSelectAll={selectAllUsers}
          onDeselectAll={clearSelection}
          onClearSelection={clearSelection}
          totalItems={users.length}
          isAllSelected={selectedUsers.length === users.length && users.length > 0}
          isProcessing={isProcessing}
          canPerformActions={canManageUsers}
          actionType="users"
        />
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center">
            <Spinner size="lg" />
            <p className="mt-2 text-gray-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M15 13a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No users found matching your criteria.</p>
            <p className="text-sm">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {users.length} of {pagination.count} users
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {canManageUsers && (
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onChange={selectedUsers.length === users.length ? clearSelection : selectAllUsers}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verification
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      {canManageUsers && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.profile?.first_name?.[0] || user.username[0].toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.profile?.first_name} {user.profile?.last_name} ({user.username})
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.profile?.institution && (
                              <div className="text-xs text-gray-400">{user.profile.institution}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.profile?.verified_credentials ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : user.profile?.days_until_verification_required !== undefined ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {user.profile.days_until_verification_required} days left
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Not Required
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </button>
                        {canManageUsers && (
                          <button
                            onClick={() => router.push(`/dashboard/admin/users/${user.id}/edit`)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              pagination={pagination}
              currentPage={filters.page}
              pageSize={filters.page_size}
              onPageChange={(page) => updateFilters({ page })}
              onPageSizeChange={(page_size) => updateFilters({ page_size })}
            />
          </>
        )}
      </div>
    </div>
  );
}