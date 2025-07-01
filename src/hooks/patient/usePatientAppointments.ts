// src/hooks/patient/usePatientAppointments.ts

import { useState, useEffect, useCallback } from 'react';
import { patientService } from '@/lib/api/services/patient.service';
import type { Appointment } from '@/types/patient.types';

interface UsePatientAppointmentsOptions {
  status?: string;
  appointmentType?: string;
  startDate?: string;
  endDate?: string;
  provider?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  limit?: number;
}

interface UsePatientAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  // Actions
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  scheduleAppointment: (appointmentData: any) => Promise<Appointment>;
  cancelAppointment: (id: number, reason?: string) => Promise<void>;
  rescheduleAppointment: (id: number, newDateTime: string) => Promise<Appointment>;
  // Filters
  setFilters: (filters: Partial<UsePatientAppointmentsOptions>) => void;
  clearFilters: () => void;
}

export const usePatientAppointments = (
  options: UsePatientAppointmentsOptions = {}
): UsePatientAppointmentsReturn => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFiltersState] = useState<UsePatientAppointmentsOptions>(options);

  // Fetch appointments
  const fetchAppointments = useCallback(async (append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);

      const params: any = {
        limit: filters.limit || 10,
        offset: append ? appointments.length : 0,
      };

      // Apply filters
      if (filters.status) params.status = filters.status;
      if (filters.appointmentType) params.appointment_type = filters.appointmentType;
      if (filters.startDate) params.start_date = filters.startDate;
      if (filters.endDate) params.end_date = filters.endDate;
      if (filters.provider) params.provider = filters.provider;

      const response = await patientService.getAppointments(params);
      
      if (append) {
        setAppointments(prev => [...prev, ...response.results]);
      } else {
        setAppointments(response.results);
      }
      
      setHasMore(!!response.next);
      setTotalCount(response.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [filters, appointments.length]);

  // Initial fetch and when filters change
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Auto-refresh functionality
  useEffect(() => {
    if (filters.autoRefresh) {
      const interval = setInterval(
        () => fetchAppointments(),
        filters.refreshInterval || 60000 // Default 1 minute
      );
      return () => clearInterval(interval);
    }
  }, [filters.autoRefresh, filters.refreshInterval, fetchAppointments]);

  // Load more appointments (pagination)
  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchAppointments(true);
    }
  }, [hasMore, loading, fetchAppointments]);

  // Schedule new appointment
  const scheduleAppointment = useCallback(async (appointmentData: any) => {
    try {
      const newAppointment = await patientService.scheduleAppointment(appointmentData);
      
      // Add to local state if it matches current filters
      const shouldInclude = (
        (!filters.status || newAppointment.status === filters.status) &&
        (!filters.appointmentType || newAppointment.appointment_type === filters.appointmentType) &&
        (!filters.provider || newAppointment.provider.id === filters.provider)
      );
      
      if (shouldInclude) {
        setAppointments(prev => [newAppointment, ...prev]);
        setTotalCount(prev => prev + 1);
      }
      
      return newAppointment;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to schedule appointment');
    }
  }, [filters]);

  // Cancel appointment
  const cancelAppointment = useCallback(async (id: number, reason?: string) => {
    try {
      await patientService.cancelAppointment(id, reason);
      
      // Update local state
      setAppointments(prev =>
        prev.map(apt => 
          apt.id === id 
            ? { ...apt, status: 'cancelled' as const }
            : apt
        )
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to cancel appointment');
    }
  }, []);

  // Reschedule appointment
  const rescheduleAppointment = useCallback(async (id: number, newDateTime: string) => {
    try {
      const updatedAppointment = await patientService.rescheduleAppointment(id, newDateTime);
      
      // Update local state
      setAppointments(prev =>
        prev.map(apt => apt.id === id ? updatedAppointment : apt)
      );
      
      return updatedAppointment;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to reschedule appointment');
    }
  }, []);

  // Update filters
  const setFilters = useCallback((newFilters: Partial<UsePatientAppointmentsOptions>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFiltersState({
      autoRefresh: filters.autoRefresh,
      refreshInterval: filters.refreshInterval,
    });
  }, [filters.autoRefresh, filters.refreshInterval]);

  // Refetch appointments
  const refetch = useCallback(async () => {
    await fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    hasMore,
    totalCount,
    refetch,
    loadMore,
    scheduleAppointment,
    cancelAppointment,
    rescheduleAppointment,
    setFilters,
    clearFilters,
  };
};

// Helper hook for upcoming appointments
export const useUpcomingAppointments = (limit = 5) => {
  const today = new Date().toISOString().split('T')[0];
  
  return usePatientAppointments({
    status: 'scheduled,confirmed',
    startDate: today,
    limit,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds for upcoming appointments
  });
};

// Helper hook for appointment history
export const useAppointmentHistory = (limit = 10) => {
  const today = new Date().toISOString().split('T')[0];
  
  return usePatientAppointments({
    status: 'completed,cancelled,no_show',
    endDate: today,
    limit,
  });
};

// Helper hook for today's appointments
export const useTodayAppointments = () => {
  const today = new Date().toISOString().split('T')[0];
  
  return usePatientAppointments({
    startDate: today,
    endDate: today,
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
  });
};

// Helper hook for telemedicine appointments
export const useTelemedicineAppointments = () => {
  return usePatientAppointments({
    // This would need to be adjusted based on how visit_type is stored
    // Assuming there's a way to filter by visit_type in the API
    autoRefresh: true,
    refreshInterval: 30000,
  });
};
