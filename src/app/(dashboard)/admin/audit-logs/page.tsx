// src/app/(dashboard)/admin/audit-logs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import { FormButton } from '@/components/ui/form-button';
import { Spinner } from '@/components/ui/spinner';
import Pagination from '../common/Pagination';

interface AuditLog {
  id: string;
  timestamp: string;
  user_id?: number;
  user_email?: string;
  user_role?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address: string;
  user_agent?: string;
  request_data?: any;
  response_status?: number;
  changes?: {
    before?: any;
    after?: any;
  };
  compliance_event: boolean;
  hipaa_event: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

interface AuditFilters {
  page: number;
  page_size: number;
  search: string;
  user_email: string;
  action: string;
  resource_type: string;
  risk_level: string;
  compliance_only: boolean;
  hipaa_only: boolean;
  date_from: string;
  date_to: string;
  ip_address: string;
  ordering: string;
}

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'user_created', label: 'User Created' },
  { value: 'user_updated', label: 'User Updated' },
  { value: 'user_approved', label: 'User Approved' },
  { value: 'user_rejected', label: 'User Rejected' },
  { value: 'user_locked', label: 'User Locked' },
  { value: 'password_changed', label: 'Password Changed' },
  { value: 'permission_granted', label: 'Permission Granted' },
  { value: 'data_exported', label: 'Data Exported' },
  { value: 'emergency_access', label: 'Emergency Access' },
  { value: 'hipaa_violation', label: 'HIPAA Event' },
  { value: 'security_alert', label: 'Security Alert' },
];

const RESOURCE_OPTIONS = [
  { value: '', label: 'All Resources' },
  { value: 'user', label: 'User' },
  { value: 'profile', label: 'Profile' },
  { value: 'consent', label: 'Consent Record' },
  { value: 'document', label: 'Document' },
  { value: 'system_settings', label: 'System Settings' },
  { value: 'audit_log', label: 'Audit Log' },
];

const RISK_LEVEL_OPTIONS = [
  { value: '', label: 'All Risk Levels' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function AdminAuditLogsPage() {
  return (
    <AdminGuard>
      <AuditLogsInterface />
    </AdminGuard>
  );
}

function AuditLogsInterface() {
  const { permissions } = usePermissions();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });
  const [filters, setFilters] = useState<AuditFilters>({
    page: parseInt(searchParams.get('page') || '1'),
    page_size: parseInt(searchParams.get('page_size') || '50'),
    search: searchParams.get('search') || '',
    user_email: searchParams.get('user_email') || '',
    action: searchParams.get('action') || '',
    resource_type: searchParams.get('resource_type') || '',
    risk_level: searchParams.get('risk_level') || '',
    compliance_only: searchParams.get('compliance_only') === 'true',
    hipaa_only: searchParams.get('hipaa_only') === 'true',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
    ip_address: searchParams.get('ip_address') || '',
    ordering: searchParams.get('ordering') || '-timestamp',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const canViewAudit = permissions?.has_audit_access || false;
  const canExportAudit = permissions?.has_admin_access || false;

  useEffect(() => {
    if (canViewAudit) {
      fetchAuditLogs();
    }
  }, [filters, canViewAudit]);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== false && value !== 0) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/users/admin/audit-logs/?${params}`);
      setLogs(response.data.results || []);
      setPagination({
        count: response.data.count || 0,
        next: response.data.next,
        previous: response.data.previous,
      });
      setError(null);
    } catch (error: any) {
      console.error('Failed to fetch audit logs:', error);
      setError('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<AuditFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== '' && value !== false && value !== 0) {
        params.set(key, value.toString());
      }
    });
    router.push(`/dashboard/admin/audit-logs?${params}`);
  };

  const exportAuditLogs = async (format: 'csv' | 'pdf' | 'xlsx') => {
    if (!canExportAudit) return;

    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== false && value !== 0 && key !== 'page' && key !== 'page_size') {
          params.append(key, value.toString());
        }
      });
      params.append('format', format);

      const response = await apiClient.get(`/users/admin/audit-logs/export/?${params}`, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export audit logs:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!canViewAudit) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You don't have permission to view audit logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Track all system activities and compliance events</p>
        </div>
        {canExportAudit && (
          <div className="flex items-center space-x-2">
            <FormButton
              onClick={() => exportAuditLogs('csv')}
              loading={isExporting}
              variant="outline"
              size="sm"
            >
              Export CSV
            </FormButton>
            <FormButton
              onClick={() => exportAuditLogs('xlsx')}
              loading={isExporting}
              variant="outline"
              size="sm"
            >
              Export Excel
            </FormButton>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Logs</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search logs..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="text"
            placeholder="User email..."
            value={filters.user_email}
            onChange={(e) => updateFilters({ user_email: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={filters.action}
            onChange={(e) => updateFilters({ action: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ACTION_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <select
            value={filters.risk_level}
            onChange={(e) => updateFilters({ risk_level: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {RISK_LEVEL_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex space-x-2">
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => updateFilters({ date_from: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => updateFilters({ date_to: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filters.resource_type}
            onChange={(e) => updateFilters({ resource_type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {RESOURCE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="IP address..."
            value={filters.ip_address}
            onChange={(e) => updateFilters({ ip_address: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.compliance_only}
              onChange={(e) => updateFilters({ compliance_only: e.target.checked })}
              className="mr-2"
            />
            Compliance Events Only
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.hipaa_only}
              onChange={(e) => updateFilters({ hipaa_only: e.target.checked })}
              className="mr-2"
            />
            HIPAA Events Only
          </label>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center">
            <Spinner size="lg" />
            <p className="mt-2 text-gray-500">Loading audit logs...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={fetchAuditLogs}
              className="mt-2 text-blue-600 hover:text-blue-500"
            >
              Try Again
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No audit logs found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {logs.length} of {pagination.count} audit logs
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.user_email || 'System'}</div>
                        <div className="text-sm text-gray-500">{log.user_role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">{formatAction(log.action)}</span>
                          {log.compliance_event && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Compliance
                            </span>
                          )}
                          {log.hipaa_event && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              HIPAA
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.resource_type}
                        {log.resource_id && <div className="text-xs text-gray-500">ID: {log.resource_id}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(log.risk_level)}`}>
                          {log.risk_level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="hover:text-blue-500"
                        >
                          View Details
                        </button>
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

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Audit Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="text-sm text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-gray-900">{selectedLog.user_email || 'System'} ({selectedLog.user_role})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Action</label>
                  <p className="text-sm text-gray-900">{formatAction(selectedLog.action)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resource</label>
                  <p className="text-sm text-gray-900">
                    {selectedLog.resource_type}
                    {selectedLog.resource_id && ` (ID: ${selectedLog.resource_id})`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">IP Address</label>
                  <p className="text-sm text-gray-900">{selectedLog.ip_address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Risk Level</label>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(selectedLog.risk_level)}`}>
                    {selectedLog.risk_level.toUpperCase()}
                  </span>
                </div>
              </div>

              {selectedLog.user_agent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Agent</label>
                  <p className="text-sm text-gray-900 break-all">{selectedLog.user_agent}</p>
                </div>
              )}

              {selectedLog.request_data && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Request Data</label>
                  <pre className="text-sm text-gray-900 bg-gray-100 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.request_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.changes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Changes</label>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLog.changes.before && (
                      <div>
                        <h4 className="text-sm font-medium text-red-700">Before</h4>
                        <pre className="text-sm text-gray-900 bg-red-50 p-3 rounded overflow-x-auto">
                          {JSON.stringify(selectedLog.changes.before, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedLog.changes.after && (
                      <div>
                        <h4 className="text-sm font-medium text-green-700">After</h4>
                        <pre className="text-sm text-gray-900 bg-green-50 p-3 rounded overflow-x-auto">
                          {JSON.stringify(selectedLog.changes.after, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedLog.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-sm text-gray-900">{selectedLog.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}