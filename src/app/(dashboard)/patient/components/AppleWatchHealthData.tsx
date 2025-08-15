// src/app/(dashboard)/patient/components/AppleWatchHealthData.tsx
'use client';

import { useState, useEffect } from 'react';
import { patientService } from '@/lib/api/services/patient.service';

interface HealthMetric {
  type: string;
  value: number;
  unit: string;
  measured_at: string;
  source: 'apple_watch' | 'iphone';
}

export function AppleWatchHealthData() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    setIsLoading(true);
    try {
      const data = await patientService.getWearableData('apple_health');
      setMetrics(data.measurements);
      setLastSync(data.last_sync);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncNow = async () => {
    setIsSyncing(true);
    try {
      const result = await patientService.syncWearableData('apple_health');
      if (result.success) {
        await fetchHealthData(); // Refresh data after sync
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatMetricType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="border rounded p-3">
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Apple Watch Health Data</h3>
        <button 
          onClick={syncNow}
          disabled={isSyncing}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
      
      {metrics.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No health data available.</p>
          <p className="text-sm mt-1">Connect your Apple Watch and sync data to see metrics here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.slice(0, 8).map((metric, index) => (
            <div key={index} className="border rounded p-3 hover:bg-gray-50">
              <div className="text-sm text-gray-600 mb-1">
                {formatMetricType(metric.type)}
              </div>
              <div className="text-xl font-semibold text-gray-900">
                {metric.value} {metric.unit}
              </div>
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>{new Date(metric.measured_at).toLocaleString()}</span>
                <span className="text-blue-600">⌚ {metric.source === 'apple_watch' ? 'Watch' : 'iPhone'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {lastSync && (
        <div className="mt-4 pt-4 border-t text-sm text-gray-600 flex items-center justify-between">
          <span>Last sync: {new Date(lastSync).toLocaleString()}</span>
          <span className="text-green-600">● Connected</span>
        </div>
      )}
    </div>
  );
}