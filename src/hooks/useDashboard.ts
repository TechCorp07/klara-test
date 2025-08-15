// src/hooks/useDashboard.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { PatientDashboardData, patientService, AppointmentRequest, WearableDeviceConnection } from '@/lib/api/services/patient.service';

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
    
    if (requestRef.current && !isRefresh) {
      try {
        const dashboardData = await requestRef.current;
        
        setData(dashboardData);
        setLastUpdated(new Date());
        setIsLoading(false);
        setIsRefreshing(false);
        
        return dashboardData;
      } catch (err) {
        requestRef.current = null;
      }
    }

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const requestPromise = patientService.getDashboardData();
      requestRef.current = requestPromise;
      
      const dashboardData = await requestPromise;
      
      setData(dashboardData);
      setLastUpdated(new Date());
      
      return dashboardData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      console.error('❌ Dashboard fetch error:', err);
      throw err;
    } finally {
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

  const recordVitals = useCallback(async (vitals: Record<string, unknown>) => {
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

  const requestAppointment = useCallback(async (appointmentData: AppointmentRequest) => {
    return executeAction(
      () => patientService.requestAppointment(appointmentData),
      'Appointment request submitted successfully'
    );
  }, [executeAction]);

  const connectDevice = useCallback(async (deviceData: WearableDeviceConnection) => {
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
    const checkForNewAlerts = async () => {
      try {
        // This would be replaced with WebSocket or Server-Sent Events
        const { notificationService } = await import('@/lib/api/services/notification.service');
        const response = await notificationService.getNotifications({ unread_only: true });
        const newAlerts = (response.data as { notifications: typeof alerts }).notifications || [];

        setAlerts(newAlerts);
        setUnreadCount(newAlerts.length);
        
        // Show browser notification for critical alerts
        newAlerts
          .filter((alert) => alert.severity === 'critical')
          .forEach((alert) => {
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

    const markAsRead = useCallback(async (alertId: number) => {
    try {
      const { notificationService } = await import('@/lib/api/services/notification.service');
      await notificationService.markAsRead(alertId);
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  return {
    alerts,
    unreadCount,
    markAsRead
  };
}