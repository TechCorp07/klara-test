// src/lib/api/services/patient.service.ts
import { HealthRecord, MedicationScheduleItem, RecordRequest } from '@/hooks/patient/types';
import { ScheduleAppointmentPayload } from '@/hooks/patient/usePatientAppointments';
import { apiClient } from '@/lib/api/client';
import { buildQueryUrl, ENDPOINTS } from '@/lib/api/endpoints';
import { Appointment, EmergencyContact, HealthInsurance, MedicationAdherence, PatientPreferences, PatientProfile, Prescription, VitalSigns } from '@/types/patient.types';
import { AxiosResponse } from 'axios';

// Helper function to extract data from your existing Axios responses
const extractData = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

export interface PatientDashboardData {
  patient_info: {
    name: string;
    email: string;
    has_rare_condition: boolean;
    rare_conditions: Array<{
      name: string;
      diagnosed_date: string;
      severity: 'mild' | 'moderate' | 'severe';
      specialist_provider?: string;
    }>;
  };
  health_summary: {
    overall_status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    last_checkup: string;
    next_appointment: string | null;
    identity_verified: boolean;
    days_until_verification_required: number | null;
  };
  medications: {
    active_medications: Array<{
      id: number;
      name: string;
      dosage: string;
      frequency: string;
      next_dose_time: string;
      adherence_rate: number;
      supply_days_left: number;
    }>;
    adherence_summary: {
      overall_rate: number;
      last_7_days: number;
      missed_doses_today: number;
      on_time_rate: number;
    };
    upcoming_refills: Array<{
      medication: string;
      days_remaining: number;
      auto_refill_enabled: boolean;
    }>;
  };
  vitals: {
    current: {
      blood_pressure?: string;
      heart_rate?: number;
      temperature?: number;
      weight?: number;
      oxygen_saturation?: number;
      pain_level?: number;
    };
    trends: {
      improving: string[];
      stable: string[];
      concerning: string[];
    };
    last_recorded: string;
  };
  wearable_data: {
    connected_devices: Array<{
      id: number;
      type: 'fitbit' | 'apple_watch' | 'garmin' | 'other';
      name: string;
      last_sync: string;
      battery_level?: number;
    }>;
/*     health_insights: {
      steps_today: number;
      steps_goal: number;
      active_minutes: number;
      calories_burned: number;
      sleep_hours: number;
      heart_rate_avg: number;
    };
    data_sharing: {
      research_data_shared: boolean;
      pharmaceutical_monitoring: boolean;
      provider_access: boolean;
    }; */
    today_summary: {
      steps: number;
      heart_rate_avg: number;
      sleep_hours: number;
      active_minutes: number;
    };
    medication_reminders_sent: number;
  };
  appointments: {
    upcoming: Array<{
      id: number;
      date: string;
      time: string;
      provider_name: string;
      provider_specialty: string;
      appointment_type: string;
      is_telemedicine: boolean;
      location?: string;
      preparation_notes?: string;
      can_reschedule: boolean;
      can_cancel: boolean;
    }>;
    recent: Array<{
      date: string;
      provider: string;
      summary: string;
      follow_up_required: boolean;
    }>;
  };
  care_team: Array<{
    id: number;
    name: string;
    role: string;
    specialty?: string;
    contact_method: string;
    last_contact: string;
    next_scheduled_contact?: string;
  }>;
  research_participation: {
    enrolled_studies: Array<{
      id: number;
      title: string;
      phase: string;
      enrollment_date: string;
      next_visit_date?: string;
      compensation_earned: number;
    }>;
    available_studies: Array<{
      id: number;
      title: string;
      description: string;
      estimated_time_commitment: string;
      compensation: string;
      eligibility_match: number;
    }>;
    data_contributions: {
      total_surveys_completed: number;
      wearable_data_shared_days: number;
      clinical_visits_completed: number;
    };
  };
  alerts: Array<{
    id: number;
    type: 'medication' | 'appointment' | 'health' | 'research' | 'system';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    created_at: string;
    acknowledged: boolean;
    action_required?: boolean;
    action_url?: string;
  }>;
  quick_actions: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    href: string;
    priority: 'high' | 'medium' | 'low';
    requires_verification?: boolean;
  }>;
}

export interface MedicationLogEntry {
  medication_id: number;
  taken: boolean;
  taken_at: string;
  notes?: string;
  status?: string;
}

export interface VitalSignsEntry {
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  oxygen_saturation?: number;
  pain_level?: number;
  notes?: string;
  recorded_at?: string;
}

export interface WearableDevice {
  id: number;
  type: 'fitbit' | 'apple_watch' | 'garmin' | 'other';
  name: string;
  is_connected: boolean;
  last_sync?: string;
  authorization_url?: string;
}

export interface WearableDeviceConnection {
  device_type: 'fitbit' | 'apple_watch' | 'garmin' | 'other';
  device_name: string;
  authorization_code?: string;
}

export interface ResearchInterest {
  study_id: number;
  interest_level: 'low' | 'medium' | 'high';
  questions?: string;
  availability?: string;
}

export interface AppointmentRequest {
  provider_id?: number;
  appointment_type: string;
  preferred_date: string;
  preferred_time?: string;
  reason: string;
  is_urgent: boolean;
  is_telemedicine_preferred: boolean;
  notes?: string;
}

export interface ResearchStudy {
  id: number;
  title: string;
  description: string;
  phase: string;
  estimated_duration: string;
  compensation: string;
  eligibility_criteria: string[];
  time_commitment: string;
  location: string;
  is_remote: boolean;
  enrollment_status: 'open' | 'closed' | 'full';
  eligibility_match?: number;
}

export interface FHIRDataRequest {
  resource_type: 'Patient' | 'Observation' | 'MedicationStatement' | 'Condition' | 'Appointment';
  date_range?: {
    start: string;
    end: string;
  };
  include_external: boolean;
}

class EnhancedPatientService {
  /**
   * Get comprehensive patient dashboard data
   */
    async getDashboardData(): Promise<PatientDashboardData> {
      try {
        const response = await apiClient.get<PatientDashboardData>(ENDPOINTS.PATIENT.DASHBOARD);
        const data = extractData(response);
        
        // Validate required fields
        if (!data.patient_info || !data.medications || !data.appointments) {
          throw new Error('Invalid dashboard data structure received');
        }
        
        return data;
      } catch (error) {
        console.error('❌ Failed to fetch patient dashboard data:', error);
        throw new Error('Unable to load dashboard data. Please try refreshing the page.');
      }
    }

  /**
   * Log medication as taken or missed
   */
  async logMedication(medicationId: number, logEntry: MedicationLogEntry): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.PATIENT.LOG_MEDICATION(medicationId), {
        ...logEntry,
        taken_at: logEntry.taken_at || new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log medication:', error);
      throw new Error('Failed to record medication. Please try again.');
    }
  }

  /**
   * Record vital signs
   */
  async recordVitalSigns(vitals: VitalSignsEntry): Promise<void> {
    try {
      const vitalsWithTimestamp = {
        ...vitals,
        recorded_at: vitals.recorded_at || new Date().toISOString()
      };
      
      await apiClient.post(ENDPOINTS.PATIENT.VITALS, vitalsWithTimestamp);
    } catch (error) {
      console.error('Failed to record vital signs:', error);
      throw new Error('Failed to save vital signs. Please check your data and try again.');
    }
  }

    /**
   * Get latest vital signs
   */
    async getLatestVitals(): Promise<VitalSignsEntry> {
      try {
        const response = await apiClient.get<VitalSignsEntry>(ENDPOINTS.PATIENT.VITALS_LATEST);
        return extractData(response);
      } catch (error) {
        console.error('Failed to fetch latest vitals:', error);
        throw new Error('Unable to load vital signs data.');
      }
    }

  /**
   * Acknowledge health alert
   */
  async acknowledgeAlert(alertId: number): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.PATIENT.ACKNOWLEDGE_ALERT(alertId));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      throw new Error('Failed to acknowledge alert. Please try again.');
    }
  }

  /**
   * Get connected wearable devices
   */
  async getWearableDevices(): Promise<WearableDevice[]> {
    try {
      const response = await apiClient.get<WearableDevice[]>(ENDPOINTS.PATIENT.WEARABLE_DEVICES);
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch wearable devices:', error);
      throw new Error('Failed to load wearable devices');
    }
  }

  /**
   * Connect a new wearable device
   */
  async connectWearableDevice(deviceData: WearableDeviceConnection): Promise<{ authorization_url?: string }> {
    try {
      const response = await apiClient.post<{ authorization_url?: string }>(ENDPOINTS.PATIENT.CONNECT_DEVICE, deviceData);
      return extractData(response);
    } catch (error) {
      console.error('Failed to connect wearable device:', error);
      throw new Error('Failed to connect device. Please check your device settings and try again.');
    }
  }

  /**
   * Disconnect a wearable device
   */
  async disconnectWearableDevice(deviceId: number): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.PATIENT.DISCONNECT_DEVICE(deviceId));
    } catch (error) {
      console.error('Failed to disconnect wearable device:', error);
      throw new Error('Failed to disconnect device. Please try again.');
    }
  }

    /**
   * Get patient health records
   */
  async getHealthRecords(params?: Record<string, string | number | boolean | undefined>): Promise<{
    results: HealthRecord[];
    count: number;
    next: string | null;
    previous: string | null;
  }> {
    try {
      const response = await apiClient.get<{
        results: HealthRecord[];
        count: number;
        next: string | null;
        previous: string | null;
      }>(buildQueryUrl(`${ENDPOINTS.PATIENT.PROFILE}/health-records/`, params));
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch health records:', error);
      throw new Error('Failed to load health records');
    }
  }

  /**
   * Download lab result or health record
   */
  async downloadLabResult(recordId: number): Promise<Blob> {
    try {
      const response = await apiClient.get(`${ENDPOINTS.PATIENT.PROFILE}/health-records/${recordId}/download/`, {
        responseType: 'blob',
      });
      
      // Type assertion to handle the unknown type
      return response.data as Blob;
    } catch (error) {
      console.error('Failed to download lab result:', error);
      throw new Error('Failed to download the health record');
    }
  }

  /**
   * Request health records from external providers
   */
  async requestHealthRecords(requestData: RecordRequest): Promise<{
    request_id: string;
    estimated_completion: string;
    tracking_number?: string;
  }> {
    try {
      const response = await apiClient.post<{
        request_id: string;
        estimated_completion: string;
        tracking_number?: string;
      }>(`${ENDPOINTS.PATIENT.PROFILE}/health-records/request/`, requestData);
      return extractData(response);
    } catch (error) {
      console.error('Failed to request health records:', error);
      throw new Error('Failed to submit health records request');
    }
  }

  /**
   * Send message (for sharing records or general messaging)
   */
  async sendMessage(messageData: {
    recipient: number;
    subject: string;
    message: string;
    attachments?: string[];
  }): Promise<void> {
    try {
      await apiClient.post(`${ENDPOINTS.PATIENT.PROFILE}/messages/`, messageData);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
 * Get appointment by ID
 */
async getAppointmentById(id: number): Promise<Appointment> {
  try {
    const response = await apiClient.get<Appointment>(
      ENDPOINTS.TELEMEDICINE.APPOINTMENT_DETAIL(id)
    );
    return extractData(response);
  } catch (error) {
    console.error('Failed to fetch appointment:', error);
    throw new Error('Failed to fetch appointment details');
  }
}

  /**
   * Request appointment scheduling
   */
  async requestAppointment(appointmentData: AppointmentRequest): Promise<{ id: number; status: string }> {
    try {
      const response = await apiClient.post<{ id: number; status: string }>(
        ENDPOINTS.PATIENT.REQUEST_APPOINTMENT,
        appointmentData
      );
      return extractData(response);
    } catch (error) {
      console.error('Failed to request appointment:', error);
      throw new Error('Failed to schedule appointment. Please try again or contact support.');
    }
  }

  /**
   * Get patient appointments
   */
  async getAppointments(params?: Record<string, string | number | boolean | undefined>): Promise<{
    results: Appointment[];
    count: number;
    next: string | null;
    previous: string | null;
  }> {
    try {
      const response = await apiClient.get<{
        results: Appointment[];
        count: number;
        next: string | null;
        previous: string | null;
      }>(buildQueryUrl(ENDPOINTS.TELEMEDICINE.APPOINTMENTS, params));
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      throw new Error('Failed to load appointments');
    }
  }

  /**
   * Schedule a new appointment
   */
  async scheduleAppointment(appointmentData: ScheduleAppointmentPayload): Promise<Appointment> {
    try {
      const response = await apiClient.post<Appointment>(
        ENDPOINTS.TELEMEDICINE.SCHEDULE_APPOINTMENT,
        appointmentData
      );
      return extractData(response);
    } catch (error) {
      console.error('Failed to schedule appointment:', error);
      throw new Error('Failed to schedule appointment');
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(id: number, reason?: string): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.TELEMEDICINE.CANCEL_APPOINTMENT(id), {
        reason: reason || 'Patient cancellation'
      });
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      throw new Error('Failed to cancel appointment');
    }
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(id: number, newDateTime: string): Promise<Appointment> {
    try {
      const response = await apiClient.patch<Appointment>(
        ENDPOINTS.TELEMEDICINE.RESCHEDULE_APPOINTMENT(id),
        { 
          preferred_datetime: newDateTime,
          status: 'rescheduled'
        }
      );
      return extractData(response);
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
      throw new Error('Failed to reschedule appointment');
    }
  }

  /**
   * Provide telemedicine consent using healthcare consent system
   */
  async provideTelemedicineConsent(consentData: {
    consented: boolean;
  }): Promise<{ detail: string }> {
    try {
      const response = await apiClient.post<{ detail: string }>('/healthcare/health-data-consents/update_consent/', {
        consent_type: 'telemedicine_services',
        consented: consentData.consented,
      });
      return extractData(response);
    } catch (error) {
      console.error('Failed to provide telemedicine consent:', error);
      throw new Error('Failed to provide consent');
    }
  }

  /**
   * Check current telemedicine consent status
   */
  async getTelemedicineConsentStatus(): Promise<{
    has_consent: boolean;
    consent_date?: string;
    consent_id?: number;
  }> {
    try {
      const response = await apiClient.get<{
        consents?: Array<{
          id: number;
          consent_type: string;
          consented: boolean;
          consented_at?: string;
        }>;
      }>('/healthcare/health-data-consents/my_consents/');
      const data = extractData(response);
      
      // Look for telemedicine services consent
      const telemedicineConsent = data.consents?.find((consent) => 
        consent.consent_type === 'telemedicine_services' && consent.consented
      );
      
      return {
        has_consent: !!telemedicineConsent,
        consent_date: telemedicineConsent?.consented_at,
        consent_id: telemedicineConsent?.id
      };
    } catch (error) {
      console.error('Failed to check consent status:', error);
      return { has_consent: false };
    }
  }

  /**
   * Get available research studies
   */
  async getAvailableResearchStudies(): Promise<PatientDashboardData['research_participation']['available_studies']> {
    try {
      const response = await apiClient.get<PatientDashboardData['research_participation']['available_studies']>(ENDPOINTS.PATIENT.RESEARCH_STUDIES);
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch research studies:', error);
      throw new Error('Unable to load research studies.');
    }
  }

  /**
   * Express interest in a research study
   */
  async expressResearchInterest(studyId: number, interestData: ResearchInterest): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.PATIENT.EXPRESS_RESEARCH_INTEREST(studyId), interestData);
    } catch (error) {
      console.error('Failed to express research interest:', error);
      throw new Error('Failed to register research interest. Please try again.');
    }
  }
  
  /**
   * Contact provider/care team member
   */
  async contactProvider(providerId: number, method: 'phone' | 'email' | 'message', urgency: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    try {
      await apiClient.post(`/users/patient/care-team/${providerId}/contact/`, {
        contact_method: method,
        urgency: urgency,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to contact provider:', error);
      throw new Error('Failed to contact provider. Please try again or use emergency contact if urgent.');
    }
  }

  /**
   * Get patient FHIR data
   */
  async getFHIRData(request: FHIRDataRequest): Promise<object> {
    try {
      const response = await apiClient.post<object>(ENDPOINTS.PATIENT.FHIR_EXPORT, request);
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch FHIR data:', error);
      throw new Error('Failed to fetch FHIR data');
    }
  }
  
  /**
   * Request FHIR data export
   */
  async requestFHIRExport(options?: { include_external?: boolean; date_range?: { start: string; end: string } }): Promise<{ export_id: string; estimated_completion: string }> {
    try {
      const response = await apiClient.post<{ export_id: string; estimated_completion: string }>(ENDPOINTS.PATIENT.FHIR_EXPORT, options || {});
      return extractData(response);
    } catch (error) {
      console.error('Failed to request FHIR export:', error);
      throw new Error('Failed to request data export. Please try again.');
    }
  }

  /**
   * Request external health records import
   */
  async requestExternalRecordsImport(
    providerName: string, 
    providerAddress: string,
    dateRange?: { start: string; end: string }
  ): Promise<{ request_id: string; status: string }> {
    try {
      const response = await apiClient.post<{ request_id: string; status: string }>(
        ENDPOINTS.PATIENT.FHIR_IMPORT_REQUEST,
        {
          provider_name: providerName,
          provider_address: providerAddress,
          date_range: dateRange
        }
      );
      return extractData(response);
    } catch (error) {
      console.error('Failed to request external records import:', error);
      throw new Error('Failed to request records import');
    }
  }
  
  /**
   * Emergency notification to care team
   */
  async sendEmergencyNotification(details: { severity: 'urgent' | 'critical'; description: string; location?: string }): Promise<void> {
    try {
      await apiClient.post('/users/patient/emergency/notify/', {
        ...details,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send emergency notification:', error);
      throw new Error('Failed to send emergency alert. Please call emergency services if this is life-threatening.');
    }
  }

  /**
   * Update medication reminder preferences
   */
  async updateMedicationReminders(preferences: {
    enabled: boolean;
    methods: ('email' | 'sms' | 'push' | 'smartwatch')[];
    frequency: 'immediate' | '15min' | '30min' | '1hour';
    quiet_hours?: { start: string; end: string };
  }): Promise<void> {
    try {
      await apiClient.patch(ENDPOINTS.PATIENT.MEDICATION_REMINDERS, preferences);
    } catch (error) {
      console.error('Failed to update medication reminders:', error);
      throw new Error('Failed to update reminder preferences');
    }
  }

  /**
   * Get medication analytics and adherence insights
   */
  async getMedicationAnalytics(timeframe: '7d' | '30d' | '90d' = '30d'): Promise<{
    adherence_trends: Array<{ date: string; rate: number }>;
    missed_doses: Array<{ medication: string; missed_times: string[] }>;
    side_effects: Array<{ medication: string; effects: string[]; severity: string }>;
  }> {
    try {
      const response = await apiClient.get<{
        adherence_trends: Array<{ date: string; rate: number }>;
        missed_doses: Array<{ medication: string; missed_times: string[] }>;
        side_effects: Array<{ medication: string; effects: string[]; severity: string }>;
      }>(`${ENDPOINTS.PATIENT.MEDICATION_ANALYTICS}?timeframe=${timeframe}`);
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch medication analytics:', error);
      throw new Error('Unable to load medication analytics.');
    }
  }

  /**
   * Get family medical history for genetic conditions
   */
  async getFamilyMedicalHistory(): Promise<{
    immediate_family: Array<{
      relationship: string;
      conditions: string[];
      age_of_onset?: number;
      notes?: string;
    }>;
    extended_family: Array<{
      relationship: string;
      conditions: string[];
      age_of_onset?: number;
      notes?: string;
    }>;
  }> {
    try {
      const response = await apiClient.get<{
        immediate_family: Array<{
          relationship: string;
          conditions: string[];
          age_of_onset?: number;
          notes?: string;
        }>;
        extended_family: Array<{
          relationship: string;
          conditions: string[];
          age_of_onset?: number;
          notes?: string;
        }>;
      }>(ENDPOINTS.PATIENT.FAMILY_HISTORY);
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch family medical history:', error);
      throw new Error('Failed to load family medical history');
    }
  }

  /**
   * Update family medical history
   */
  async updateFamilyMedicalHistory(familyHistory: {
    relationship: string;
    conditions: string[];
    age_of_onset?: number;
    notes?: string;
  }): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.PATIENT.FAMILY_HISTORY, familyHistory);
    } catch (error) {
      console.error('Failed to update family medical history:', error);
      throw new Error('Failed to update family history');
    }
  }

  /**
   * Request telemedicine session
   */
  async requestTelemedicineSession(providerId: number, urgency: 'routine' | 'urgent' | 'emergency'): Promise<{
    session_id: string;
    join_url: string;
    scheduled_time: string;
  }> {
    try {
      const response = await apiClient.post<{
        session_id: string;
        join_url: string;
        scheduled_time: string;
      }>(ENDPOINTS.PATIENT.TELEMEDICINE_REQUEST, {
        provider_id: providerId,
        urgency
      });
      return extractData(response);
    } catch (error) {
      console.error('Failed to request telemedicine session:', error);
      throw new Error('Failed to request telemedicine session');
    }
  }

  /**
   * Join patient support chat groups
   */
  async getPatientChatGroups(): Promise<Array<{
    id: number;
    name: string;
    description: string;
    condition_focus: string;
    member_count: number;
    is_member: boolean;
    last_activity: string;
  }>> {
    try {
      const response = await apiClient.get<Array<{
        id: number;
        name: string;
        description: string;
        condition_focus: string;
        member_count: number;
        is_member: boolean;
        last_activity: string;
      }>>(ENDPOINTS.PATIENT.CHAT_GROUPS);
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch chat groups:', error);
      throw new Error('Failed to load chat groups');
    }
  }

  /**
   * Join a patient chat group
   */
  async joinChatGroup(groupId: number): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.PATIENT.JOIN_CHAT_GROUP(groupId));
    } catch (error) {
      console.error('Failed to join chat group:', error);
      throw new Error('Failed to join chat group');
    }
  }

    /**
   * Get patient prescriptions
   */
  async getPrescriptions(params?: Record<string, string | number | boolean | undefined>): Promise<{
    results: Prescription[];
    count: number;
    next: string | null;
    previous: string | null;
  }> {
    try {
      const response = await apiClient.get<{
        results: Prescription[];
        count: number;
        next: string | null;
        previous: string | null;
      }>(buildQueryUrl(ENDPOINTS.PATIENT.MEDICATIONS, params));
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      throw new Error('Failed to load prescriptions');
    }
  }

  /**
   * Get medication schedule for a specific date
   */
  async getMedicationSchedule(date: string): Promise<MedicationScheduleItem[]> {
    try {
      const response = await apiClient.get<MedicationScheduleItem[]>(
        `${ENDPOINTS.PATIENT.MEDICATIONS}schedule/?date=${date}`
      );
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch medication schedule:', error);
      throw new Error('Failed to load medication schedule');
    }
  }

  /**
   * Log medication as taken (alias for existing logMedication)
   */
  async logMedicationTaken(data: { prescription: number; scheduled_time: string; taken_time: string; taken: boolean; notes?: string }): Promise<void> {
    const logEntry: MedicationLogEntry = {
      medication_id: data.prescription,
      taken: data.taken,
      status: data.taken ? 'taken' : 'skipped',
      taken_at: data.taken_time,
      notes: data.notes,
      //data_source?: string,
    };
    return this.logMedication(data.prescription, logEntry);
  }

  /**
   * Get medication adherence data
   */
/**
 * Get medication adherence data with flexible parameters
 */
  async getMedicationAdherence(params: { prescription: number; start_date?: string; end_date?: string; } | number, days?: number): Promise<{
    results: MedicationAdherence[];
    count: number;
  }> {
    try {
      let url: string;
      
      if (typeof params === 'number') {
        // Legacy call with just medicationId
        url = `${ENDPOINTS.PATIENT.MEDICATIONS}${params}/adherence/?days=${days || 30}`;
      } else {
        // New call with object parameters
        const queryParams = new URLSearchParams();
        queryParams.append('prescription', params.prescription.toString());
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        
        url = `${ENDPOINTS.PATIENT.MEDICATIONS}adherence/?${queryParams.toString()}`;
      }
      
      const response = await apiClient.get<{
        results: MedicationAdherence[];
        count: number;
      }>(url);
      
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch medication adherence:', error);
      throw new Error('Failed to load adherence data');
    }
  }

  /**
 * Get vital signs
 */
  async getVitalSigns(params?: Record<string, string | number | boolean | undefined>): Promise<{
    results: VitalSigns[];
    count: number;
    next: string | null;
    previous: string | null;
  }> {
    try {
      const response = await apiClient.get<{
        results: VitalSigns[];
        count: number;
        next: string | null;
        previous: string | null;
      }>(buildQueryUrl(ENDPOINTS.PATIENT.VITALS, params));
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch vital signs:', error);
      throw new Error('Failed to load vital signs');
    }
  }

  /**
   * Add vital signs
   */
  async addVitalSigns(vitalsData: VitalSignsEntry): Promise<VitalSigns> {
    try {
      const response = await apiClient.post<VitalSigns>(ENDPOINTS.PATIENT.VITALS, {
        ...vitalsData,
        recorded_at: vitalsData.recorded_at || new Date().toISOString()
      });
      return extractData(response);
    } catch (error) {
      console.error('Failed to add vital signs:', error);
      throw new Error('Failed to save vital signs');
    }
  }

  /**
 * Get patient profile
 */
  async getProfile(): Promise<PatientProfile> {
    try {
      const response = await apiClient.get<PatientProfile>(ENDPOINTS.PATIENT.PROFILE);
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch patient profile:', error);
      throw new Error('Failed to load profile');
    }
  }

  /**
   * Get emergency contacts
   */
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      const response = await apiClient.get<EmergencyContact[]>(`${ENDPOINTS.PATIENT.PROFILE}/emergency-contacts/`);
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch emergency contacts:', error);
      throw new Error('Failed to load emergency contacts');
    }
  }

  /**
   * Get insurance information
   */
  async getInsuranceInfo(): Promise<HealthInsurance[]> {
    try {
      const response = await apiClient.get<HealthInsurance[]>(`${ENDPOINTS.PATIENT.PROFILE}/insurance/`);
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch insurance info:', error);
      throw new Error('Failed to load insurance information');
    }
  }

  /**
   * Update patient profile
   */
  async updateProfile(profileData: Partial<PatientProfile>): Promise<PatientProfile> {
    try {
      const response = await apiClient.patch<PatientProfile>(ENDPOINTS.PATIENT.UPDATE_PROFILE, profileData);
      return extractData(response);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Update patient preferences
   */
  async updatePreferences(preferences: Partial<PatientPreferences>): Promise<PatientPreferences> {
    try {
      const response = await apiClient.patch<PatientPreferences>(
        `${ENDPOINTS.PATIENT.PROFILE}/preferences/`, 
        preferences
      );
      return extractData(response);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw new Error('Failed to update preferences');
    }
  }

  /**
   * Add emergency contact
   */
  async addEmergencyContact(contactData: Partial<EmergencyContact>): Promise<EmergencyContact> {
    try {
      const response = await apiClient.post<EmergencyContact>(
        `${ENDPOINTS.PATIENT.PROFILE}/emergency-contacts/`, 
        contactData
      );
      return extractData(response);
    } catch (error) {
      console.error('Failed to add emergency contact:', error);
      throw new Error('Failed to add emergency contact');
    }
  }

  /**
   * Update emergency contact
   */
  async updateEmergencyContact(contactId: number, contactData: Partial<EmergencyContact>): Promise<EmergencyContact> {
    try {
      const response = await apiClient.patch<EmergencyContact>(
        `${ENDPOINTS.PATIENT.PROFILE}/emergency-contacts/${contactId}/`, 
        contactData
      );
      return extractData(response);
    } catch (error) {
      console.error('Failed to update emergency contact:', error);
      throw new Error('Failed to update emergency contact');
    }
  }

  /**
   * Delete emergency contact
   */
  async deleteEmergencyContact(contactId: number): Promise<void> {
    try {
      await apiClient.delete(`${ENDPOINTS.PATIENT.PROFILE}/emergency-contacts/${contactId}/`);
    } catch (error) {
      console.error('Failed to delete emergency contact:', error);
      throw new Error('Failed to delete emergency contact');
    }
  }

  /**
   * Add insurance information
   */
  async addInsurance(insuranceData: Partial<HealthInsurance>): Promise<HealthInsurance> {
    try {
      const response = await apiClient.post<HealthInsurance>(
        `${ENDPOINTS.PATIENT.PROFILE}/insurance/`, 
        insuranceData
      );
      return extractData(response);
    } catch (error) {
      console.error('Failed to add insurance:', error);
      throw new Error('Failed to add insurance');
    }
  }

  /**
   * Update insurance information
   */
  async updateInsurance(insuranceId: number, insuranceData: Partial<HealthInsurance>): Promise<HealthInsurance> {
    try {
      const response = await apiClient.patch<HealthInsurance>(
        `${ENDPOINTS.PATIENT.PROFILE}/insurance/${insuranceId}/`, 
        insuranceData
      );
      return extractData(response);
    } catch (error) {
      console.error('Failed to update insurance:', error);
      throw new Error('Failed to update insurance');
    }
  }

  /**
   * Get medication adherence analytics
   */
  async getMedicationAdherenceAnalytics(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<{
    overall_adherence: number;
    adherence_by_medication: Array<{
      medication: string;
      adherence_rate: number;
      missed_doses: number;
      on_time_rate: number;
    }>;
    adherence_trends: Array<{
      date: string;
      adherence_rate: number;
    }>;
    factors_affecting_adherence: Array<{
      factor: string;
      impact_score: number;
      description: string;
    }>;
  }> {
    try {
      const response = await apiClient.get<{
        overall_adherence: number;
        adherence_by_medication: Array<{
          medication: string;
          adherence_rate: number;
          missed_doses: number;
          on_time_rate: number;
        }>;
        adherence_trends: Array<{
          date: string;
          adherence_rate: number;
        }>;
        factors_affecting_adherence: Array<{
          factor: string;
          impact_score: number;
          description: string;
        }>;
      }>(`${ENDPOINTS.PATIENT.MEDICATION_ANALYTICS}?range=${timeRange}`);
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch medication adherence analytics:', error);
      throw new Error('Failed to load adherence analytics');
    }
  }

  /**
   * Emergency contact notification
   */
  async triggerEmergencyNotification(emergencyType: 'medical' | 'medication' | 'mental_health', message: string): Promise<{
    notification_id: string;
    contacts_notified: string[];
    emergency_services_contacted: boolean;
  }> {
    try {
      const response = await apiClient.post<{
        notification_id: string;
        contacts_notified: string[];
        emergency_services_contacted: boolean;
      }>(ENDPOINTS.PATIENT.EMERGENCY_NOTIFICATION, {
        emergency_type: emergencyType,
        message
      });
      return extractData(response);
    } catch (error) {
      console.error('Failed to trigger emergency notification:', error);
      throw new Error('Failed to send emergency notification');
    }
  }
}

// Export singleton instance
export const patientService = new EnhancedPatientService();

// Also export the class for dependency injection
export { EnhancedPatientService };