// src/hooks/patient/usePatientDashboard.ts

import { useState, useEffect, useCallback } from 'react';
import { patientService } from '@/lib/api/services/patient.service';
import { DashboardResponse } from './types';

export const usePatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const acknowledgeAlert = useCallback(async (alertId: number) => {
    try {
      await patientService.acknowledgeAlert(alertId);
      // Update local state
      if (dashboardData) {
        setDashboardData(prev => ({
          ...prev!,
          health_alerts: prev!.health_alerts.map(alert =>
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
          ),
        }));
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  }, [dashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboardData,
    acknowledgeAlert,
  };
};
