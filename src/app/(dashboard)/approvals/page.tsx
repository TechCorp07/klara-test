// src/app/(dashboard)/approvals/page.tsx
'use client';

import { useEffect, useState } from 'react';
//import { useAuth } from '@/lib/auth/use-auth';
import { RoleGuard } from '@/lib/auth/guards/role-guard';
import { FormButton, FormAlert } from '@/components/auth/common';
import { Spinner } from '@/components/ui/spinner';
import { authService } from '@/lib/api/services/auth.service';
import { User } from '@/types/auth.types';

/**
 * User approval management page for administrators.
 * 
 * This page allows administrators to:
 * - View pending registration requests
 * - Approve or reject user registrations
 * - See details about users awaiting approval
 */
export default function ApprovalsPage() {
  // Protected by RoleGuard to ensure only admins can access
  return (
    <RoleGuard allowedRoles={['admin', 'superadmin']}>
      <ApprovalManagement />
    </RoleGuard>
  );
}

function ApprovalManagement() {
  //const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  
  // Fetch pending approvals when component mounts
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const approvals = await authService.getPendingApprovals();
        setPendingUsers(approvals);
      } catch (err: unknown) {
        console.error('Error fetching pending approvals:', err);
        setError('Failed to load pending approvals. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPendingApprovals();
  }, []);
  
  // Handle user approval
  const handleApprove = async (userId: number) => {
    try {
      setProcessingIds((ids) => [...ids, userId]);
      setError(null);
      
      await authService.approveUser(userId);
      
      // Remove approved user from the list
      setPendingUsers((users) => users.filter((user) => user.id !== userId));
      setSuccess('User has been approved successfully.');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: unknown) {
      console.error('Error approving user:', err);
      setError('Failed to approve user. Please try again.');
    } finally {
      setProcessingIds((ids) => ids.filter((id) => id !== userId));
    }
  };
  
  // Handle user rejection
  const handleReject = async (userId: number) => {
    try {
      setProcessingIds((ids) => [...ids, userId]);
      setError(null);
      
      await authService.rejectUser(userId);
      
      // Remove rejected user from the list
      setPendingUsers((users) => users.filter((user) => user.id !== userId));
      setSuccess('User registration has been rejected.');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: unknown) {
      console.error('Error rejecting user:', err);
      setError('Failed to reject user. Please try again.');
    } finally {
      setProcessingIds((ids) => ids.filter((id) => id !== userId));
    }
  };
  
  // Format registration date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Get role display name
  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      'patient': 'Patient',
      'provider': 'Healthcare Provider',
      'researcher': 'Researcher',
      'pharmco': 'Pharmaceutical Company',
      'caregiver': 'Caregiver',
      'compliance': 'Compliance Officer',
      'admin': 'Administrator',
    };
    
    return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
  };
  
  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Approval Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and manage pending user registration requests
        </p>
      </div>
      
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
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Pending Approvals
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Users awaiting administrator approval
          </p>
        </div>
        
        {pendingUsers.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no users waiting for approval.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Registration Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingUsers.map((pendingUser) => (
                  <tr key={pendingUser.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {pendingUser.first_name?.[0]}{pendingUser.last_name?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {pendingUser.first_name} {pendingUser.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pendingUser.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getRoleDisplay(pendingUser.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pendingUser.date_joined ? formatDate(pendingUser.date_joined) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            // In a real app, this would navigate to a details page or open a modal
                            alert(`View details for ${pendingUser.first_name} ${pendingUser.last_name}`);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Details
                        </button>
                        <FormButton
                          type="button"
                          variant="success"
                          isLoading={processingIds.includes(pendingUser.id)}
                          onClick={() => handleApprove(pendingUser.id)}
                          className="px-3 py-1"
                        >
                          Approve
                        </FormButton>
                        <FormButton
                          type="button"
                          variant="danger"
                          isLoading={processingIds.includes(pendingUser.id)}
                          onClick={() => handleReject(pendingUser.id)}
                          className="px-3 py-1"
                        >
                          Reject
                        </FormButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Approval Guidelines</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              As an administrator, you are responsible for reviewing and approving user registrations.
              Please follow these guidelines when reviewing registration requests:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Verify the user&apos;s identity and credentials before approval</li>
              <li>For healthcare providers, verify their license number and NPI</li>
              <li>For researchers, verify their institutional affiliation</li>
              <li>For pharmaceutical companies, verify their regulatory ID</li>
              <li>Reject any suspicious or fraudulent registration attempts</li>
              <li>All approval and rejection actions are logged for audit purposes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}