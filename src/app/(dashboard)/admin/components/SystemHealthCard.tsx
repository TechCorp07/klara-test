// src/app/(dashboard)/admin/components/SystemHealthCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical';
  uptime_percentage: number;
  response_time_ms: number;
  active_sessions: number;
  database_health: {
    status: 'healthy' | 'slow' | 'error';
    connection_count: number;
    query_time_avg: number;
    slow_queries: number;
  };
  redis_health: {
    status: 'healthy' | 'slow' | 'error';
    memory_usage: number;
    cache_hit_ratio: number;
  };
  email_service: {
    status: 'healthy' | 'degraded' | 'error';
    queue_size: number;
    failed_emails_24h: number;
  };
  storage_health: {
    status: 'healthy' | 'warning' | 'full';
    usage_percentage: number;
    free_space_gb: number;
  };
  security_status: {
    failed_logins_rate: number;
    blocked_ips_count: number;
    suspicious_activity: number;
  };
  recent_alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
  last_backup: string;
  next_maintenance: string;
}

export default function SystemHealthCard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSystemHealth();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchSystemHealth = async () => {
    try {
      const response = await apiClient.get('/users/admin/system-health/');
      setHealth(response.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': case 'slow': case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'critical': case 'error': case 'full': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': case 'slow': case 'degraded': return '⚠️';
      case 'critical': case 'error': case 'full': return '🚨';
      default: return '❓';
    }
  };

  const formatUptime = (percentage: number) => {
    if (percentage >= 99.9) return 'Excellent';
    if (percentage >= 99.5) return 'Good';
    if (percentage >= 95) return 'Fair';
    return 'Poor';
  };

  const formatLastUpdate = () => {
    const diffMs = new Date().getTime() - lastUpdate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    return lastUpdate.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            <div className="h-3 bg-gray-200 rounded w-3/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>Failed to load system health</p>
          <button
            onClick={fetchSystemHealth}
            className="mt-2 text-sm text-blue-600 hover:text-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const criticalIssues = [
    health.overall_status === 'critical',
    health.database_health.status === 'error',
    health.email_service.status === 'error',
    health.storage_health.status === 'full',
    health.security_status.failed_logins_rate > 50,
  ].filter(Boolean).length;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">System Health</h3>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(health.overall_status)}`}>
            {getStatusIcon(health.overall_status)} {health.overall_status.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-xs px-2 py-1 rounded ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
          >
            {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
          </button>
          <button
            onClick={() => router.push('/dashboard/admin/monitoring')}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Details →
          </button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalIssues > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>{criticalIssues}</strong> critical issue{criticalIssues !== 1 ? 's' : ''} require immediate attention
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{health.uptime_percentage}%</p>
          <p className="text-sm text-gray-500">Uptime ({formatUptime(health.uptime_percentage)})</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{health.response_time_ms}ms</p>
          <p className="text-sm text-gray-500">Avg Response Time</p>
        </div>
      </div>

      {/* Service Status */}
      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-medium text-gray-700">Service Status</h4>
        
        {/* Database */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{getStatusIcon(health.database_health.status)}</span>
            <span className="text-sm text-gray-900">Database</span>
          </div>
          <div className="text-right">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(health.database_health.status)}`}>
              {health.database_health.status}
            </span>
            <p className="text-xs text-gray-500">{health.database_health.connection_count} connections</p>
          </div>
        </div>

        {/* Redis Cache */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{getStatusIcon(health.redis_health.status)}</span>
            <span className="text-sm text-gray-900">Cache</span>
          </div>
          <div className="text-right">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(health.redis_health.status)}`}>
              {health.redis_health.status}
            </span>
            <p className="text-xs text-gray-500">{health.redis_health.cache_hit_ratio}% hit ratio</p>
          </div>
        </div>

        {/* Email Service */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{getStatusIcon(health.email_service.status)}</span>
            <span className="text-sm text-gray-900">Email</span>
          </div>
          <div className="text-right">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(health.email_service.status)}`}>
              {health.email_service.status}
            </span>
            <p className="text-xs text-gray-500">{health.email_service.queue_size} queued</p>
          </div>
        </div>

        {/* Storage */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{getStatusIcon(health.storage_health.status)}</span>
            <span className="text-sm text-gray-900">Storage</span>
          </div>
          <div className="text-right">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(health.storage_health.status)}`}>
              {health.storage_health.usage_percentage}% used
            </span>
            <p className="text-xs text-gray-500">{health.storage_health.free_space_gb}GB free</p>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      {health.recent_alerts.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Alerts</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {health.recent_alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-start space-x-2 text-xs">
                <span className={
                  alert.type === 'error' ? '🔴' :
                  alert.type === 'warning' ? '🟡' : '🔵'
                }></span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 truncate">{alert.message}</p>
                  <p className="text-gray-500">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                </div>
                {alert.resolved && <span className="text-green-600">✓</span>}
              </div>
            ))}
          </div>
          {health.recent_alerts.length > 3 && (
            <button
              onClick={() => router.push('/dashboard/admin/monitoring')}
              className="text-xs text-blue-600 hover:text-blue-500 mt-2"
            >
              View all {health.recent_alerts.length} alerts →
            </button>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between text-xs text-gray-500">
          <div>
            <p>Last backup: {new Date(health.last_backup).toLocaleDateString()}</p>
            <p>Active sessions: {health.active_sessions}</p>
          </div>
          <div className="text-right">
            <p>Updated: {formatLastUpdate()}</p>
            <p>Next maintenance: {new Date(health.next_maintenance).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}