// src/hooks/patient/types.ts

import type { 
    Appointment, 
    Prescription, 
    MedicationAdherence, 
    VitalSigns, 
    PatientProfile, 
    PatientPreferences, 
    EmergencyContact, 
    HealthInsurance 
  } from '@/types/patient.types';
  
  // Dashboard types
  export interface DashboardResponse {
    stats: PatientDashboardStats;
    recent_vitals: VitalSigns[];
    upcoming_appointments: Appointment[];
    active_medications: Prescription[];
    pending_results: any[];
    health_alerts: HealthAlert[];
    care_gaps: Array<{
      type: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      action_url?: string;
    }>;
  }
  
  export interface PatientDashboardStats {
    upcoming_appointments: number;
    pending_lab_results: number;
    active_prescriptions: number;
    overdue_medications: number;
    unread_messages: number;
    care_gaps: number;
    health_score?: number;
    last_visit_date?: string;
    next_appointment_date?: string;
    medication_adherence_rate: number;
  }
  
  export interface HealthAlert {
    id: number;
    patient: number;
    alert_type: 'medication_reminder' | 'lab_result' | 'appointment_reminder' | 'health_metric' | 'care_gap' | 'emergency';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    action_required: boolean;
    action_url?: string;
    created_date: string;
    acknowledged: boolean;
    acknowledged_date?: string;
    expires_date?: string;
    related_record_type?: string;
    related_record_id?: number;
  }
  
  // Appointments types
  export interface UsePatientAppointmentsOptions {
    status?: string;
    appointmentType?: string;
    startDate?: string;
    endDate?: string;
    provider?: number;
    autoRefresh?: boolean;
    refreshInterval?: number;
    limit?: number;
  }
  
  export interface UsePatientAppointmentsReturn {
    appointments: Appointment[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    totalCount: number;
    refetch: () => Promise<void>;
    loadMore: () => Promise<void>;
    scheduleAppointment: (appointmentData: any) => Promise<Appointment>;
    cancelAppointment: (id: number, reason?: string) => Promise<void>;
    rescheduleAppointment: (id: number, newDateTime: string) => Promise<Appointment>;
    setFilters: (filters: Partial<UsePatientAppointmentsOptions>) => void;
    clearFilters: () => void;
  }
  
  // Medications types
  export interface MedicationScheduleItem {
    prescription: Prescription;
    scheduled_times: string[];
    adherence_data: MedicationAdherence[];
  }
  
  export interface AdherenceStats {
    rate: number;
    percentage: number;
    totalDoses: number;
    takenDoses: number;
    missedDoses: number;
    streak: number;
    lastTaken?: string;
  }
  
  export interface UsePatientMedicationsReturn {
    medications: Prescription[];
    todaySchedule: MedicationScheduleItem[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    markDoseAsTaken: (prescriptionId: number, scheduledTime: string, notes?: string) => Promise<void>;
    markDoseAsSkipped: (prescriptionId: number, scheduledTime: string, reason?: string) => Promise<void>;
    logMedicationTaken: (prescriptionId: number, takenTime: string, notes?: string) => Promise<void>;
    getMedicationAdherence: (prescriptionId: number) => AdherenceStats | null;
    getMedicationSchedule: (date: string) => Promise<MedicationScheduleItem[]>;
    getAdherenceHistory: (prescriptionId: number, days?: number) => Promise<MedicationAdherence[]>;
    setStatus: (status: string) => void;
    setPrescribedBy: (providerId: number) => void;
  }
  
  // Health Records types
  export interface HealthRecord {
    id: number;
    record_type: 'lab_result' | 'imaging' | 'visit_note' | 'test_result' | 'prescription' | 'vaccination' | 'procedure' | 'discharge_summary';
    title: string;
    date: string;
    provider: {
      id: number;
      name: string;
      specialty: string;
    };
    status: 'final' | 'preliminary' | 'pending' | 'amended' | 'cancelled';
    has_attachments: boolean;
    is_critical: boolean;
    summary?: string;
    document_url?: string;
    file_size?: number;
    mime_type?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface HealthRecordsSummary {
    total_records: number;
    recent_records: number;
    pending_results: number;
    critical_alerts: number;
    last_updated: string;
    records_by_type: Record<string, number>;
    records_by_provider: Record<string, number>;
  }
  
  export interface RecordRequest {
    record_types: string[];
    date_range?: {
      start_date: string;
      end_date: string;
    };
    delivery_method: 'email' | 'mail' | 'pickup';
    purpose: string;
    notes?: string;
  }
  
  export interface RecordRequestResponse {
    request_id: string;
    estimated_completion: string;
    tracking_number?: string;
    status: 'submitted' | 'processing' | 'ready' | 'delivered';
  }
  
  export interface UsePatientHealthRecordsReturn {
    records: HealthRecord[];
    summary: HealthRecordsSummary | null;
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    totalCount: number;
    refetch: () => Promise<void>;
    loadMore: () => Promise<void>;
    downloadRecord: (recordId: number) => Promise<void>;
    requestRecords: (requestData: RecordRequest) => Promise<RecordRequestResponse>;
    shareRecord: (recordId: number, recipientEmail: string, message?: string) => Promise<void>;
    setFilters: (filters: any) => void;
    clearFilters: () => void;
    searchRecords: (query: string) => void;
    getRecordsByType: (type: string) => HealthRecord[];
    getCriticalRecords: () => HealthRecord[];
    getRecentRecords: (days?: number) => HealthRecord[];
  }
  
  // Vitals types
  export interface VitalTrend {
    vital_type: keyof VitalSigns;
    trend: 'increasing' | 'decreasing' | 'stable';
    change_percentage: number;
    period_days: number;
  }
  
  export interface VitalAlert {
    id: string;
    vital_type: keyof VitalSigns;
    value: number;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    recorded_date: string;
  }
  
  export interface VitalStats {
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
  
  export interface UsePatientVitalsReturn {
    vitals: VitalSigns[];
    latestVitals: VitalSigns | null;
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    trends: VitalTrend[];
    alerts: VitalAlert[];
    statistics: Record<string, VitalStats>;
    refetch: () => Promise<void>;
    loadMore: () => Promise<void>;
    addVitals: (vitalsData: Omit<VitalSigns, 'id' | 'patient' | 'recorded_by'>) => Promise<VitalSigns>;
    getVitalsTrend: (vitalType: keyof VitalSigns) => 'increasing' | 'decreasing' | 'stable';
    getVitalsInRange: (startDate: string, endDate: string) => VitalSigns[];
    getVitalHistory: (vitalType: keyof VitalSigns, days?: number) => Array<{ date: string; value: number }>;
    isVitalInNormalRange: (vitalType: keyof VitalSigns, value: number) => boolean;
    setDateRange: (start: string, end: string) => void;
    setVitalTypes: (types: (keyof VitalSigns)[]) => void;
  }
  
  // Profile types
  export interface ProfileValidation {
    isValid: boolean;
    errors: Record<string, string>;
    warnings: Record<string, string>;
  }
  
  export interface UsePatientProfileReturn {
    profile: PatientProfile | null;
    preferences: PatientPreferences | null;
    emergencyContacts: EmergencyContact[];
    insuranceInfo: HealthInsurance[];
    loading: boolean;
    error: string | null;
    updateProfile: (updates: Partial<PatientProfile>) => Promise<PatientProfile>;
    updatePreferences: (updates: Partial<PatientPreferences>) => Promise<PatientPreferences>;
    addEmergencyContact: (contact: Omit<EmergencyContact, 'id' | 'patient'>) => Promise<EmergencyContact>;
    updateEmergencyContact: (id: number, updates: Partial<EmergencyContact>) => Promise<EmergencyContact>;
    deleteEmergencyContact: (id: number) => Promise<void>;
    addInsurance: (insurance: Omit<HealthInsurance, 'id' | 'patient'>) => Promise<HealthInsurance>;
    updateInsurance: (id: number, updates: Partial<HealthInsurance>) => Promise<HealthInsurance>;
    deleteInsurance: (id: number) => Promise<void>;
    validateProfile: (profileData: Partial<PatientProfile>) => ProfileValidation;
    refetch: () => Promise<void>;
    getProfileCompleteness: () => { percentage: number; missingFields: string[] };
    isProfileComplete: () => boolean;
  }
  