// src/lib/api/services/dashboard-patient.service.ts
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { PatientDashboardData } from './patient.service';

// Helper function to extract data from your API responses
const extractData = <T>(response: any): T => {
  return response.data.data || response.data;
};

// Helper function for error handling
const handleError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.detail) {
      return axiosError.response.data.detail;
    }
    if (axiosError.response?.data?.errors?.length) {
      return axiosError.response.data.errors.join(', ');
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export interface MedicationLogEntry {
  medication_id: number;
  taken: boolean;
  taken_at?: string;
  notes?: string;
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

class DashboardPatientService {
  /**
   * Get comprehensive patient dashboard data with error handling
   */
  async getDashboardData(): Promise<PatientDashboardData> {
    try {
      const response = await apiClient.get<PatientDashboardData>(ENDPOINTS.PATIENT.DASHBOARD);
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch patient dashboard data:', error);
      throw new Error('Unable to load dashboard. Please try refreshing the page.');
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
   * Record vital signs with validation
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
      const response = await apiClient.get(ENDPOINTS.PATIENT.VITALS_LATEST);
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch latest vitals:', error);
      throw new Error('Unable to load vital signs data.');
    }
  }

  /**
   * Request appointment with provider
   */
  async requestAppointment(appointmentData: AppointmentRequest): Promise<{ id: number; message: string }> {
    try {
      const response = await apiClient.post(ENDPOINTS.PATIENT.REQUEST_APPOINTMENT, appointmentData);
      return extractData(response);
    } catch (error) {
      console.error('Failed to request appointment:', error);
      throw new Error('Failed to schedule appointment. Please try again or contact support.');
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId: number, reason?: string): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.PATIENT.CANCEL_APPOINTMENT(appointmentId), { 
        reason: reason || 'Patient requested cancellation' 
      });
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      throw new Error('Failed to cancel appointment. Please contact your provider directly.');
    }
  }

  /**
   * Connect wearable device
   */
  async connectWearableDevice(deviceData: WearableDeviceConnection): Promise<{ authorization_url?: string }> {
    try {
      const response = await apiClient.post(ENDPOINTS.PATIENT.CONNECT_DEVICE, deviceData);
      return extractData(response);
    } catch (error) {
      console.error('Failed to connect wearable device:', error);
      throw new Error('Failed to connect device. Please check your device settings and try again.');
    }
  }

  /**
   * Disconnect wearable device
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
   * Express interest in research study
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
   * Get available research studies
   */
  async getAvailableResearchStudies(): Promise<any[]> {
    try {
      const response = await apiClient.get(ENDPOINTS.PATIENT.RESEARCH_STUDIES);
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch research studies:', error);
      throw new Error('Unable to load research studies.');
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
   * Get medication analytics and adherence insights
   */
  async getMedicationAnalytics(timeframe: '7d' | '30d' | '90d' = '30d'): Promise<{
    adherence_trends: Array<{ date: string; rate: number }>;
    missed_doses: Array<{ medication: string; missed_times: string[] }>;
    side_effects: Array<{ medication: string; effects: string[]; severity: string }>;
  }> {
    try {
      const response = await apiClient.get(`${ENDPOINTS.PATIENT.MEDICATION_ANALYTICS}?timeframe=${timeframe}`);
      return extractData(response);
    } catch (error) {
      console.error('Failed to fetch medication analytics:', error);
      throw new Error('Unable to load medication analytics.');
    }
  }
}

// Export singleton instance
export const dashboardPatientService = new DashboardPatientService();