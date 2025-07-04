// src/app/(dashboard)/admin/users/[id]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import FormButton from '@/components/ui/common/FormButton';
import { Spinner } from '@/components/ui/spinner';

interface UserDetail {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  is_approved: boolean;
  is_locked: boolean;
  date_joined: string;
  last_login: string | null;
  failed_login_attempts: number;
  profile: {
    first_name: string;
    last_name: string;
    phone_number?: string;
    institution?: string;
    company_name?: string;
    verified_credentials?: boolean;
    days_until_verification_required?: number;
    license_number?: string;
    npi?: string;
    specialization?: string;
    department?: string;
    research_focus?: string;
    orcid?: string;
    date_of_birth?: string;
    emergency_contact?: string;
    medical_conditions?: string;
    regulatory_id?: string;
    company_address?: string;
    fda_registration?: string;
    registration_ip?: string;
    documents_submitted?: string[];
  };
  audit_logs?: Array<{
    id: string;
    action: string;
    timestamp: string;
    ip_address?: string;
    user_agent?: string;
    details?: Record<string, unknown>;
  }>;
  emergency_access_events?: Array<{
    id: string;
    timestamp: string;
    reason: string;
    duration_hours: number;
    reviewed: boolean;
    reviewer?: string;
  }>;
  consent_records?: Array<{
    id: string;
    document_type: string;
    version: string;
    signed_at: string;
    ip_address: string;
    expires_at?: string;
  }>;
}

interface ActionLog {
  id: string;
  action: string;
  timestamp: string;
  admin_user: string;
  details: string;
}

export default function AdminUserDetailPage() {
  return (
    <AdminGuard>
      <UserDetailInterface />
    </AdminGuard>
  );
}

type TabId = 'profile' | 'security' | 'compliance' | 'actions';

function UserDetailInterface() {
  const { permissions } = usePermissions();
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [actionNote, setActionNote] = useState('');

  const canManageUsers = permissions?.has_user_management_access || false;
  const canViewCompliance = permissions?.has_audit_access || false;

  const fetchUserDetail = useCallback(async () => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/`);
      setUser(response.data);
      
      // Fetch action logs if user has permissions
      if (canViewCompliance) {
        const logsResponse = await apiClient.get(`/admin/users/${userId}/action-logs/`);
        setActionLogs(logsResponse.data.results || []);
      }
    } catch (error: unknown) {
      // Type guard to check if error is an object with expected properties
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'status' in error.response) {
        if (error.response.status === 404) {
          setError('User not found');
        } else {
          setError('Failed to load user details');
        }
      } else {
        // Handle unexpected error format
        setError('An unexpected error occurred');
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, canViewCompliance, setUser, setActionLogs, setError, setIsLoading]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  const handleUserAction = async (action: string) => {
    if (!canManageUsers || !user) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = actionNote ? { note: actionNote } : {};
      await apiClient.post(`/admin/users/${userId}/${action}/`, payload);
      
      setSuccess(`User ${action}d successfully`);
      setActionNote('');
      fetchUserDetail(); // Refresh data
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error &&
          error.response && typeof error.response === 'object' && 
          'data' in error.response && error.response.data && 
          typeof error.response.data === 'object' && 'detail' in error.response.data) {
        setError(error.response.data.detail as string);
      } else {
        setError(`Failed to ${action} user`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const impersonateUser = async () => {
    if (!canManageUsers || !user) return;

    try {
      const response = await apiClient.post(`/admin/users/${userId}/impersonate/`);
      if (response.data.redirect_url) {
        window.open(response.data.redirect_url, '_blank');
        setSuccess('User impersonation session started');
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error &&
          error.response && typeof error.response === 'object' && 
          'data' in error.response && error.response.data && 
          typeof error.response.data === 'object' && 'detail' in error.response.data) {
        setError(error.response.data.detail as string);
      } else {
        setError('Failed to start impersonation');
      }
    }
  };

  const exportUserData = async () => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/export/`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-${userId}-data.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('User data exported successfully');
    } catch (error: unknown) {
      setError('Failed to export user data');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserStatusBadge = () => {
    if (!user) return null;

    if (!user.is_active) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Inactive</span>;
    }
    if (user.is_locked) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Locked</span>;
    }
    if (!user.is_approved) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Pending Approval</span>;
    }
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Active</span>;
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'compliance', name: 'Compliance', icon: '📋', restricted: !canViewCompliance },
    { id: 'actions', name: 'Action History', icon: '📝', restricted: !canViewCompliance },
  ];

  if (!canManageUsers && !canViewCompliance) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">🚫 Insufficient Permissions</h3>
          <p className="mb-4">You don&apos;t have permission to view user details.</p>
          <p className="text-sm">Required: User management or audit access</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading user details...</span>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="mt-4">
          <FormButton
            type="button"
            onClick={() => router.back()}
            variant="outline"
          >
            ← Back to Users
          </FormButton>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FormButton
              type="button"
              onClick={() => router.back()}
              variant="outline"
              size="sm"
            >
              ← Back
            </FormButton>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.profile.first_name && user.profile.last_name 
                  ? `${user.profile.first_name} ${user.profile.last_name}`
                  : user.username
                }
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-sm text-gray-600">{user.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {user.role}
                </span>
                {getUserStatusBadge()}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FormButton
              type="button"
              onClick={exportUserData}
              variant="outline"
              size="sm"
            >
              Export Data
            </FormButton>
            {canManageUsers && (
              <FormButton
                type="button"
                onClick={impersonateUser}
                variant="outline"
                size="sm"
              >
                Impersonate
              </FormButton>
            )}
          </div>
        </div>
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

      {/* Quick Actions */}
      {canManageUsers && (
        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Add a note for this action (optional)"
                rows={2}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {!user.is_approved && (
                <>
                  <FormButton
                    type="button"
                    onClick={() => handleUserAction('approve')}
                    isLoading={isProcessing}
                    variant="success"
                    size="sm"
                  >
                    Approve
                  </FormButton>
                  <FormButton
                    type="button"
                    onClick={() => handleUserAction('reject')}
                    isLoading={isProcessing}
                    variant="danger"
                    size="sm"
                  >
                    Reject
                  </FormButton>
                </>
              )}
              {user.is_active ? (
                <FormButton
                  type="button"
                  onClick={() => handleUserAction('deactivate')}
                  isLoading={isProcessing}
                  variant="danger"
                  size="sm"
                >
                  Deactivate
                </FormButton>
              ) : (
                <FormButton
                  type="button"
                  onClick={() => handleUserAction('activate')}
                  isLoading={isProcessing}
                  variant="success"
                  size="sm"
                >
                  Activate
                </FormButton>
              )}
              {user.is_locked ? (
                <FormButton
                  type="button"
                  onClick={() => handleUserAction('unlock')}
                  isLoading={isProcessing}
                  variant="success"
                  size="sm"
                >
                  Unlock
                </FormButton>
              ) : (
                <FormButton
                  type="button"
                  onClick={() => handleUserAction('lock')}
                  isLoading={isProcessing}
                  variant="danger"
                  size="sm"
                >
                  Lock Account
                </FormButton>
              )}
              <FormButton
                type="button"
                onClick={() => handleUserAction('reset-password')}
                isLoading={isProcessing}
                variant="outline"
                size="sm"
              >
                Reset Password
              </FormButton>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Information */}
      <div className="bg-white shadow rounded-lg">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.filter(tab => !tab.restricted).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Username</dt>
                      <dd className="text-sm text-gray-900">{user.username}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="text-sm text-gray-900">{user.profile.phone_number || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date Joined</dt>
                      <dd className="text-sm text-gray-900">{formatDate(user.date_joined)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                      <dd className="text-sm text-gray-900">{user.last_login ? formatDate(user.last_login) : 'Never'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Professional Information</h4>
                  <dl className="space-y-2">
                    {user.profile.institution && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Institution</dt>
                        <dd className="text-sm text-gray-900">{user.profile.institution}</dd>
                      </div>
                    )}
                    {user.profile.company_name && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Company</dt>
                        <dd className="text-sm text-gray-900">{user.profile.company_name}</dd>
                      </div>
                    )}
                    {user.profile.license_number && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">License Number</dt>
                        <dd className="text-sm text-gray-900">{user.profile.license_number}</dd>
                      </div>
                    )}
                    {user.profile.npi && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">NPI</dt>
                        <dd className="text-sm text-gray-900">{user.profile.npi}</dd>
                      </div>
                    )}
                    {user.profile.specialization && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Specialization</dt>
                        <dd className="text-sm text-gray-900">{user.profile.specialization}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Credentials Verified</dt>
                      <dd className="text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.profile.verified_credentials 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.profile.verified_credentials ? 'Verified' : 'Pending Verification'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {user.profile.documents_submitted && user.profile.documents_submitted.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Submitted Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {user.profile.documents_submitted.map((doc, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                        <svg className="h-4 w-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Account Security</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Failed Login Attempts</dt>
                      <dd className="text-sm text-gray-900">{user.failed_login_attempts}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                      <dd className="text-sm">{getUserStatusBadge()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Registration IP</dt>
                      <dd className="text-sm text-gray-900">{user.profile.registration_ip || 'Not recorded'}</dd>
                    </div>
                    {user.profile.days_until_verification_required !== null && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
                        <dd className="text-sm">
                        const days = user.profile.days_until_verification_required;
                          {user.profile.days_until_verification_required !== undefined && user.profile.days_until_verification_required <= 0 ? (
                            <span className="text-red-600">Verification overdue</span>
                          ) : (user.profile.days_until_verification_required ?? Infinity) <= 7 ? (
                            <span className="text-yellow-600">Due in {user.profile.days_until_verification_required} days</span>
                          ) : (
                            <span className="text-green-600">Up to date</span>
                          )}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {user.emergency_access_events && user.emergency_access_events.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Emergency Access Events</h4>
                    <div className="space-y-2">
                      {user.emergency_access_events.slice(0, 5).map((event, index) => (
                        <div key={index} className={`p-3 rounded border ${
                          event.reviewed ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">{event.reason}</p>
                              <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                              <p className="text-xs text-gray-500">Duration: {event.duration_hours} hours</p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              event.reviewed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {event.reviewed ? 'Reviewed' : 'Pending Review'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && canViewCompliance && (
            <div className="space-y-6">
              {user.consent_records && user.consent_records.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Consent Records</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signed</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {user.consent_records.map((record, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.document_type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.version}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(record.signed_at)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.expires_at ? formatDate(record.expires_at) : 'No expiry'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.ip_address}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {user.audit_logs && user.audit_logs.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Recent Audit Logs</h4>
                  <div className="space-y-2">
                    {user.audit_logs.slice(0, 10).map((log, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">{log.action}</p>
                            <p className="text-xs text-gray-500">{formatDate(log.timestamp)}</p>
                            {log.ip_address && (
                              <p className="text-xs text-gray-500">IP: {log.ip_address}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && canViewCompliance && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Administrative Actions</h4>
              {actionLogs.length === 0 ? (
                <p className="text-sm text-gray-500">No administrative actions recorded.</p>
              ) : (
                <div className="space-y-2">
                  {actionLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-gray-50 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-sm text-gray-600">{log.details}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(log.timestamp)} by {log.admin_user}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
