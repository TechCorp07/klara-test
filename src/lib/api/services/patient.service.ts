// src/lib/api/services/patient.service.ts

import { DashboardResponse, HealthRecord } from '@/hooks/patient/types';
import { apiClient } from '@/lib/api/client';
import type {
  PatientProfile,
  VitalSigns,
  MedicalCondition,
  Prescription,
  MedicationAdherence,
  Appointment,
  LabResult,
  HealthInsurance,
  CareTeamMember,
  PatientDocument,
  EmergencyContact,
  PatientDashboardStats,
  HealthAlert,
  PatientPreferences,
  ResearchParticipation,
  PaginatedResponse,
  Message,
  SendMessageResponse,
  Study,
  LogMedicationTakenPayload,
  ConnectedDevice,
  BillingStatement,
  AutoPayResponse,
} from '@/types/patient.types';

class PatientService {
  // Dashboard Overview
  async getDashboardData(): Promise<DashboardResponse> {
    const response = await apiClient.get('/patient/dashboard/');
    return response.data;
  }

  async getDashboardStats(): Promise<PatientDashboardStats> {
    const response = await apiClient.get('/patient/dashboard/stats/');
    return response.data;
  }

  // Profile Management
  async getProfile(): Promise<PatientProfile> {
    const response = await apiClient.get('/patient/profile/');
    return response.data;
  }

  async updateProfile(profileData: Partial<PatientProfile>): Promise<PatientProfile> {
    const response = await apiClient.patch('/patient/profile/', profileData);
    return response.data;
  }

  async updatePreferences(preferences: Partial<PatientPreferences>): Promise<PatientPreferences> {
    const response = await apiClient.patch('/patient/preferences/', preferences);
    return response.data;
  }

  // Vital Signs
  async getVitalSigns(params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<VitalSigns>> {
    const response = await apiClient.get('/patient/vitals/', { params });
    return response.data;
  }

  async addVitalSigns(vitals: Omit<VitalSigns, 'id' | 'patient' | 'recorded_by'>): Promise<VitalSigns> {
    const response = await apiClient.post('/patient/vitals/', vitals);
    return response.data;
  }

  async getLatestVitals(): Promise<VitalSigns | null> {
    const response = await apiClient.get('/patient/vitals/latest/');
    return response.data;
  }

  // Medical Conditions
  async getMedicalConditions(params?: {
    status?: string;
    severity?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<MedicalCondition>> {
    const response = await apiClient.get('/patient/conditions/', { params });
    return response.data;
  }

  async getMedicalCondition(id: number): Promise<MedicalCondition> {
    const response = await apiClient.get(`/patient/conditions/${id}/`);
    return response.data;
  }

  // Medications & Prescriptions
  async getPrescriptions(params?: {
    status?: string;
    prescribed_by?: number;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Prescription>> {
    const response = await apiClient.get('/patient/prescriptions/', { params });
    return response.data;
  }

  async getPrescription(id: number): Promise<Prescription> {
    const response = await apiClient.get(`/patient/prescriptions/${id}/`);
    return response.data;
  }

  async getMedicationAdherence(params?: {
    prescription?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<MedicationAdherence>> {
    const response = await apiClient.get('/patient/medication-adherence/', { params });
    return response.data;
  }

  async logMedicationTaken(payload: LogMedicationTakenPayload): Promise<MedicationAdherence> {
    const response = await apiClient.post('/patient/medication-adherence/', payload);
    return response.data;
  }

  async getMedicationSchedule(date: string): Promise<Array<{
    prescription: Prescription;
    scheduled_times: string[];
    adherence_data: MedicationAdherence[];
  }>> {
    const response = await apiClient.get(`/patient/medication-schedule/?date=${date}`);
    return response.data;
  }

  // Appointments
  async getAppointments(params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
    provider?: number;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Appointment>> {
    const response = await apiClient.get('/patient/appointments/', { params });
    return response.data;
  }

  async getAppointment(id: number): Promise<Appointment> {
    const response = await apiClient.get(`/patient/appointments/${id}/`);
    return response.data;
  }

  async scheduleAppointment(appointmentData: {
    provider: number;
    appointment_type: string;
    visit_type: string;
    preferred_datetime: string;
    reason_for_visit: string;
    symptoms?: string;
    urgency: string;
  }): Promise<Appointment> {
    const response = await apiClient.post('/patient/appointments/', appointmentData);
    return response.data;
  }

  async cancelAppointment(id: number, reason?: string): Promise<void> {
    await apiClient.patch(`/patient/appointments/${id}/`, {
      status: 'cancelled',
      cancellation_reason: reason,
    });
  }

  async rescheduleAppointment(id: number, newDateTime: string): Promise<Appointment> {
    const response = await apiClient.patch(`/patient/appointments/${id}/reschedule/`, {
      new_datetime: newDateTime,
    });
    return response.data;
  }

  // Lab Results
  async getLabResults(params?: {
    start_date?: string;
    end_date?: string;
    test_type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<LabResult>> {
    const response = await apiClient.get('/patient/lab-results/', { params });
    return response.data;
  }

  async getLabResult(id: number): Promise<LabResult> {
    const response = await apiClient.get(`/patient/lab-results/${id}/`);
    return response.data;
  }

  async downloadLabResult(id: number): Promise<Blob> {
    const response = await apiClient.get(`/patient/lab-results/${id}/download/`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Health Records
  async getHealthRecords(params?: {
    record_type?: string;
    start_date?: string;
    end_date?: string;
    provider?: number;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<HealthRecord>> {
    const response = await apiClient.get('/patient/health-records/', { params });
    return response.data;
  }

  async getHealthRecord(id: number): Promise<HealthRecord> {
    const response = await apiClient.get(`/patient/health-records/${id}/`);
    return response.data;
  }

  async requestHealthRecords(data: {
    record_types: string[];
    date_range?: {
      start_date: string;
      end_date: string;
    };
    delivery_method: 'email' | 'mail' | 'pickup';
    purpose: string;
  }): Promise<{ request_id: string; estimated_completion: string }> {
    const response = await apiClient.post('/patient/health-records/request/', data);
    return response.data;
  }

  // Insurance
  async getInsuranceInfo(): Promise<HealthInsurance[]> {
    const response = await apiClient.get('/patient/insurance/');
    return response.data;
  }

  async addInsurance(insuranceData: Omit<HealthInsurance, 'id' | 'patient'>): Promise<HealthInsurance> {
    const response = await apiClient.post('/patient/insurance/', insuranceData);
    return response.data;
  }

  async updateInsurance(id: number, insuranceData: Partial<HealthInsurance>): Promise<HealthInsurance> {
    const response = await apiClient.patch(`/patient/insurance/${id}/`, insuranceData);
    return response.data;
  }

  // Care Team
  async getCareTeam(): Promise<CareTeamMember[]> {
    const response = await apiClient.get('/patient/care-team/');
    return response.data;
  }

  async addCareTeamMember(memberData: Omit<CareTeamMember, 'id' | 'patient'>): Promise<CareTeamMember> {
    const response = await apiClient.post('/patient/care-team/', memberData);
    return response.data;
  }

  async removeCareTeamMember(id: number): Promise<void> {
    await apiClient.delete(`/patient/care-team/${id}/`);
  }

  // Documents
  async getDocuments(params?: {
    document_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<PatientDocument>> {
    const response = await apiClient.get('/patient/documents/', { params });
    return response.data;
  }

  async uploadDocument(file: File, data: {
    document_type: string;
    title: string;
    description?: string;
  }): Promise<PatientDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', data.document_type);
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }

    const response = await apiClient.post('/patient/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteDocument(id: number): Promise<void> {
    await apiClient.delete(`/patient/documents/${id}/`);
  }

  // Emergency Contacts
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    const response = await apiClient.get('/patient/emergency-contacts/');
    return response.data;
  }

  async addEmergencyContact(contactData: Omit<EmergencyContact, 'id' | 'patient'>): Promise<EmergencyContact> {
    const response = await apiClient.post('/patient/emergency-contacts/', contactData);
    return response.data;
  }

  async updateEmergencyContact(id: number, contactData: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const response = await apiClient.patch(`/patient/emergency-contacts/${id}/`, contactData);
    return response.data;
  }

  async deleteEmergencyContact(id: number): Promise<void> {
    await apiClient.delete(`/patient/emergency-contacts/${id}/`);
  }

  // Health Alerts
  async getHealthAlerts(params?: {
    alert_type?: string;
    severity?: string;
    acknowledged?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<HealthAlert>> {
    const response = await apiClient.get('/patient/health-alerts/', { params });
    return response.data;
  }

  async acknowledgeAlert(id: number): Promise<HealthAlert> {
    const response = await apiClient.patch(`/patient/health-alerts/${id}/acknowledge/`);
    return response.data;
  }

  async dismissAlert(id: number): Promise<void> {
    await apiClient.delete(`/patient/health-alerts/${id}/`);
  }

  // Telemedicine
  async getTelemedicineAppointments(params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<Appointment>> {
    const response = await apiClient.get('/patient/telemedicine/appointments/', { params });
    return response.data;
  }

  async joinTelemedicineSession(appointmentId: number): Promise<{
    join_url: string;
    meeting_id: string;
    passcode?: string;
  }> {
    const response = await apiClient.post(`/patient/telemedicine/appointments/${appointmentId}/join/`);
    return response.data;
  }

  async getTelemedicineSessionStatus(appointmentId: number): Promise<{
    status: 'waiting' | 'active' | 'ended';
    can_join: boolean;
    provider_joined: boolean;
    session_duration?: number;
  }> {
    const response = await apiClient.get(`/patient/telemedicine/appointments/${appointmentId}/status/`);
    return response.data;
  }

  // Communication
  async getMessages(params?: {
    thread_id?: number;
    provider?: number;
    unread?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Message>> {
    const response = await apiClient.get('/patient/messages/', { params });
    return response.data;
  }

  async sendMessage(data: {
    recipient: number;
    subject: string;
    message: string;
    priority?: 'low' | 'normal' | 'high';
    attachments?: File[];
  }): Promise<SendMessageResponse> {
    const formData = new FormData();
    formData.append('recipient', data.recipient.toString());
    formData.append('subject', data.subject);
    formData.append('message', data.message);
    if (data.priority) {
      formData.append('priority', data.priority);
    }
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    const response = await apiClient.post('/patient/messages/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async markMessageAsRead(id: number): Promise<void> {
    await apiClient.patch(`/patient/messages/${id}/read/`);
  }

  // Research & Clinical Trials
  async getAvailableStudies(params?: {
    condition?: string;
    phase?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Study>> {
    const response = await apiClient.get('/patient/research/studies/', { params });
    return response.data;
  }

  async expressClinicalTrialInterest(studyId: number, notes?: string): Promise<void> {
    await apiClient.post(`/patient/research/studies/${studyId}/interest/`, { notes });
  }

  async getResearchParticipation(): Promise<ResearchParticipation[]> {
    const response = await apiClient.get('/patient/research/participation/');
    return response.data;
  }

  // Wearable Device Integration
  async getConnectedDevices(): Promise<ConnectedDevice[]> {
    const response = await apiClient.get('/patient/devices/');
    return response.data;
  }

  async connectDevice(data: {
    device_type: string;
    device_id: string;
    manufacturer: string;
    model: string;
  }): Promise<ConnectedDevice> {
    const response = await apiClient.post('/patient/devices/', data);
    return response.data;
  }

  async syncDeviceData(deviceId: number): Promise<void> {
    await apiClient.post(`/patient/devices/${deviceId}/sync/`);
  }

  async disconnectDevice(deviceId: number): Promise<void> {
    await apiClient.delete(`/patient/devices/${deviceId}/`);
  }

  // Billing & Payments
  async getBillingStatements(params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<BillingStatement>> {
    const response = await apiClient.get('/patient/billing/', { params });
    return response.data;
  }

  async makePayment(data: {
    statement_id: number;
    amount: number;
    payment_method: string;
  }): Promise<PaymentResponse> {
    const response = await apiClient.post('/patient/billing/payments/', data);
    return response.data;
  }

  async setupAutoPay(data: {
    payment_method: string;
    enabled: boolean;
  }): Promise<AutoPayResponse> {
    const response = await apiClient.post('/patient/billing/autopay/', data);
    return response.data;
  }
}

export const patientService = new PatientService();
