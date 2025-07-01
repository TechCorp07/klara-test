// src/app/(dashboard)/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import { FormButton } from '@/components/ui/form-button';
import { Spinner } from '@/components/ui/spinner';
import Pagination from '../common/Pagination';
import UserFilters from '../common/UserFilters';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  is_approved: boolean;
  is_locked: boolean;
  date_joined: string;
  last_login: string | null;
  profile: {
    first_name: string;
    last_name: string;
    phone_number?: string;
    institution?: string;
    company_name?: string;
    verified_credentials?: boolean;
    days_until_verification_required?: number;
  };
}

interface UserFiltersType {
  page: number;
  page_size: number;
  search: string;
  role: string;
  is_active?: boolean;
  is_approved?: boolean;
  is_locked?: boolean;
  ordering: string;
}

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

  const [users, setUsers] = useState<User[]>([]);
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
    ordering: searchParams.get('ordering') || '-date_joined',
  });
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Permission checks
  const canManageUsers = permissions?.has_user_management_access || false;
  const canApproveUsers = permissions?.has_approval_permissions || false;

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/api/admin/users/?${queryParams.toString()}`);
      setUsers(response.data.results || []);
      setPagination({
        count: response.data.count || 0,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUrlParams = (newFilters: Partial<UserFiltersType>) => {
    const params = new URLSearchParams();
    const updatedFilters = { ...filters, ...newFilters };
    
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    router.push(`/dashboard/admin/users?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: Partial<UserFiltersType>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    updateUrlParams(updatedFilters);
  };

  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    updateUrlParams(updatedFilters);
  };

  const handleUserAction = async (userId: number, action: 'activate' | 'deactivate' | 'lock' | 'unlock' | 'approve' | 'reject') => {
    if (!canManageUsers && !canApproveUsers) return;

    setProcessingIds(prev => [...prev, userId]);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = `/api/admin/users/${userId}/${action}/`;
      await apiClient.post(endpoint);
      
      setSuccess(`User ${action}d successfully`);
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      setError(error.response?.data?.detail || `Failed to ${action} user`);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUserIds.length === 0 || !canManageUsers) return;

    setIsBulkProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = `/api/admin/users/bulk-${bulkAction}/`;
      await apiClient.post(endpoint, { user_ids: selectedUserIds });
      
      setSuccess(`Bulk ${bulkAction} completed successfully`);
      setSelectedUserIds([]);
      setBulkAction('');
      fetchUsers();
    } catch (error: any) {
      setError(error.response?.data?.detail || `Failed to perform bulk ${bulkAction}`);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(user => user.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserStatusBadge = (user: User) => {
    if (!user.is_active) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
    }
    if (user.is_locked) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Locked</span>;
    }
    if (!user.is_approved) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
  };

  const currentPage = Math.ceil((filters.page - 1) * filters.page_size / filters.page_size) + 1;
  const totalPages = Math.ceil(pagination.count / filters.page_size);

  if (!canManageUsers && !canApproveUsers) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">🚫 Insufficient Permissions</h3>
          <p className="mb-4">You don't have permission to manage users.</p>
          <p className="text-sm">Required: User management or approval permissions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage user accounts, permissions, and approval status
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Filters */}
      <UserFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Bulk Actions */}
      {canManageUsers && selectedUserIds.length > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="rounded border-gray-300 text-sm"
              >
                <option value="">Select action...</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="lock">Lock</option>
                <option value="unlock">Unlock</option>
              </select>
              <FormButton
                type="button"
                onClick={handleBulkAction}
                isLoading={isBulkProcessing}
                disabled={!bulkAction}
                className="text-sm"
              >
                Apply
              </FormButton>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {canManageUsers && (
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.length === users.length && users.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300"
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
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    {canManageUsers && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.profile.first_name?.[0] || user.username[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.profile.first_name && user.profile.last_name 
                              ? `${user.profile.first_name} ${user.profile.last_name}`
                              : user.username
                            }
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {(user.profile.institution || user.profile.company_name) && (
                            <div className="text-xs text-gray-400">
                              {user.profile.institution || user.profile.company_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getUserStatusBadge(user)}
                      {user.profile.days_until_verification_required !== null && 
                       user.profile.days_until_verification_required <= 7 && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Verification due in {user.profile.days_until_verification_required} days
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.date_joined)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? formatDate(user.last_login) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        
                        {canManageUsers && (
                          <>
                            {user.is_active ? (
                              <FormButton
                                type="button"
                                variant="danger"
                                size="sm"
                                isLoading={processingIds.includes(user.id)}
                                onClick={() => handleUserAction(user.id, 'deactivate')}
                              >
                                Deactivate
                              </FormButton>
                            ) : (
                              <FormButton
                                type="button"
                                variant="success"
                                size="sm"
                                isLoading={processingIds.includes(user.id)}
                                onClick={() => handleUserAction(user.id, 'activate')}
                              >
                                Activate
                              </FormButton>
                            )}
                            
                            {user.is_locked ? (
                              <FormButton
                                type="button"
                                variant="success"
                                size="sm"
                                isLoading={processingIds.includes(user.id)}
                                onClick={() => handleUserAction(user.id, 'unlock')}
                              >
                                Unlock
                              </FormButton>
                            ) : (
                              <FormButton
                                type="button"
                                variant="danger"
                                size="sm"
                                isLoading={processingIds.includes(user.id)}
                                onClick={() => handleUserAction(user.id, 'lock')}
                              >
                                Lock
                              </FormButton>
                            )}
                          </>
                        )}
                        
                        {canApproveUsers && !user.is_approved && (
                          <>
                            <FormButton
                              type="button"
                              variant="success"
                              size="sm"
                              isLoading={processingIds.includes(user.id)}
                              onClick={() => handleUserAction(user.id, 'approve')}
                            >
                              Approve
                            </FormButton>
                            <FormButton
                              type="button"
                              variant="danger"
                              size="sm"
                              isLoading={processingIds.includes(user.id)}
                              onClick={() => handleUserAction(user.id, 'reject')}
                            >
                              Reject
                            </FormButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.count > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalCount={pagination.count}
            pageSize={filters.page_size}
          />
        )}
      </div>
    </div>
  );
}
