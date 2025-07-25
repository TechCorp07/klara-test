// src/hooks/patient/usePatientVitals.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { patientService } from '@/lib/api/services/patient.service';
import type { VitalSigns } from '@/types/patient.types';

interface VitalTrend {
  vital_type: keyof VitalSigns;
  trend: 'increasing' | 'decreasing' | 'stable';
  change_percentage: number;
  period_days: number;
}

interface VitalAlert {
  id: string;
  vital_type: keyof VitalSigns;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recorded_date: string;
}

interface VitalStats {
  vital_type: keyof VitalSigns;
  current_value?: number;
  average: number;
  min: number;
  max: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  within_normal_range: boolean;
  last_recorded: string;
  records_count: number;
}

interface UsePatientVitalsOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  vitalTypes?: (keyof VitalSigns)[];
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UsePatientVitalsReturn {
  // Data
  vitals: VitalSigns[];
  latestVitals: VitalSigns | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Analytics
  trends: VitalTrend[];
  alerts: VitalAlert[];
  statistics: Record<string, VitalStats>;
  
  // Actions
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  addVitals: (vitalsData: Omit<VitalSigns, 'id' | 'patient' | 'recorded_by'>) => Promise<VitalSigns>;
  
  // Utilities
  getVitalsTrend: (vitalType: keyof VitalSigns) => 'increasing' | 'decreasing' | 'stable';
  getVitalsInRange: (startDate: string, endDate: string) => VitalSigns[];
  getVitalHistory: (vitalType: keyof VitalSigns, days?: number) => Array<{ date: string; value: number }>;
  isVitalInNormalRange: (vitalType: keyof VitalSigns, value: number) => boolean;
  
  // Filtering
  setDateRange: (start: string, end: string) => void;
  setVitalTypes: (types: (keyof VitalSigns)[]) => void;
}

export const usePatientVitals = (
  options: UsePatientVitalsOptions = {}
): UsePatientVitalsReturn => {
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [latestVitals, setLatestVitals] = useState<VitalSigns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [trends, setTrends] = useState<VitalTrend[]>([]);
  const [alerts, setAlerts] = useState<VitalAlert[]>([]);
  const [statistics, setStatistics] = useState<Record<string, VitalStats>>({});
  const [filters, setFilters] = useState(options);

  // Normal ranges for vitals (could be moved to constants)
  const normalRanges = useMemo(() => ({
    blood_pressure_systolic: { min: 90, max: 120 },
    blood_pressure_diastolic: { min: 60, max: 80 },
    heart_rate: { min: 60, max: 100 },
    temperature: { min: 97.0, max: 99.0 },
    oxygen_saturation: { min: 95, max: 100 },
    respiratory_rate: { min: 12, max: 20 },
    blood_glucose: { min: 70, max: 140 },
    weight: { min: 0, max: 1000 },
    height: { min: 0, max: 300 },
  }), []);

  // Fetch vitals data
  const fetchVitals = useCallback(async (append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);

      const params: Record<string, string | number | undefined> = {
        limit: options.limit || 30,
        offset: append ? vitals.length : 0,
        ordering: '-recorded_date',
      };

      // Apply date range filter
      if (filters.dateRange) {
        params.start_date = filters.dateRange.start;
        params.end_date = filters.dateRange.end;
      }

      const [vitalsData] = await Promise.all([
        patientService.getVitalSigns(params),
        patientService.getLatestVitals(),
      ]);

      if (append) {
        setVitals(prev => [...prev, ...vitalsData.results]);
      } else {
        setVitals(vitalsData.results);
      }
      
      setLatestVitals(vitalsData as unknown as VitalSigns);
      setHasMore(!!vitalsData.next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vital signs');
    } finally {
      setLoading(false);
    }
  }, [filters, vitals.length, options.limit]);

  // Calculate trends and statistics
  const calculateAnalytics = useCallback(() => {
    if (vitals.length < 2) return;

    const vitalTypes = filters.vitalTypes || [
      'blood_pressure_systolic',
      'blood_pressure_diastolic',
      'heart_rate',
      'temperature',
      'oxygen_saturation',
    ];

    const newTrends: VitalTrend[] = [];
    const newStatistics: Record<string, VitalStats> = {};
    const newAlerts: VitalAlert[] = [];

    vitalTypes.forEach(vitalType => {
      const vitalData = vitals
        .filter(v => v[vitalType] !== null && v[vitalType] !== undefined)
        .map(v => ({
          value: v[vitalType] as number,
          date: v.recorded_date,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (vitalData.length < 2) return;

      // Calculate trend
      const recentValues = vitalData.slice(-5); // Last 5 readings
      const olderValues = vitalData.slice(-10, -5); // Previous 5 readings

      const recentAvg = recentValues.reduce((sum, v) => sum + v.value, 0) / recentValues.length;
      const olderAvg = olderValues.length > 0 
        ? olderValues.reduce((sum, v) => sum + v.value, 0) / olderValues.length
        : recentAvg;

      const changePercentage = olderAvg !== 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (Math.abs(changePercentage) > 5) { // 5% threshold for trend detection
        trend = changePercentage > 0 ? 'increasing' : 'decreasing';
      }

      newTrends.push({
        vital_type: vitalType,
        trend,
        change_percentage: changePercentage,
        period_days: 30,
      });

      // Calculate statistics
      const values = vitalData.map(v => v.value);
      const currentValue = vitalData[vitalData.length - 1]?.value;
      const average = values.reduce((sum, v) => sum + v, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const normalRange = normalRanges[vitalType as keyof typeof normalRanges];
      const within_normal_range = currentValue !== undefined && normalRange
        ? currentValue >= normalRange.min && currentValue <= normalRange.max
        : true;

      newStatistics[vitalType] = {
        vital_type: vitalType,
        current_value: currentValue,
        average,
        min,
        max,
        trend,
        within_normal_range,
        last_recorded: vitalData[vitalData.length - 1]?.date || '',
        records_count: vitalData.length,
      };

      // Check for alerts
      if (currentValue !== undefined && normalRange) {
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
        let message = '';

        if (currentValue < normalRange.min) {
          const percentBelow = ((normalRange.min - currentValue) / normalRange.min) * 100;
          if (percentBelow > 20) {
            severity = 'critical';
            message = `${vitalType.replace('_', ' ')} is critically low`;
          } else if (percentBelow > 10) {
            severity = 'high';
            message = `${vitalType.replace('_', ' ')} is significantly low`;
          } else {
            severity = 'medium';
            message = `${vitalType.replace('_', ' ')} is below normal range`;
          }

          newAlerts.push({
            id: `${vitalType}-${Date.now()}`,
            vital_type: vitalType,
            value: currentValue,
            threshold: normalRange.min,
            severity,
            message,
            recorded_date: vitalData[vitalData.length - 1]?.date || '',
          });
        } else if (currentValue > normalRange.max) {
          const percentAbove = ((currentValue - normalRange.max) / normalRange.max) * 100;
          if (percentAbove > 20) {
            severity = 'critical';
            message = `${vitalType.replace('_', ' ')} is critically high`;
          } else if (percentAbove > 10) {
            severity = 'high';
            message = `${vitalType.replace('_', ' ')} is significantly high`;
          } else {
            severity = 'medium';
            message = `${vitalType.replace('_', ' ')} is above normal range`;
          }

          newAlerts.push({
            id: `${vitalType}-${Date.now()}`,
            vital_type: vitalType,
            value: currentValue,
            threshold: normalRange.max,
            severity,
            message,
            recorded_date: vitalData[vitalData.length - 1]?.date || '',
          });
        }
      }
    });

    setTrends(newTrends);
    setStatistics(newStatistics);
    setAlerts(newAlerts);
  }, [vitals, filters.vitalTypes, normalRanges]);

  // Initial fetch and when filters change
  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  // Calculate analytics when vitals change
  useEffect(() => {
    calculateAnalytics();
  }, [calculateAnalytics]);

  // Auto-refresh functionality
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(
        () => fetchVitals(),
        options.refreshInterval || 300000 // Default 5 minutes
      );
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval, fetchVitals]);

  // Load more vitals (pagination)
  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchVitals(true);
    }
  }, [hasMore, loading, fetchVitals]);

  // Add new vitals
  const addVitals = useCallback(async (vitalsData: Omit<VitalSigns, 'id' | 'patient' | 'recorded_by'>) => {
    try {
      const newVitals = await patientService.addVitalSigns(vitalsData);
      
      // Add to local state
      setVitals(prev => [newVitals, ...prev]);
      setLatestVitals(newVitals);
      
      return newVitals;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add vital signs');
    }
  }, []);

  // Utility functions
  const getVitalsTrend = useCallback((vitalType: keyof VitalSigns) => {
    const trend = trends.find(t => t.vital_type === vitalType);
    return trend?.trend || 'stable';
  }, [trends]);

  const getVitalsInRange = useCallback((startDate: string, endDate: string) => {
    return vitals.filter(vital => {
      const vitalDate = new Date(vital.recorded_date);
      return vitalDate >= new Date(startDate) && vitalDate <= new Date(endDate);
    });
  }, [vitals]);

  const getVitalHistory = useCallback((vitalType: keyof VitalSigns, days = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return vitals
      .filter(vital => {
        const vitalDate = new Date(vital.recorded_date);
        return vitalDate >= cutoffDate && vital[vitalType] !== null && vital[vitalType] !== undefined;
      })
      .map(vital => ({
        date: vital.recorded_date,
        value: vital[vitalType] as number,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [vitals]);

  const isVitalInNormalRange = useCallback((vitalType: keyof VitalSigns, value: number) => {
    const range = normalRanges[vitalType as keyof typeof normalRanges];
    if (!range) return true;
    return value >= range.min && value <= range.max;
  }, [normalRanges]);

  // Filter setters
  const setDateRange = useCallback((start: string, end: string) => {
    setFilters(prev => ({ ...prev, dateRange: { start, end } }));
  }, []);

  const setVitalTypes = useCallback((types: (keyof VitalSigns)[]) => {
    setFilters(prev => ({ ...prev, vitalTypes: types }));
  }, []);

  // Refetch data
  const refetch = useCallback(async () => {
    await fetchVitals();
  }, [fetchVitals]);

  return {
    vitals,
    latestVitals,
    loading,
    error,
    hasMore,
    trends,
    alerts,
    statistics,
    refetch,
    loadMore,
    addVitals,
    getVitalsTrend,
    getVitalsInRange,
    getVitalHistory,
    isVitalInNormalRange,
    setDateRange,
    setVitalTypes,
  };
};

// Helper hook for latest vitals only
export const useLatestVitals = () => {
  const [latestVitals, setLatestVitals] = useState<VitalSigns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const vitals = await patientService.getLatestVitals();
        setLatestVitals(vitals as VitalSigns);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load latest vitals');
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  return { latestVitals, loading, error };
};

// Helper hook for vital alerts
export const useVitalAlerts = () => {
  const { alerts, loading, error } = usePatientVitals({
    limit: 10, // Only need recent vitals for alerts
    autoRefresh: true,
    refreshInterval: 120000, // 2 minutes for alerts
  });

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const highAlerts = alerts.filter(alert => alert.severity === 'high');
  
  return {
    alerts,
    criticalAlerts,
    highAlerts,
    hasAlerts: alerts.length > 0,
    hasCriticalAlerts: criticalAlerts.length > 0,
    loading,
    error,
  };
};

// Helper hook for specific vital trends
export const useVitalTrend = (vitalType: keyof VitalSigns, days = 30) => {
  const { getVitalHistory, getVitalsTrend } = usePatientVitals({
    vitalTypes: [vitalType],
  });

  const history = getVitalHistory(vitalType, days);
  const trend = getVitalsTrend(vitalType);

  return {
    history,
    trend,
    hasData: history.length > 0,
    latestValue: history[history.length - 1]?.value,
  };
};
