// src/hooks/patient/usePatientMedications.ts

import { useState, useEffect, useCallback } from 'react';
import { patientService } from '@/lib/api/services/patient.service';
import type { Prescription, MedicationAdherence } from '@/types/patient.types';

interface MedicationScheduleItem {
  prescription: Prescription;
  scheduled_times: string[];
  adherence_data: MedicationAdherence[];
}

interface UseMedicationsOptions {
  status?: string;
  prescribedBy?: number;
  includeHistory?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface AdherenceStats {
  rate: number;
  adherence_rate: number;
  percentage: number;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  streak: number;
  lastTaken?: string;
}

interface UsePatientMedicationsReturn {
  // Data
  medications: Prescription[];
  todaySchedule: MedicationScheduleItem[];
  loading: boolean;
  error: string | null;
  
  // Actions
  refetch: () => Promise<void>;
  markDoseAsTaken: (prescriptionId: number, scheduledTime: string, notes?: string) => Promise<void>;
  markDoseAsSkipped: (prescriptionId: number, scheduledTime: string, reason?: string) => Promise<void>;
  logMedicationTaken: (prescriptionId: number, takenTime: string, notes?: string) => Promise<void>;
  
  // Utilities
  getMedicationAdherence: (prescriptionId: number) => AdherenceStats | null;
  getMedicationSchedule: (date: string) => Promise<MedicationScheduleItem[]>;
  getAdherenceHistory: (prescriptionId: number, days?: number) => Promise<MedicationAdherence[]>;
  
  // Filters
  setStatus: (status: string) => void;
  setPrescribedBy: (providerId: number) => void;
}

export const usePatientMedications = (
  options: UseMedicationsOptions = {}
): UsePatientMedicationsReturn => {
  const [medications, setMedications] = useState<Prescription[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<MedicationScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(options);

  // Fetch medications and today's schedule
  const fetchMedicationsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch medications with proper error handling
      const medicationsParams: Record<string, string | number | undefined> = {};
      if (filters.status) medicationsParams.status = filters.status;
      if (filters.prescribedBy) medicationsParams.prescribed_by = filters.prescribedBy;

      try {
        const medicationsResponse = await patientService.getPrescriptions(medicationsParams);
        setMedications(Array.isArray(medicationsResponse.results) ? medicationsResponse.results : []);
      } catch (medError) {
        console.warn('Failed to fetch medications:', medError);
        setMedications([]);
      }

      // Fetch today's schedule with proper error handling
      try {
        const today = new Date().toISOString().split('T')[0];
        const scheduleResponse = await patientService.getMedicationSchedule(today);
        setTodaySchedule(Array.isArray(scheduleResponse) ? scheduleResponse : []);
      } catch (schedError) {
        console.warn('Failed to fetch medication schedule:', schedError);
        setTodaySchedule([]);
      }

    } catch (err) {
      console.error('Error fetching medications data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load medications');
      // Ensure state is always set to arrays
      setMedications([]);
      setTodaySchedule([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial fetch and when filters change
  useEffect(() => {
    fetchMedicationsData();
  }, [fetchMedicationsData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (filters.autoRefresh) {
      const interval = setInterval(
        () => fetchMedicationsData(),
        filters.refreshInterval || 180000 // Default 3 minutes
      );
      return () => clearInterval(interval);
    }
  }, [filters.autoRefresh, filters.refreshInterval, fetchMedicationsData]);

  // Mark dose as taken
  const markDoseAsTaken = useCallback(async (
    prescriptionId: number,
    scheduledTime: string,
    notes?: string
  ) => {
    try {
      await patientService.logMedicationTaken({
        prescription: prescriptionId,
        scheduled_time: scheduledTime,
        taken_time: new Date().toISOString(),
        taken: true,
        notes,
      });

      // Update local state
      setTodaySchedule(prev =>
        prev.map(scheduleItem => ({
          ...scheduleItem,
          adherence_data: scheduleItem.adherence_data.map(adherence =>
            adherence.prescription === prescriptionId && 
            adherence.scheduled_time === scheduledTime
              ? {
                  ...adherence,
                  taken: true,
                  taken_time: new Date().toISOString(),
                  notes: notes || adherence.notes,
                }
              : adherence
          ),
        }))
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to log medication');
    }
  }, []);

  // Mark dose as skipped
  const markDoseAsSkipped = useCallback(async (
    prescriptionId: number,
    scheduledTime: string,
    reason?: string
  ) => {
    try {
      await patientService.logMedicationTaken({
        prescription: prescriptionId,
        scheduled_time: scheduledTime,
        taken_time: new Date().toISOString(),
        taken: false,
        notes: reason,
      });

      // Update local state
      setTodaySchedule(prev =>
        prev.map(scheduleItem => ({
          ...scheduleItem,
          adherence_data: scheduleItem.adherence_data.map(adherence =>
            adherence.prescription === prescriptionId && 
            adherence.scheduled_time === scheduledTime
              ? {
                  ...adherence,
                  taken: false,
                  notes: reason,
                }
              : adherence
          ),
        }))
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to log skipped dose');
    }
  }, []);

  // Log medication taken (not scheduled)
  const logMedicationTaken = useCallback(async (
    prescriptionId: number,
    takenTime: string,
    notes?: string
  ) => {
    try {
      await patientService.logMedicationTaken({
        prescription: prescriptionId,
        scheduled_time: takenTime,
        taken_time: takenTime,
        taken: true,
        notes,
        //data_source: 'self_reported',
      });

      // Refresh data to get updated adherence
      await fetchMedicationsData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to log medication');
    }
  }, [fetchMedicationsData]);

  // Get medication adherence stats
  const getMedicationAdherence = useCallback((prescriptionId: number): AdherenceStats | null => {
    const medication = medications.find(med => med.id === prescriptionId);
    if (!medication) return null;

    const scheduleItem = todaySchedule.find(item => item.prescription.id === prescriptionId);
    if (!scheduleItem) return null;

    const { adherence_data } = scheduleItem;
    const totalDoses = adherence_data.length;
    const takenDoses = adherence_data.filter(dose => dose.taken).length;
    const missedDoses = totalDoses - takenDoses;
    const rate = totalDoses > 0 ? takenDoses / totalDoses : 0;
    
    // Calculate streak (consecutive taken doses)
    let streak = 0;
    const sortedData = [...adherence_data]
      .sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime());
    
    for (const dose of sortedData) {
      if (dose.taken) {
        streak++;
      } else {
        break;
      }
    }

    // Find last taken dose
    const lastTakenDose = adherence_data
      .filter(dose => dose.taken && dose.taken_time)
      .sort((a, b) => new Date(b.taken_time!).getTime() - new Date(a.taken_time!).getTime())[0];

    return {
      rate,
      percentage: Math.round(rate * 100),
      totalDoses,
      adherence_rate: Math.round(rate * 100),
      takenDoses,
      missedDoses,
      streak,
      lastTaken: lastTakenDose?.taken_time,
    };
  }, [medications, todaySchedule]);

  // Get medication schedule for specific date
  const getMedicationSchedule = useCallback(async (date: string): Promise<MedicationScheduleItem[]> => {
    try {
      const schedule = await patientService.getMedicationSchedule(date);
      return schedule;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get medication schedule');
    }
  }, []);

  // Get adherence history for a medication
  const getAdherenceHistory = useCallback(async (
    prescriptionId: number,
    days = 30
  ): Promise<MedicationAdherence[]> => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days);

      const response = await patientService.getMedicationAdherence({
        prescription: prescriptionId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });

      return response.results;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get adherence history');
    }
  }, []);

  // Filter setters
  const setStatus = useCallback((status: string) => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  const setPrescribedBy = useCallback((providerId: number) => {
    setFilters(prev => ({ ...prev, prescribedBy: providerId }));
  }, []);

  // Refetch data
  const refetch = useCallback(async () => {
    await fetchMedicationsData();
  }, [fetchMedicationsData]);

  return {
    medications,
    todaySchedule,
    loading,
    error,
    refetch,
    markDoseAsTaken,
    markDoseAsSkipped,
    logMedicationTaken,
    getMedicationAdherence,
    getMedicationSchedule,
    getAdherenceHistory,
    setStatus,
    setPrescribedBy,
  };
};

// Helper hook for active medications only
export const useActiveMedications = () => {
  return usePatientMedications({
    status: 'active',
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
  });
};

// Helper hook for today's medication schedule
export const useTodayMedicationSchedule = () => {
  const { todaySchedule, loading, error, markDoseAsTaken, markDoseAsSkipped } = usePatientMedications({
    status: 'active',
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute for today's schedule
  });

  // Calculate today's progress
  const todayProgress = todaySchedule.reduce(
    (acc, scheduleItem) => {
      const takenCount = scheduleItem.adherence_data.filter(dose => dose.taken).length;
      const totalCount = scheduleItem.adherence_data.length;
      
      return {
        totalDoses: acc.totalDoses + totalCount,
        takenDoses: acc.takenDoses + takenCount,
      };
    },
    { totalDoses: 0, takenDoses: 0 }
  );

  const progressPercentage = todayProgress.totalDoses > 0 
    ? Math.round((todayProgress.takenDoses / todayProgress.totalDoses) * 100)
    : 0;

  return {
    todaySchedule,
    loading,
    error,
    markDoseAsTaken,
    markDoseAsSkipped,
    todayProgress: {
      ...todayProgress,
      percentage: progressPercentage,
    },
  };
};

// Helper hook for medication reminders
export const useMedicationReminders = () => {
  const { todaySchedule } = useTodayMedicationSchedule();
  
  // Get upcoming doses (next 2 hours)
  const upcomingDoses = todaySchedule.flatMap(scheduleItem =>
    scheduleItem.adherence_data
      .filter(dose => {
        if (dose.taken) return false;
        
        const now = new Date();
        const scheduledTime = new Date(dose.scheduled_time);
        const timeDiff = scheduledTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        return hoursDiff >= 0 && hoursDiff <= 2;
      })
      .map(dose => ({
        ...dose,
        medication: scheduleItem.prescription,
      }))
  ).sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());

  // Get overdue doses
  const overdueDoses = todaySchedule.flatMap(scheduleItem =>
    scheduleItem.adherence_data
      .filter(dose => {
        if (dose.taken) return false;
        
        const now = new Date();
        const scheduledTime = new Date(dose.scheduled_time);
        
        return scheduledTime < now;
      })
      .map(dose => ({
        ...dose,
        medication: scheduleItem.prescription,
      }))
  ).sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());

  return {
    upcomingDoses,
    overdueDoses,
    hasReminders: upcomingDoses.length > 0 || overdueDoses.length > 0,
  };
};
