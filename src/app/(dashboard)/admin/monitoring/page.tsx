// src/app/(dashboard)/admin/monitoring/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import { FormButton } from '@/components/ui/form-button';
import { Spinner } from '@/components/ui/spinner';
import { SystemMonitoringData, SecurityAlert, SystemHealthData } from '@/types/admin.types';

interface MonitoringData {
  system_health: SystemHealthData;
  performance_metrics: SystemMonitoringData[];
  security_alerts: SecurityAlert[];
  recent_activities: Array<{
    id: string;
    timestamp: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
  }>;
}

export default function AdminMonitoringPage() {
  return (
    <AdminGuard>
      <MonitoringInterface />
    </AdminGuard>
  );
}

function MonitoringInterface() {
  const { permissions } = usePermissions();
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'security' | 'logs'>('overview');

  const canViewMonitoring = permissions?.has_admin_access || false;

  useEffect(() => {
    if (canViewMonitoring) {
      fetchMonitoringData();
      
      if (autoRefresh) {
        const interval = setInterval(fetchMonitoringData, refreshInterval * 1000);
        return () => clearInterval(interval);
      }
    }
  }, [canViewMonitoring, autoRefresh, refreshInterval]);

  const fetchMonitoringData = async () => {
    try {
      const [healthResponse, metricsResponse, alertsResponse] = await Promise.all([
        apiClient.get('/users/admin/system-health/'),
        apiClient.get('/users/admin/performance-metrics/'),
        apiClient.get('/users/admin/security-alerts/?status=open&limit=10'),
      ]);

      setMonitoringData({
        system_health: healthResponse.data,
        performance_metrics: metricsResponse.data.results || [],
        security_alerts: alertsResponse.data.results || [],
        recent_activities: healthResponse.data.recent_alerts || [],
      });
      setError(null);
    } catch (error: any) {
      console.error('Failed to fetch monitoring data:', error);
      setError('Failed to load monitoring data');
    } finally {
      setIsLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await apiClient.patch(`/users/admin/security-alerts/${alertId}/`, {
        status: 'resolved',
        resolution_notes: 'Resolved from monitoring dashboard'
      });
      await fetchMonitoringData();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'critical': case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  if (!canViewMonitoring) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You don't have permission to view system monitoring.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-500">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error || !monitoringData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Failed to load monitoring data'}</p>
        <FormButton onClick={fetchMonitoringData}>
          Retry
        </FormButton>
      </div>
    );
  }

  const { system_health, performance_metrics, security_alerts, recent_activities } = monitoringData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">Real-time system health and performance monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Refresh:</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 text-sm rounded ${
              autoRefresh 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
          </button>
          <FormButton onClick={fetchMonitoringData} size="sm">
            Refresh Now
          </FormButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'performance', label: 'Performance' },
            { id: 'security', label: 'Security' },
            { id: 'logs', label: 'Activity Logs' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Overall Status</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(system_health.overall_status)}`}>
                  {system_health.overall_status.toUpperCase()}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm font-medium">{system_health.uptime_percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-medium">{system_health.response_time_ms}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Sessions</span>
                  <span className="text-sm font-medium">{system_health.active_sessions}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Service Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(system_health.database_health.status)}`}>
                    {system_health.database_health.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cache</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(system_health.redis_health.status)}`}>
                    {system_health.redis_health.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(system_health.email_service.status)}`}>
                    {system_health.email_service.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(system_health.storage_health.status)}`}>
                    {system_health.storage_health.usage_percentage}% used
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Failed Logins</span>
                  <span className="text-sm font-medium">{system_health.security_status.failed_logins_rate}/hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Blocked IPs</span>
                  <span className="text-sm font-medium">{system_health.security_status.blocked_ips_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Alerts</span>
                  <span className="text-sm font-medium text-red-600">{security_alerts.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Alerts */}
          {security_alerts.filter(alert => alert.severity === 'critical').length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-red-900 mb-3">🚨 Critical Security Alerts</h3>
              <div className="space-y-2">
                {security_alerts.filter(alert => alert.severity === 'critical').map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded border">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-xs text-gray-600">{new Date(alert.detected_at).toLocaleString()}</p>
                    </div>
                    <FormButton
                      onClick={() => resolveAlert(alert.id)}
                      size="sm"
                      variant="danger"
                    >
                      Resolve
                    </FormButton>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
            {performance_metrics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {performance_metrics.slice(-1).map((metric, index) => (
                  <div key={index} className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">{metric.cpu_usage}%</p>
                      <p className="text-sm text-gray-500">CPU Usage</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">{metric.memory_usage}%</p>
                      <p className="text-sm text-gray-500">Memory Usage</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">{metric.disk_usage}%</p>
                      <p className="text-sm text-gray-500">Disk Usage</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">{metric.active_users}</p>
                      <p className="text-sm text-gray-500">Active Users</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No performance data available</p>
            )}
          </div>

          {/* Response Time Metrics */}
          {performance_metrics.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Response Time Distribution</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-semibold text-green-600">{performance_metrics[performance_metrics.length - 1]?.response_times?.p50 || 'N/A'}ms</p>
                  <p className="text-sm text-gray-500">50th Percentile</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-yellow-600">{performance_metrics[performance_metrics.length - 1]?.response_times?.p95 || 'N/A'}ms</p>
                  <p className="text-sm text-gray-500">95th Percentile</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-red-600">{performance_metrics[performance_metrics.length - 1]?.response_times?.p99 || 'N/A'}ms</p>
                  <p className="text-sm text-gray-500">99th Percentile</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Security Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Active Security Alerts</h3>
            </div>
            {security_alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.586-3H15m0 0l3 3.008M15 5.992V3a1 1 0 00-1-1H5a1 1 0 00-1 1v12a1 1 0 001 1h9m0-12a1 1 0 011 1v8.008" />
                </svg>
                <p>No active security alerts</p>
                <p className="text-sm">System security is operating normally</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {security_alerts.map((alert) => (
                  <div key={alert.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Detected: {new Date(alert.detected_at).toLocaleString()}</span>
                          {alert.source_ip && <span>IP: {alert.source_ip}</span>}
                          {alert.affected_user && <span>User: {alert.affected_user}</span>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <FormButton
                          onClick={() => resolveAlert(alert.id)}
                          size="sm"
                          variant="success"
                        >
                          Resolve
                        </FormButton>
                        <button className="text-blue-600 hover:text-blue-500 text-sm">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent System Activity</h3>
            </div>
            {recent_activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity to display</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recent_activities.map((activity) => (
                  <div key={activity.id} className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        activity.severity === 'critical' ? 'bg-red-500' :
                        activity.severity === 'high' ? 'bg-orange-500' :
                        activity.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>{new Date(activity.timestamp).toLocaleString()}</span>
                          <span>Type: {activity.type}</span>
                          <span>Source: {activity.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}