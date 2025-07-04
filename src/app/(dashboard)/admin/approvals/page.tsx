'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { FormButton, FormAlert } from '@/components/ui/common';
import { Spinner } from '@/components/ui/spinner';
import { authService } from '@/lib/api/services/auth.service';
import { User } from '@/types/auth.types';
import { UserFilters } from '@/app/(dashboard)/admin/common/UserFilters';
import { Pagination } from '@/app/(dashboard)/admin/common/Pagination';
import { BulkActions } from '@/app/(dashboard)/admin/common/BulkActions';
import { DashboardStats } from '@/app/(dashboard)/admin/common/DashboardStats';
import type { 
  UserFilters as UserFiltersType, 
  PaginatedUsersResponse, 
  DashboardStatsResponse 
} from '@/types/admin.types';
import { AdminGuard } from '@/components/guards/AdminGuard';

// Enhanced User interface with credential information
interface EnhancedUser extends User {
  phone?: string;
  license_number?: string;
  npi?: string;
  specialization?: string;
  institution?: string;
  institutional_affiliation?: string;
  department?: string;
  research_focus?: string;
  orcid?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  medical_conditions?: string;
  company_name?: string;
  regulatory_id?: string;
  company_address?: string;
  fda_registration?: string;
  verified_credentials?: boolean;
  registration_ip?: string;
  documents_submitted?: string[];
}

interface RiskLevel {
  level: 'low' | 'medium' | 'high';
  color: string;
  text: string;
}

/**
 * Comprehensive User Approval and Management Page
 * 
 * This page provides complete admin functionality:
 * - Dashboard statistics and insights
 * - Advanced search and filtering
 * - Bulk approve/deny operations
 * - Individual user management
 * - Detailed credential verification
 * - Risk assessment and audit trails
 * - Pagination for large datasets
 * - Permission-based access control
 */
export default function AdminApprovalsPage() {
  return (
    <AdminGuard>
      <ComprehensiveApprovalManagement />
    </AdminGuard>
  );
}

function ComprehensiveApprovalManagement() {
  const { permissions } = usePermissions();
  
  // State management for all users (not just pending)
  const [users, setUsers] = useState<EnhancedUser[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsResponse | null>(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });
  const [filters, setFilters] = useState<UserFiltersType>({
    page: 1,
    page_size: 25,
    search: '',
    role: '',
    is_approved: false, // Default to showing pending approvals first
    ordering: '-date_joined',
  });
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [modalUser, setModalUser] = useState<EnhancedUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'pending' | 'all'>('pending');

  // Check if user has approval/rejection permissions
  const canApproveReject = permissions?.has_approval_permissions;

  // Audit logging function
  const logAuditEvent = (_message: string) => {
    // In production, this would call your logging service
    // For now, we'll just store it locally or call your audit API
    // Example: Call your audit logging service
    // auditService.log(message);
  };

  // Role display mapping
  const roleMap: Record<string, string> = {
    'patient': 'Patient',
    'provider': 'Healthcare Provider',
    'researcher': 'Researcher',
    'pharmco': 'Pharmaceutical Company',
    'caregiver': 'Caregiver',
    'compliance': 'Compliance Officer',
    'admin': 'Administrator',
  };

  const getRoleDisplay = (role: string): string => {
    return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Risk assessment function
  const getRiskLevel = (user: EnhancedUser): RiskLevel => {
    let riskScore = 0;
    
    // Basic risk assessment
    if (!user.phone) riskScore += 1;
    if (user.email.includes('tempmail') || user.email.includes('10minutemail')) riskScore += 2;
    if (user.registration_ip?.startsWith('203.0.113')) riskScore += 1; // Example suspicious IP range
    
    // Role-specific checks
    if (user.role === 'provider' && (!user.license_number || !user.npi)) riskScore += 2;
    if (user.role === 'researcher' && !user.institutional_affiliation) riskScore += 2;
    if (user.role === 'pharmco' && !user.regulatory_id) riskScore += 2;
    
    if (riskScore === 0) return { level: 'low', color: 'green', text: 'Low Risk' };
    if (riskScore <= 2) return { level: 'medium', color: 'yellow', text: 'Medium Risk' };
    return { level: 'high', color: 'red', text: 'High Risk' };
  };

  // Format date function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Show alert function
  const showAlert = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setSuccess(message);
      setError(null);
    } else {
      setError(message);
      setSuccess(null);
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 5000);
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setIsStatsLoading(true);
      const stats = await authService.getDashboardStats();
      // Explicitly cast to ensure type compatibility
      setDashboardStats(stats as unknown as DashboardStatsResponse);
    } catch (err: unknown) {
      console.error('Error fetching dashboard stats:', err);
      // Don't show error for stats as it's not critical
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Fetch users based on current view mode and filters
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let response: PaginatedUsersResponse;
      
      if (viewMode === 'pending') {
        // For pending view, use the pending approvals endpoint
        const pendingUsers = await authService.getPendingApprovals();
        response = {
          count: pendingUsers.length,
          next: null,
          previous: null,
          results: pendingUsers
        };
      } else {
        // For all users view, use the comprehensive users endpoint with filters
        response = await authService.getUsers(filters);
      }
      
      setUsers(response.results);
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous,
      });
      
      // Clear selections when data changes
      setSelectedUserIds([]);
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users. Please try again.';
      showAlert('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [viewMode, filters]);

  // Effect to fetch data when filters change or view mode changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Effect to fetch dashboard stats on mount
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Handle view mode change
  const handleViewModeChange = (mode: 'pending' | 'all') => {
    setViewMode(mode);
    if (mode === 'pending') {
      // Reset filters for pending view
      setFilters({
        page: 1,
        page_size: 25,
        search: '',
        role: '',
        is_approved: false,
        ordering: '-date_joined',
      });
    } else {
      // Reset filters for all users view
      setFilters({
        page: 1,
        page_size: 25,
        search: '',
        role: '',
        is_approved: undefined,
        ordering: '-date_joined',
      });
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Calculate pagination info
  //const totalPages = Math.ceil(pagination.count / (filters.page_size || 25));
  const currentPage = filters.page || 1;

  // Selection handlers
  const handleSelectAll = (usersToSelect: User[]) => {
    setSelectedUserIds(usersToSelect.map(user => user.id));
  };

  const handleDeselectAll = () => {
    setSelectedUserIds([]);
  };

  const handleUserSelect = (userId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  // Individual user actions
  const handleApproveUser = async (userId: number) => {
    if (!canApproveReject) {
      showAlert('error', 'You do not have permission to approve users.');
      return;
    }

    try {
      setProcessingIds(prev => [...prev, userId]);
      await authService.approveUser(userId);
      
      // Log the approval action
      logAuditEvent(`AUDIT LOG: User ${userId} approved by administrator at ${new Date().toISOString()}`);
      
      showAlert('success', 'User has been approved successfully. Action logged for audit.');
      fetchUsers(); // Refresh the list
      fetchDashboardStats(); // Refresh stats
    } catch (err: unknown) {
      console.error('Error approving user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve user.';
      showAlert('error', errorMessage);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleRejectUser = async (userId: number) => {
    if (!canApproveReject) {
      showAlert('error', 'You do not have permission to reject users.');
      return;
    }

    try {
      setProcessingIds(prev => [...prev, userId]);
      await authService.rejectUser(userId);
      
      // Log the rejection action
      logAuditEvent(`AUDIT LOG: User ${userId} rejected by administrator at ${new Date().toISOString()}`);
      
      showAlert('success', 'User has been rejected successfully. Action logged for audit.');
      fetchUsers(); // Refresh the list
      fetchDashboardStats(); // Refresh stats
    } catch (err: unknown) {
      console.error('Error rejecting user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject user.';
      showAlert('error', errorMessage);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== userId));
    }
  };

  // Bulk operations
  const handleBulkApprove = async () => {
    if (!canApproveReject) {
      showAlert('error', 'You do not have permission to approve users.');
      return;
    }

    try {
      setIsBulkProcessing(true);
      const response = await authService.bulkApproveUsers(selectedUserIds);
      
      if (response.errors && response.errors.length > 0) {
        showAlert('error', `Bulk approval completed with errors: ${response.errors.join(', ')}`);
      } else {
        showAlert('success', `Successfully approved ${response.approved_count} users.`);
      }
      
      setSelectedUserIds([]);
      fetchUsers(); // Refresh the list
      fetchDashboardStats(); // Refresh stats
    } catch (err: unknown) {
      console.error('Error in bulk approval:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve users.';
      showAlert('error', errorMessage);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDeny = async () => {
    if (!canApproveReject) {
      showAlert('error', 'You do not have permission to deny users.');
      return;
    }

    try {
      setIsBulkProcessing(true);
      const response = await authService.bulkDenyUsers(selectedUserIds, 'Bulk denial by administrator');
      
      showAlert('success', `Successfully denied ${response.denied_count} users.`);
      setSelectedUserIds([]);
      fetchUsers(); // Refresh the list
      fetchDashboardStats(); // Refresh stats
    } catch (err: unknown) {
      console.error('Error in bulk denial:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to deny users.';
      showAlert('error', errorMessage);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Modal functions
  const showDetails = (user: EnhancedUser) => {
    setModalUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalUser(null);
  };

  const approveFromModal = async (userId: number) => {
    await handleApproveUser(userId);
    closeModal();
  };

  const rejectFromModal = async (userId: number) => {
    await handleRejectUser(userId);
    closeModal();
  };

  return (
    <>
      <div className="py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Approval & Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive user administration with approval workflows and advanced management tools
          </p>
          {!canApproveReject && (
            <div className="mt-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              <strong>View-only access:</strong> You can review user details but cannot approve or reject registrations.
            </div>
          )}
        </div>

        {/* Dashboard Statistics */}
        {dashboardStats && (
          <DashboardStats data={dashboardStats} />
        )}

        {/* Alerts */}
        <FormAlert
          type="success"
          message={success}
          onDismiss={() => setSuccess(null)}
        />
        
        <FormAlert
          type="error"
          message={error}
          onDismiss={() => setError(null)}
        />

        {/* View Mode Toggle */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">View Mode</h3>
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => handleViewModeChange('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'pending'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending Approvals ({dashboardStats?.pending_approvals || 0})
              </button>
              <button
                onClick={() => handleViewModeChange('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Users ({dashboardStats?.total_users || 0})
              </button>
            </div>
          </div>
        </div>

        {/* Filters - Only show in 'all' mode */}
        {viewMode === 'all' && (
          <UserFilters 
            filters={filters}
            currentFilters={filters}
            onFiltersChange={handleFiltersChange}
          />
        )}

        {/* Bulk Actions - Only show if there are selectable users */}
        {users.length > 0 && (
          <BulkActions
            selectedUserIds={selectedUserIds}
            selectedItems={selectedUserIds}
            onSelectAll={() => handleSelectAll(users)}
            onDeselectAll={handleDeselectAll}
            onBulkApprove={handleBulkApprove}
            onBulkDeny={handleBulkDeny}
            onAction={async (action) => {
              if (action === 'approve') await handleBulkApprove();
              if (action === 'deny') await handleBulkDeny();
            }}
            onClearSelection={handleDeselectAll}
            totalItems={users.length}
            isAllSelected={selectedUserIds.length === users.length}
            canPerformActions={canApproveReject || false}
            isProcessing={isBulkProcessing}
          />
        )}

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {viewMode === 'pending' ? 'Pending Approvals' : 'All Users'} ({pagination.count.toLocaleString()})
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {viewMode === 'pending' 
                ? 'Users awaiting administrator approval' 
                : 'All registered users in the system'
              }
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <Spinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={viewMode === 'pending' 
                    ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    : "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8-4 4-4-4m0 0V3"
                  }
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {viewMode === 'pending' ? 'No pending approvals' : 'No users found'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {viewMode === 'pending' 
                  ? 'There are currently no users waiting for approval.'
                  : 'No users match your current filter criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.length === users.length && users.length > 0}
                        onChange={() => selectedUserIds.length === users.length ? handleDeselectAll() : handleSelectAll(users)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {viewMode === 'pending' && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk Level
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const risk = getRiskLevel(user);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                {user.phone || 'No phone provided'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {getRoleDisplay(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.is_approved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        {viewMode === 'pending' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${risk.color}-100 text-${risk.color}-800`}>
                              {risk.text}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.date_joined ? formatDate(user.date_joined) : 'N/A'}
                          {viewMode === 'pending' && user.registration_ip && (
                            <div className="text-xs text-gray-400">IP: {user.registration_ip}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => showDetails(user)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              {viewMode === 'pending' ? 'Review Details' : 'View'}
                            </button>
                            {canApproveReject && !user.is_approved ? (
                              <>
                                <FormButton
                                  type="button"
                                  variant="success"
                                  isLoading={processingIds.includes(user.id)}
                                  onClick={() => handleApproveUser(user.id)}
                                  className="px-3 py-1 text-xs"
                                >
                                  Approve
                                </FormButton>
                                <FormButton
                                  type="button"
                                  variant="danger"
                                  isLoading={processingIds.includes(user.id)}
                                  onClick={() => handleRejectUser(user.id)}
                                  className="px-3 py-1 text-xs"
                                >
                                  Reject
                                </FormButton>
                              </>
                            ) : (
                              <span className="text-xs text-gray-500">
                                {user.is_approved ? 'Approved' : 'View Only'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination - Only show in 'all' mode */}
          {viewMode === 'all' && pagination.count > 0 && (
            <Pagination
              pagination={pagination}
              pageSize={filters.page_size || 25}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onPageSizeChange={(newPageSize) => setFilters(prev => ({ ...prev, page_size: newPageSize }))}
            />
          )}
        </div>

        {/* Guidelines Section */}
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {viewMode === 'pending' ? 'Approval Guidelines' : 'User Management Guidelines'}
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                {viewMode === 'pending' 
                  ? 'As an administrator, you are responsible for reviewing and approving user registrations.'
                  : 'This comprehensive interface allows you to manage all users with advanced features.'
                }
                Please follow these guidelines:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {viewMode === 'pending' ? (
                  <>
                    <li>Verify the user&apos;s identity and credentials before approval</li>
                    <li>For healthcare providers, verify their license number and NPI</li>
                    <li>For researchers, verify their institutional affiliation</li>
                    <li>For pharmaceutical companies, verify their regulatory ID</li>
                    <li>Reject any suspicious or fraudulent registration attempts</li>
                    <li>All approval and rejection actions are logged for audit purposes</li>
                  </>
                ) : (
                  <>
                    <li>Use search and filters to quickly find specific users</li>
                    <li>Utilize bulk operations for efficient user management</li>
                    <li>Monitor dashboard statistics for system insights</li>
                    <li>Review user details thoroughly before making decisions</li>
                    <li>All administrative actions are logged for compliance</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {isModalOpen && modalUser && (
        <UserDetailsModal
          user={modalUser}
          onClose={closeModal}
          onApprove={approveFromModal}
          onReject={rejectFromModal}
          getRoleDisplay={getRoleDisplay}
          formatDate={formatDate}
          canApproveReject={canApproveReject}
        />
      )}
    </>
  );
}

// User Details Modal Component (unchanged from your original)
interface UserDetailsModalProps {
  user: EnhancedUser;
  onClose: () => void;
  onApprove: (userId: number) => void;
  onReject: (userId: number) => void;
  getRoleDisplay: (role: string) => string;
  formatDate: (dateString: string) => string;
  canApproveReject?: boolean;
}

function UserDetailsModal({ 
  user, 
  onClose, 
  onApprove, 
  onReject, 
  getRoleDisplay, 
  formatDate,
  canApproveReject = false
}: UserDetailsModalProps) {
  const [adminNotes, setAdminNotes] = useState('');

  // Generate role-specific credential fields
  const renderCredentialFields = () => {
    switch(user.role) {
      case 'provider':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">License Number</label>
              <p className="mt-1 text-sm text-gray-900">{user.license_number || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">NPI Number</label>
              <p className="mt-1 text-sm text-gray-900">{user.npi || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization</label>
              <p className="mt-1 text-sm text-gray-900">{user.specialization || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <p className="mt-1 text-sm text-gray-900">{user.institution || 'Not provided'}</p>
            </div>
          </div>
        );
      case 'researcher':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Institutional Affiliation</label>
              <p className="mt-1 text-sm text-gray-900">{user.institutional_affiliation || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <p className="mt-1 text-sm text-gray-900">{user.department || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Research Focus</label>
              <p className="mt-1 text-sm text-gray-900">{user.research_focus || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ORCID</label>
              <p className="mt-1 text-sm text-gray-900">{user.orcid || 'Not provided'}</p>
            </div>
          </div>
        );
      case 'pharmco':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <p className="mt-1 text-sm text-gray-900">{user.company_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Regulatory ID</label>
              <p className="mt-1 text-sm text-gray-900">{user.regulatory_id || 'Not provided'}</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Company Address</label>
              <p className="mt-1 text-sm text-gray-900">{user.company_address || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">FDA Registration</label>
              <p className="mt-1 text-sm text-gray-900">{user.fda_registration || 'Not provided'}</p>
            </div>
          </div>
        );
      case 'patient':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="mt-1 text-sm text-gray-900">{user.date_of_birth || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
              <p className="mt-1 text-sm text-gray-900">{user.emergency_contact || 'Not provided'}</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
              <p className="mt-1 text-sm text-gray-900">{user.medical_conditions || 'Not provided'}</p>
            </div>
          </div>
        );
      default:
        return <p className="text-sm text-gray-500">No specific credential requirements for this role.</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="bg-white rounded-lg shadow-xl transform transition-all sm:w-full sm:max-w-4xl">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                User Registration Details
              </h3>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Permission warning for view-only users */}
            {!canApproveReject && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  <strong>View-Only Access:</strong> You can review user details but cannot approve or reject this registration.
                </p>
              </div>
            )}
            
            {/* Basic Information */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user.first_name} {user.last_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-sm text-gray-900">{getRoleDisplay(user.role)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                  <p className="mt-1 text-sm text-gray-900">{user.date_joined ? formatDate(user.date_joined) : 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration IP</label>
                  <p className="mt-1 text-sm text-gray-900">{user.registration_ip}</p>
                </div>
              </div>
            </div>

            {/* Role-Specific Credentials */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Credentials & Verification</h4>
              {renderCredentialFields()}
            </div>

            {/* Submitted Documents */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Submitted Documents</h4>
              <div className="flex flex-wrap gap-2">
                {user.documents_submitted?.map((doc, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {doc}
                  </span>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Risk Assessment</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      Please verify all credentials before approval. Check for suspicious patterns in registration data.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Administrator Notes</h4>
              <textarea 
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder={canApproveReject ? "Add any notes about this registration review..." : "View-only access - cannot add notes"}
                disabled={!canApproveReject}
              />
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {canApproveReject ? (
              <>
                <button
                  onClick={() => onApprove(user.id)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Approve User
                </button>
                <button
                  onClick={() => onReject(user.id)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Reject User
                </button>
              </>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Contact administrator for approval permissions
              </div>
            )}
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
