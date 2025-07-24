// src/hooks/useDashboard.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { PatientDashboardData, patientService } from '@/lib/api/services/patient.service';

interface UseDashboardReturn {
  data: PatientDashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
  isRefreshing: boolean;
}

export function useDashboard(autoRefreshInterval?: number): UseDashboardReturn {
  const [data, setData] = useState<PatientDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const requestRef = useRef<Promise<PatientDashboardData> | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (isRefresh = false) => {
    console.log('🎯 FETCH START:', { isRefresh, hasCurrentRequest: !!requestRef.current });
    
    if (requestRef.current && !isRefresh) {
      console.log('🔄 Request already in progress, waiting...');
      try {
        const dashboardData = await requestRef.current;
        console.log('🎯 CACHE PATH: Got data, updating state...', !!dashboardData);
        
        // Remove mountedRef.current check - just update state
        console.log('✅ Setting dashboard data from cache:', Object.keys(dashboardData));
        setData(dashboardData);
        setLastUpdated(new Date());
        setIsLoading(false);
        setIsRefreshing(false);
        
        return dashboardData;
      } catch (err) {
        console.log('❌ Cache request failed, making new one');
        requestRef.current = null;
      }
    }

    try {
      console.log('🎯 NEW REQUEST PATH: Starting...');
      
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      console.log('🔄 Making new dashboard request...');
      
      const requestPromise = patientService.getDashboardData();
      requestRef.current = requestPromise;
      
      const dashboardData = await requestPromise;
      console.log('🎯 API SUCCESS: Got data', !!dashboardData);
      
      // Remove mountedRef.current check - just update state
      console.log('✅ Setting dashboard data:', Object.keys(dashboardData));
      setData(dashboardData);
      setLastUpdated(new Date());
      console.log('🎯 ABOUT TO SET isLoading to false');
      
      return dashboardData;
    } catch (err) {
      console.log('❌ API ERROR:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      console.error('❌ Dashboard fetch error:', err);
      throw err;
    } finally {
      console.log('🎯 FINALLY BLOCK: Setting isLoading to false');
      requestRef.current = null;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefreshInterval && autoRefreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          refreshData();
        }
      }, autoRefreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefreshInterval, refreshData]);

  // Refresh on focus
  useEffect(() => {
    const handleFocus = () => {
      if (lastUpdated && Date.now() - lastUpdated.getTime() > 2 * 60 * 1000) {
        refreshData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [lastUpdated, refreshData]);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    isRefreshing
  };
}

// Hook for managing patient actions (medications, vitals, etc.)
export function usePatientActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const executeAction = useCallback(async <T>(
    action: () => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    try {
      setIsSubmitting(true);
      setActionError(null);
      setActionSuccess(null);

      const result = await action();
      
      if (successMessage) {
        setActionSuccess(successMessage);
        // Clear success message after 3 seconds
        setTimeout(() => setActionSuccess(null), 3000);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed';
      setActionError(errorMessage);
      // Clear error message after 5 seconds
      setTimeout(() => setActionError(null), 5000);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logMedication = useCallback(async (medicationId: number, taken: boolean, notes?: string) => {
    return executeAction(
      () => patientService.logMedication(medicationId, { 
        medication_id: medicationId, 
        taken, 
        notes,
        taken_at: new Date().toISOString()
      }),
      taken ? 'Medication logged successfully' : 'Missed dose recorded'
    );
  }, [executeAction]);

  const recordVitals = useCallback(async (vitals: any) => {
    return executeAction(
      () => patientService.recordVitalSigns({
        ...vitals,
        recorded_at: new Date().toISOString()
      }),
      'Vital signs recorded successfully'
    );
  }, [executeAction]);

  const acknowledgeAlert = useCallback(async (alertId: number) => {
    return executeAction(
      () => patientService.acknowledgeAlert(alertId),
      'Alert acknowledged'
    );
  }, [executeAction]);

  const requestAppointment = useCallback(async (appointmentData: any) => {
    return executeAction(
      () => patientService.requestAppointment(appointmentData),
      'Appointment request submitted successfully'
    );
  }, [executeAction]);

  const connectDevice = useCallback(async (deviceData: any) => {
    return executeAction(
      () => patientService.connectWearableDevice(deviceData),
      'Device connection initiated'
    );
  }, [executeAction]);

  const clearMessages = useCallback(() => {
    setActionError(null);
    setActionSuccess(null);
  }, []);

  return {
    isSubmitting,
    actionError,
    actionSuccess,
    logMedication,
    recordVitals,
    acknowledgeAlert,
    requestAppointment,
    connectDevice,
    executeAction,
    clearMessages
  };
}

// Hook for real-time notifications and alerts
export function useRealTimeAlerts() {
  const [alerts, setAlerts] = useState<Array<{
    id: number;
    type: 'medication' | 'appointment' | 'health' | 'research' | 'system';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    created_at: string;
    acknowledged: boolean;
    action_required?: boolean;
    action_url?: string;
  }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // WebSocket connection for real-time alerts would go here
    // For now, we'll simulate with periodic checks
    const checkForNewAlerts = async () => {
      try {
        // This would be replaced with WebSocket or Server-Sent Events
        const dashboardData = await patientService.getDashboardData();
        const newAlerts = dashboardData.alerts.filter((alert: any) => !alert.acknowledged);
        
        setAlerts(newAlerts);
        setUnreadCount(newAlerts.length);
        
        // Show browser notification for critical alerts
        newAlerts
          .filter((alert: any) => alert.severity === 'critical')
          .forEach((alert: any) => {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(alert.title, {
                body: alert.message,
                icon: '/icons/health-alert.png',
                badge: '/icons/badge.png'
              });
            }
          });
      } catch (error) {
        console.error('Failed to check for new alerts:', error);
      }
    };

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check for alerts every 30 seconds
    const interval = setInterval(checkForNewAlerts, 30000);
    
    // Initial check
    checkForNewAlerts();

    return () => clearInterval(interval);
  }, []);

  const markAsRead = useCallback((alertId: number) => {
    setAlerts((prev: any) => prev.filter((alert: any) => alert.id !== alertId));
    setUnreadCount((prev: any) => Math.max(0, prev - 1));
  }, []);

  return {
    alerts,
    unreadCount,
    markAsRead
  };
}