// src/app/(dashboard)/admin/monitoring/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import { FormButton } from '@/components/ui/form-button';
import { Spinner } from '@/components/ui/spinner';

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'security';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: any;
}

interface SystemEvent {
  id: string;
  event_type: string;
  user_id?: number;
  username?: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  metadata?: any;
}

interface RealTimeMetrics {
  active_users: number;
  requests_per_minute: number;
  error_rate: number;
  average_response_time: number;
  database_connections: number;
  memory_usage: number;
  cpu_usage: number;
  disk_usage: number;
  queue_size: number;
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
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'alerts' | 'events' | 'metrics'>('alerts');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const canViewMonitoring = permissions?.has_admin_access || false;

  useEffect(() => {
    if (canViewMonitoring) {
      fetchData();
      
      if (autoRefresh) {
        intervalRef.current = setInterval(fetchData, 30000); // Refresh every 30 seconds
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [canViewMonitoring, autoRefresh]);

  const fetchData = async () => {
    try {
      const [alertsRes, eventsRes, metricsRes] = await Promise.all([
        apiClient.get('/api/admin/monitoring/alerts/'),
        apiClient.get('/api/admin/monitoring/events/'),
        apiClient.get('/api/admin/monitoring/metrics/')
      ]);

      setAlerts(alertsRes.data.results || []);
      setEvents(eventsRes.data.results || []);
      setMetrics(metricsRes.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      setError('Failed to load monitoring data');
    } finally {
      setIsLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await apiClient.post(`/api/admin/monitoring/alerts/${alertId}/acknowledge/`);
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
      setSuccess('Alert acknowledged');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to acknowledge alert');
    }
  };

  const clearAllAlerts = async () => {
    try {
      await apiClient.post('/api/admin/monitoring/alerts/clear-all/');
      setAlerts(prev => prev.map(alert => ({ ...alert, acknowledged: true })));
      setSuccess('All alerts cleared');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to clear alerts');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'security':
        return (
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMetricStatus = (value: number, type: string) => {
    switch (type) {
      case 'error_rate':
        if (value < 1) return 'text-green-600';
        if (value < 5) return 'text-yellow-600';
        return 'text-red-600';
      case 'response_time':
        if (value < 200) return 'text-green-600';
        if (value < 500) return 'text-yellow-600';
        return 'text-red-600';
      case 'usage':
        if (value < 70) return 'text-green-600';
        if (value < 90) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!canViewMonitoring) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">🚫 Insufficient Permissions</h3>
          <p className="mb-4">You don't have permission to view system monitoring.</p>
          <p className="text-sm">Required: Admin access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
            <p className="mt-1 text-sm text-gray-600">
              Real-time system alerts, events, and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Auto-refresh</label>
            </div>
            <FormButton
              type="button"
              onClick={fetchData}
              isLoading={isLoading}
              variant="outline"
              size="sm"
            >
              Refresh
            </FormButton>
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

      {/* Real-time Metrics Overview */}
      {metrics && (
        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Real-time Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.active_users}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Requests/min</p>
              <p className="text-2xl font-bold text-green-600">{metrics.requests_per_minute}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Error Rate</p>
              <p className={`text-2xl font-bold ${getMetricStatus(metrics.error_rate, 'error_rate')}`}>
                {metrics.error_rate}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Response Time</p>
              <p className={`text-2xl font-bold ${getMetricStatus(metrics.average_response_time, 'response_time')}`}>
                {metrics.average_response_time}ms
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Memory Usage</p>
              <p className={`text-2xl font-bold ${getMetricStatus(metrics.memory_usage, 'usage')}`}>
                {metrics.memory_usage}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'alerts', name: 'System Alerts', count: alerts.filter(a => !a.acknowledged).length },
              { id: 'events', name: 'System Events', count: events.length },
              { id: 'metrics', name: 'Performance', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
                {alerts.some(alert => !alert.acknowledged) && (
                  <FormButton
                    type="button"
                    onClick={clearAllAlerts}
                    variant="outline"
                    size="sm"
                  >
                    Clear All
                  </FormButton>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Spinner size="lg" />
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
                  <p className="mt-1 text-sm text-gray-500">All systems are operating normally.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)} ${
                        alert.acknowledged ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getTypeIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium">{alert.title}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                {alert.severity}
                              </span>
                              {alert.acknowledged && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Acknowledged
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm">{alert.message}</p>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                              <span>Source: {alert.source}</span>
                              <span>Time: {formatTimestamp(alert.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <FormButton
                            type="button"
                            onClick={() => acknowledgeAlert(alert.id)}
                            variant="outline"
                            size="sm"
                          >
                            Acknowledge
                          </FormButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Recent System Events</h3>

              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Spinner size="lg" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No recent events.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{event.event_type}</span>
                            {event.username && (
                              <span className="text-sm text-gray-500">by {event.username}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                            <span>{formatTimestamp(event.timestamp)}</span>
                            {event.ip_address && <span>IP: {event.ip_address}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && metrics && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Detailed Performance Metrics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800">System Resources</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'CPU Usage', value: metrics.cpu_usage, unit: '%', type: 'usage' },
                      { label: 'Memory Usage', value: metrics.memory_usage, unit: '%', type: 'usage' },
                      { label: 'Disk Usage', value: metrics.disk_usage, unit: '%', type: 'usage' },
                    ].map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{metric.label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                metric.value < 70 ? 'bg-green-500' : 
                                metric.value < 90 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${metric.value}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${getMetricStatus(metric.value, metric.type)}`}>
                            {metric.value}{metric.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800">Application Metrics</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Active Users', value: metrics.active_users, unit: '', type: 'count' },
                      { label: 'Requests per Minute', value: metrics.requests_per_minute, unit: '', type: 'count' },
                      { label: 'Database Connections', value: metrics.database_connections, unit: '', type: 'count' },
                      { label: 'Queue Size', value: metrics.queue_size, unit: '', type: 'count' },
                    ].map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{metric.label}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {metric.value}{metric.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
