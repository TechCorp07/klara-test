// src/hooks/patient/usePatientDashboard.ts

import { useState, useEffect, useCallback } from 'react';
import { patientService, type DashboardResponse } from '@/lib/api/services/patient.service';
import type { PatientDashboardStats, HealthAlert } from '@/types/patient.types';

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

// src/hooks/patient/usePatientAppointments.ts

import { useState, useEffect, useCallback } from 'react';
import { patientService } from '@/lib/api/services/patient.service';
import type { Appointment } from '@/types/patient.types';

interface UsePatientAppointmentsOptions {
  status?: string;
  startDate?: string;
  endDate?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const usePatientAppointments = (options: UsePatientAppointmentsOptions = {}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchAppointments = useCallback(async (append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);

      const params: any = {};
      if (options.status) params.status = options.status;
      if (options.startDate) params.start_date = options.startDate;
      if (options.endDate) params.end_date = options.endDate;
      if (append) params.offset = appointments.length;

      const response = await patientService.getAppointments(params);
      
      if (append) {
        setAppointments(prev => [...prev, ...response.results]);
      } else {
        setAppointments(response.results);
      }
      
      setHasMore(!!response.next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [options, appointments.length]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Auto-refresh functionality
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(
        () => fetchAppointments(),
        options.refreshInterval || 30000 // Default 30 seconds
      );
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval, fetchAppointments]);

  const cancelAppointment = useCallback(async (id: number, reason?: string) => {
    try {
      await patientService.cancelAppointment(id, reason);
      setAppointments(prev =>
        prev.map(apt => apt.id === id ? { ...apt, status: 'cancelled' } : apt)
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to cancel appointment');
    }
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchAppointments(true);
    }
  }, [hasMore, loading, fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    hasMore,
    refetch: () => fetchAppointments(),
    loadMore,
    cancelAppointment,
  };
};

// src/hooks/patient/usePatientMedications.ts

import { useState, useEffect, useCallback } from 'react';
import { patientService } from '@/lib/api/services/patient.service';
import type { Prescription, MedicationAdherence } from '@/types/patient.types';

export const usePatientMedications = () => {
  const [medications, setMedications] = useState<Prescription[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active medications
      const medicationsResponse = await patientService.getPrescriptions({ status: 'active' });
      setMedications(medicationsResponse.results);

      // Fetch today's medication schedule
      const today = new Date().toISOString().split('T')[0];
      const scheduleResponse = await patientService.getMedicationSchedule(today);
      setTodaySchedule(scheduleResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const markDoseAsTaken = useCallback(async (
    prescriptionId: number,
    scheduledTime: string
  ) => {
    try {
      await patientService.logMedicationTaken({
        prescription: prescriptionId,
        scheduled_time: scheduledTime,
        taken_time: new Date().toISOString(),
        taken: true,
      });

      // Update local state
      setTodaySchedule(prev =>
        prev.map(schedule => ({
          ...schedule,
          adherence_data: schedule.adherence_data.map((adherence: MedicationAdherence) =>
            adherence.prescription === prescriptionId && 
            adherence.scheduled_time === scheduledTime
              ? { ...adherence, taken: true, taken_time: new Date().toISOString() }
              : adherence
          ),
        }))
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to log medication');
    }
  }, []);

  const getMedicationAdherence = useCallback((prescriptionId: number) => {
    const medication = medications.find(med => med.id === prescriptionId);
    if (!medication) return null;

    // Calculate adherence from schedule data
    const scheduleItem = todaySchedule.find(item => item.prescription.id === prescriptionId);
    if (!scheduleItem) return null;

    const totalDoses = scheduleItem.adherence_data.length;
    const takenDoses = scheduleItem.adherence_data.filter((dose: MedicationAdherence) => dose.taken).length;
    
    return {
      rate: totalDoses > 0 ? takenDoses / totalDoses : 0,
      totalDoses,
      takenDoses,
      missedDoses: totalDoses - takenDoses,
    };
  }, [medications, todaySchedule]);

  return {
    medications,
    todaySchedule,
    loading,
    error,
    refetch: fetchMedications,
    markDoseAsTaken,
    getMedicationAdherence,
  };
};

// src/hooks/patient/usePatientHealthRecords.ts

import { useState, useEffect, useCallback } from 'react';
import { patientService } from '@/lib/api/services/patient.service';

export const usePatientHealthRecords = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthRecords = useCallback(async (filters?: {
    recordType?: string;
    startDate?: string;
    endDate?: string;
    provider?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { limit: 10, ordering: '-date' };
      if (filters?.recordType) params.record_type = filters.recordType;
      if (filters?.startDate) params.start_date = filters.startDate;
      if (filters?.endDate) params.end_date = filters.endDate;
      if (filters?.provider) params.provider = filters.provider;

      const [recordsResponse, summaryResponse] = await Promise.all([
        patientService.getHealthRecords(params),
        patientService.getDashboardStats(), // Assuming this includes health records summary
      ]);

      setRecords(recordsResponse.results);
      setSummary(summaryResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthRecords();
  }, [fetchHealthRecords]);

  const requestRecords = useCallback(async (requestData: {
    record_types: string[];
    date_range?: { start_date: string; end_date: string };
    delivery_method: 'email' | 'mail' | 'pickup';
    purpose: string;
  }) => {
    try {
      const response = await patientService.requestHealthRecords(requestData);
      return response;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to submit record request');
    }
  }, []);

  const downloadRecord = useCallback(async (recordId: number) => {
    try {
      const blob = await patientService.downloadLabResult(recordId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health_record_${recordId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to download record');
    }
  }, []);

  return {
    records,
    summary,
    loading,
    error,
    refetch: fetchHealthRecords,
    requestRecords,
    downloadRecord,
  };
};

// src/hooks/patient/usePatientVitals.ts

import { useState, useEffect, useCallback } from 'react';
import { patientService } from '@/lib/api/services/patient.service';
import type { VitalSigns } from '@/types/patient.types';

export const usePatientVitals = (dateRange?: { start: string; end: string }) => {
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [latestVitals, setLatestVitals] = useState<VitalSigns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVitals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { limit: 30, ordering: '-recorded_date' };
      if (dateRange) {
        params.start_date = dateRange.start;
        params.end_date = dateRange.end;
      }

      const [vitalsResponse, latestResponse] = await Promise.all([
        patientService.getVitalSigns(params),
        patientService.getLatestVitals(),
      ]);

      setVitals(vitalsResponse.results);
      setLatestVitals(latestResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vital signs');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  const addVitals = useCallback(async (vitalsData: Omit<VitalSigns, 'id' | 'patient' | 'recorded_by'>) => {
    try {
      const newVitals = await patientService.addVitalSigns(vitalsData);
      setVitals(prev => [newVitals, ...prev]);
      setLatestVitals(newVitals);
      return newVitals;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add vital signs');
    }
  }, []);

  const getVitalsTrend = useCallback((vitalType: keyof VitalSigns) => {
    const validVitals = vitals
      .filter(v => v[vitalType] !== null && v[vitalType] !== undefined)
      .sort((a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime());

    if (validVitals.length < 2) return 'stable';

    const latest = validVitals[validVitals.length - 1];
    const previous = validVitals[validVitals.length - 2];
    
    const latestValue = latest[vitalType] as number;
    const previousValue = previous[vitalType] as number;

    if (latestValue > previousValue) return 'increasing';
    if (latestValue < previousValue) return 'decreasing';
    return 'stable';
  }, [vitals]);

  return {
    vitals,
    latestVitals,
    loading,
    error,
    refetch: fetchVitals,
    addVitals,
    getVitalsTrend,
  };
};

// src/hooks/patient/usePatientProfile.ts

import { useState, useEffect, useCallback } from 'react';
import { patientService } from '@/lib/api/services/patient.service';
import type { PatientProfile, PatientPreferences } from '@/types/patient.types';

export const usePatientProfile = () => {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [preferences, setPreferences] = useState<PatientPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await patientService.getProfile();
      setProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<PatientProfile>) => {
    try {
      const updatedProfile = await patientService.updateProfile(updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update profile');
    }
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<PatientPreferences>) => {
    try {
      const updatedPreferences = await patientService.updatePreferences(updates);
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  }, []);

  return {
    profile,
    preferences,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    updatePreferences,
  };
};
