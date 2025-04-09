// lib/telemedicine.js
import api from './api';

// Telemedicine API service for appointments, consultations, etc.
export const telemedicine = {
  // Appointments
  getAppointments: async (options = {}) => {
    const params = new URLSearchParams();
    if (options.status) params.append('status', options.status);
    if (options.patientId) params.append('patient', options.patientId);
    if (options.providerId) params.append('provider', options.providerId);
    if (options.startDate) params.append('start_date', options.startDate);
    if (options.endDate) params.append('end_date', options.endDate);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const response = await api.get(`/appointments/?${params.toString()}`);
    return response.data;
  },
  
  getUpcomingAppointments: async () => {
    const response = await api.get('/appointments/upcoming/');
    return response.data;
  },
  
  getPastAppointments: async (options = {}) => {
    const params = new URLSearchParams();
    params.append('status', 'completed,cancelled,no_show');
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const response = await api.get(`/appointments/?${params.toString()}`);
    return response.data;
  },
  
  getAppointment: async (id) => {
    const response = await api.get(`/appointments/${id}/`);
    return response.data;
  },
  
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments/', appointmentData);
    return response.data;
  },
  
  createTelehealthAppointment: async (appointmentData) => {
    const response = await api.post('/appointments/telehealth/', appointmentData);
    return response.data;
  },
  
  updateAppointment: async (id, appointmentData) => {
    const response = await api.patch(`/appointments/${id}/`, appointmentData);
    return response.data;
  },
  
  cancelAppointment: async (id, reason) => {
    const response = await api.post(`/appointments/${id}/cancel/`, { reason });
    return response.data;
  },
  
  // Telehealth Sessions
  getJoinInfo: async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}/join/`);
    return response.data;
  },
  
  // Consultations
  getConsultations: async (options = {}) => {
    const params = new URLSearchParams();
    if (options.appointmentId) params.append('appointment', options.appointmentId);
    if (options.patientId) params.append('patient', options.patientId);
    if (options.providerId) params.append('provider', options.providerId);
    if (options.status) params.append('status', options.status);
    
    const response = await api.get(`/consultations/?${params.toString()}`);
    return response.data;
  },
  
  getConsultation: async (id) => {
    const response = await api.get(`/consultations/${id}/`);
    return response.data;
  },
  
  getConsultationsByAppointment: async (appointmentId) => {
    const response = await api.get(`/consultations/?appointment=${appointmentId}`);
    return response.data;
  },
  
  startConsultation: async (consultationId) => {
    const response = await api.post(`/consultations/${consultationId}/start/`);
    return response.data;
  },
  
  endConsultation: async (consultationId, notes) => {
    const response = await api.post(`/consultations/${consultationId}/end/`, { notes });
    return response.data;
  },
  
  // Clinical Notes
  getClinicalNotes: async (consultationId) => {
    const response = await api.get(`/consultations/${consultationId}/clinical-notes/`);
    return response.data;
  },
  
  createClinicalNote: async (consultationId, noteData) => {
    const response = await api.post(`/consultations/${consultationId}/clinical-notes/`, noteData);
    return response.data;
  },
  
  updateClinicalNote: async (noteId, noteData) => {
    const response = await api.patch(`/clinical-notes/${noteId}/`, noteData);
    return response.data;
  },
  
  // Prescriptions
  getPrescriptions: async (options = {}) => {
    const params = new URLSearchParams();
    if (options.patientId) params.append('patient', options.patientId);
    if (options.providerId) params.append('provider', options.providerId);
    if (options.status) params.append('status', options.status);
    if (options.active !== undefined) params.append('active', options.active.toString());
    
    const response = await api.get(`/prescriptions/?${params.toString()}`);
    return response.data;
  },
  
  getPrescription: async (id) => {
    const response = await api.get(`/prescriptions/${id}/`);
    return response.data;
  },
  
  createPrescription: async (prescriptionData) => {
    const response = await api.post('/prescriptions/', prescriptionData);
    return response.data;
  },
  
  updatePrescription: async (id, prescriptionData) => {
    const response = await api.patch(`/prescriptions/${id}/`, prescriptionData);
    return response.data;
  },
  
  // Provider Management
  getAvailableProviders: async (options = {}) => {
    const params = new URLSearchParams();
    if (options.specialty) params.append('specialty', options.specialty);
    if (options.date) params.append('date', options.date);
    if (options.startTime) params.append('start_time', options.startTime);
    if (options.endTime) params.append('end_time', options.endTime);
    
    const response = await api.get(`/providers/available/?${params.toString()}`);
    return response.data;
  },
  
  getProviderAvailability: async (providerId, startDate, endDate) => {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    
    const response = await api.get(`/providers/${providerId}/availability/?${params.toString()}`);
    return response.data;
  },
  
  getProviderSchedule: async (providerId, date) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const response = await api.get(`/providers/${providerId}/schedule/?${params.toString()}`);
    return response.data;
  },
  
  // Referrals
  getReferrals: async (options = {}) => {
    const params = new URLSearchParams();
    if (options.patientId) params.append('patient', options.patientId);
    if (options.referringProviderId) params.append('referring_provider', options.referringProviderId);
    if (options.referredToProviderId) params.append('referred_to_provider', options.referredToProviderId);
    if (options.status) params.append('status', options.status);
    
    const response = await api.get(`/referrals/?${params.toString()}`);
    return response.data;
  },
  
  createReferral: async (referralData) => {
    const response = await api.post('/referrals/', referralData);
    return response.data;
  },
  
  updateReferral: async (id, referralData) => {
    const response = await api.patch(`/referrals/${id}/`, referralData);
    return response.data;
  },
};

export default telemedicine;
