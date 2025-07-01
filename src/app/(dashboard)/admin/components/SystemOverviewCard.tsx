// src/app/(dashboard)/admin/components/SystemOverviewCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import React from 'react';

interface SystemMetrics {
  total_users: number;
  active_sessions: number;
  pending_approvals: number;
  failed_logins_24h: number;
  emergency_access_events: number;
  system_uptime: string;
  database_health: 'healthy' | 'warning' | 'critical';
  last_backup: string;
}

export default function SystemOverviewCard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      const response = await apiClient.get('/api/admin/system-metrics/');
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">System Overview</h3>
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(metrics.database_health)}`}>
            {metrics.database_health.charAt(0).toUpperCase() + metrics.database_health.slice(1)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-semibold text-gray-900">{metrics.total_users.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Sessions</p>
            <p className="text-2xl font-semibold text-green-600">{metrics.active_sessions}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">System Uptime</p>
            <p className="text-sm font-medium text-gray-900">{metrics.system_uptime}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
            <p className="text-2xl font-semibold text-red-600">{metrics.pending_approvals}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Failed Logins (24h)</p>
            <p className="text-2xl font-semibold text-orange-600">{metrics.failed_logins_24h}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Last Backup</p>
            <p className="text-sm font-medium text-gray-900">{metrics.last_backup}</p>
          </div>
        </div>
      </div>

      {metrics.emergency_access_events > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>{metrics.emergency_access_events}</strong> emergency access events require review
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
