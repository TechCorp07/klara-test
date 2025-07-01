// src/app/(dashboard)/admin/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import { FormButton } from '@/components/ui/form-button';
import { Spinner } from '@/components/ui/spinner';

interface ReportData {
  user_statistics: {
    total_users: number;
    users_by_role: Record<string, number>;
    new_registrations_last_30_days: number;
    active_users_last_30_days: number;
    pending_approvals: number;
  };
  security_metrics: {
    failed_login_attempts_last_24h: number;
    locked_accounts: number;
    emergency_access_events_last_7_days: number;
    users_requiring_verification: number;
  };
  compliance_data: {
    audit_log_entries_last_30_days: number;
    consent_renewals_due: number;
    document_versions: {
      current_privacy_notice: string;
      current_consent_form: string;
    };
  };
  system_performance: {
    average_response_time: number;
    uptime_percentage: number;
    error_rate_last_24h: number;
    database_health: string;
  };
  activity_trends: {
    daily_active_users: Array<{ date: string; count: number }>;
    monthly_registrations: Array<{ month: string; count: number }>;
    login_activity: Array<{ hour: number; count: number }>;
  };
}

interface ExportRequest {
  report_type: string;
  format: 'csv' | 'pdf' | 'xlsx';
  date_range: string;
  include_sections: string[];
}

export default function AdminReportsPage() {
  return (
    <AdminGuard>
      <ReportsInterface />
    </AdminGuard>
  );
}

function ReportsInterface() {
  const { permissions } = usePermissions();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'security' | 'compliance' | 'performance'>('overview');
  const [exportRequest, setExportRequest] = useState<ExportRequest>({
    report_type: 'comprehensive',
    format: 'pdf',
    date_range: '30_days',
    include_sections: ['users', 'security', 'compliance', 'performance']
  });

  const canViewReports = permissions?.has_admin_access || false;
  const canExportData = permissions?.has_system_settings_access || false;

  useEffect(() => {
    if (canViewReports) {
      fetchReportData();
    }
  }, [canViewReports]);

  const fetchReportData = async () => {
    try {
      const response = await apiClient.get('/api/admin/reports/dashboard-analytics/');
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      setError('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    if (!canExportData) return;

    setIsExporting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.post('/api/admin/reports/export/', exportRequest, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `admin-report-${new Date().toISOString().split('T')[0]}.${exportRequest.format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Report exported successfully');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'compliance', name: 'Compliance', icon: '🏥' },
    { id: 'performance', name: 'Performance', icon: '⚡' },
  ];

  if (!canViewReports) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">🚫 Insufficient Permissions</h3>
          <p className="mb-4">You don't have permission to view reports.</p>
          <p className="text-sm">Required: Admin access</p>
        </div>
      </div>
    );
  }

  if (isLoading || !reportData) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-600">
          Comprehensive system analytics and compliance reporting
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

      {/* Export Section */}
      {canExportData && (
        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Report Type</label>
              <select
                value={exportRequest.report_type}
                onChange={(e) => setExportRequest({...exportRequest, report_type: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="comprehensive">Comprehensive Report</option>
                <option value="user_summary">User Summary</option>
                <option value="security_audit">Security Audit</option>
                <option value="compliance_report">Compliance Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Format</label>
              <select
                value={exportRequest.format}
                onChange={(e) => setExportRequest({...exportRequest, format: e.target.value as any})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="xlsx">Excel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <select
                value={exportRequest.date_range}
                onChange={(e) => setExportRequest({...exportRequest, date_range: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="7_days">Last 7 Days</option>
                <option value="30_days">Last 30 Days</option>
                <option value="90_days">Last 90 Days</option>
                <option value="1_year">Last Year</option>
              </select>
            </div>
            <div className="flex items-end">
              <FormButton
                type="button"
                onClick={generateReport}
                isLoading={isExporting}
                className="w-full"
              >
                Export Report
              </FormButton>
            </div>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div className="bg-white shadow rounded-lg">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">System Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800">Total Users</h4>
                  <p className="text-2xl font-bold text-blue-900">{reportData.user_statistics.total_users}</p>
                  <p className="text-xs text-blue-600">+{reportData.user_statistics.new_registrations_last_30_days} this month</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800">Active Users (30d)</h4>
                  <p className="text-2xl font-bold text-green-900">{reportData.user_statistics.active_users_last_30_days}</p>
                  <p className="text-xs text-green-600">
                    {Math.round((reportData.user_statistics.active_users_last_30_days / reportData.user_statistics.total_users) * 100)}% of total
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800">Pending Approvals</h4>
                  <p className="text-2xl font-bold text-yellow-900">{reportData.user_statistics.pending_approvals}</p>
                  <p className="text-xs text-yellow-600">Require attention</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-800">System Uptime</h4>
                  <p className="text-2xl font-bold text-purple-900">{reportData.system_performance.uptime_percentage}%</p>
                  <p className="text-xs text-purple-600">Last 30 days</p>
                </div>
              </div>

              {/* Quick Alerts */}
              <div className="space-y-3">
                {reportData.security_metrics.emergency_access_events_last_7_days > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Emergency Access Events
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>
                            {reportData.security_metrics.emergency_access_events_last_7_days} emergency access events in the last 7 days require review.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {reportData.compliance_data.consent_renewals_due > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Consent Renewals Due
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            {reportData.compliance_data.consent_renewals_due} users have consent renewals due.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">User Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">Users by Role</h4>
                  <div className="space-y-2">
                    {Object.entries(reportData.user_statistics.users_by_role).map(([role, count]) => {
                      const percentage = (count / reportData.user_statistics.total_users) * 100;
                      return (
                        <div key={role} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{role}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-12">{count}</span>
                            <span className="text-xs text-gray-500 w-12">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">Registration Trends</h4>
                  <div className="space-y-3">
                    {reportData.activity_trends.monthly_registrations.slice(-6).map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{month.month}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min((month.count / Math.max(...reportData.activity_trends.monthly_registrations.map(m => m.count))) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{month.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Security Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800">Failed Logins (24h)</h4>
                  <p className="text-2xl font-bold text-red-900">{reportData.security_metrics.failed_login_attempts_last_24h}</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-orange-800">Locked Accounts</h4>
                  <p className="text-2xl font-bold text-orange-900">{reportData.security_metrics.locked_accounts}</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800">Emergency Access (7d)</h4>
                  <p className="text-2xl font-bold text-yellow-900">{reportData.security_metrics.emergency_access_events_last_7_days}</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-800">Verification Required</h4>
                  <p className="text-2xl font-bold text-purple-900">{reportData.security_metrics.users_requiring_verification}</p>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">Login Activity by Hour</h4>
                <div className="grid grid-cols-12 gap-1">
                  {reportData.activity_trends.login_activity.map((hour) => (
                    <div key={hour.hour} className="text-center">
                      <div 
                        className="bg-blue-500 rounded-t"
                        style={{ 
                          height: `${Math.max((hour.count / Math.max(...reportData.activity_trends.login_activity.map(h => h.count))) * 40, 2)}px` 
                        }}
                      ></div>
                      <span className="text-xs text-gray-500">{hour.hour}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">HIPAA Compliance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800">Audit Entries (30d)</h4>
                  <p className="text-2xl font-bold text-blue-900">{reportData.compliance_data.audit_log_entries_last_30_days}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800">Privacy Notice</h4>
                  <p className="text-lg font-bold text-green-900">{reportData.compliance_data.document_versions.current_privacy_notice}</p>
                  <p className="text-xs text-green-600">Current version</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-800">Consent Form</h4>
                  <p className="text-lg font-bold text-purple-900">{reportData.compliance_data.document_versions.current_consent_form}</p>
                  <p className="text-xs text-purple-600">Current version</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-yellow-800 mb-2">Compliance Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Audit log retention</span>
                    <span className="text-sm font-medium text-green-600">✓ Compliant</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Emergency access procedures</span>
                    <span className="text-sm font-medium text-green-600">✓ Compliant</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Document version control</span>
                    <span className="text-sm font-medium text-green-600">✓ Compliant</span>
                  </div>
                  {reportData.compliance_data.consent_renewals_due > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">Consent renewals</span>
                      <span className="text-sm font-medium text-yellow-600">⚠ {reportData.compliance_data.consent_renewals_due} due</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">System Performance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800">Avg Response Time</h4>
                  <p className="text-2xl font-bold text-green-900">{reportData.system_performance.average_response_time}ms</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800">Uptime</h4>
                  <p className="text-2xl font-bold text-blue-900">{reportData.system_performance.uptime_percentage}%</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800">Error Rate (24h)</h4>
                  <p className="text-2xl font-bold text-yellow-900">{reportData.system_performance.error_rate_last_24h}%</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-800">Database Health</h4>
                  <p className="text-lg font-bold text-purple-900 capitalize">{reportData.system_performance.database_health}</p>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">Daily Active Users (Last 30 Days)</h4>
                <div className="flex items-end space-x-1 h-32">
                  {reportData.activity_trends.daily_active_users.slice(-30).map((day, index) => {
                    const maxCount = Math.max(...reportData.activity_trends.daily_active_users.map(d => d.count));
                    const height = (day.count / maxCount) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="bg-blue-500 w-full rounded-t"
                          style={{ height: `${Math.max(height, 2)}%` }}
                          title={`${day.date}: ${day.count} users`}
                        ></div>
                        {index % 5 === 0 && (
                          <span className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                            {day.date.split('-')[2]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
