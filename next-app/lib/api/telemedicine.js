// lib/api/telemedicine.js
import apiClient, { buildParams } from '@/client';

/**
 * Telemedicine-related API functions
 */
const telemedicineApi = {
  /**
   * Get appointments with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated appointments
   */
  getAppointments: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/appointments/?${params}`);
    return data;
  },
  
  /**
   * Get upcoming appointments
   * @returns {Promise<Object>} Paginated upcoming appointments
   */
  getUpcomingAppointments: async () => {
    const { data } = await apiClient.get('/appointments/upcoming/');
    return data;
  },
  
  /**
   * Get past appointments with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated past appointments
   */
  getPastAppointments: async (filters = {}) => {
    const params = buildParams({
      ...filters,
      status: 'completed,cancelled,no_show'
    });
    const { data } = await apiClient.get(`/appointments/?${params}`);
    return data;
  },
  
  /**
   * Get appointment by ID
   * @param {string} id - Appointment ID
   * @returns {Promise<Object>} Appointment
   */
  getAppointment: async (id) => {
    const { data } = await apiClient.get(`/appointments/${id}/`);
    return data;
  },
  
  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} Created appointment
   */
  createAppointment: async (appointmentData) => {
    const { data } = await apiClient.post('/appointments/', appointmentData);
    return data;
  },
  
  /**
   * Create a new telehealth appointment
   * @param {Object} appointmentData - Telehealth appointment data
   * @returns {Promise<Object>} Created telehealth appointment
   */
  createTelehealthAppointment: async (appointmentData) => {
    const { data } = await apiClient.post('/appointments/telehealth/', appointmentData);
    return data;
  },
  
  /**
   * Update an appointment
   * @param {string} id - Appointment ID
   * @param {Object} appointmentData - Updated appointment data
   * @returns {Promise<Object>} Updated appointment
   */
  updateAppointment: async (id, appointmentData) => {
    const { data } = await apiClient.patch(`/appointments/${id}/`, appointmentData);
    return data;
  },
  
  /**
   * Cancel an appointment
   * @param {string} id - Appointment ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation response
   */
  cancelAppointment: async (id, reason) => {
    const { data } = await apiClient.post(`/appointments/${id}/cancel/`, { reason });
    return data;
  },
  
  /**
   * Get join information for telehealth appointment
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<Object>} Join information
   */
  getJoinInfo: async (appointmentId) => {
    const { data } = await apiClient.get(`/appointments/${appointmentId}/join/`);
    return data;
  },
  
  /**
   * Get consultations with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated consultations
   */
  getConsultations: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/consultations/?${params}`);
    return data;
  },
  
  /**
   * Get consultation by ID
   * @param {string} id - Consultation ID
   * @returns {Promise<Object>} Consultation
   */
  getConsultation: async (id) => {
    const { data } = await apiClient.get(`/consultations/${id}/`);
    return data;
  },
  
  /**
   * Get consultations by appointment
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<Object>} Paginated consultations
   */
  getConsultationsByAppointment: async (appointmentId) => {
    const { data } = await apiClient.get(`/consultations/?appointment=${appointmentId}`);
    return data;
  },
  
  /**
   * Start a consultation
   * @param {string} id - Consultation ID
   * @returns {Promise<Object>} Started consultation
   */
  startConsultation: async (id) => {
    const { data } = await apiClient.post(`/consultations/${id}/start/`);
    return data;
  },
  
  /**
   * End a consultation
   * @param {string} id - Consultation ID
   * @param {string} notes - Consultation notes
   * @returns {Promise<Object>} Ended consultation
   */
  endConsultation: async (id, notes) => {
    const { data } = await apiClient.post(`/consultations/${id}/end/`, { notes });
    return data;
  },
  
  /**
   * Get clinical notes for a consultation
   * @param {string} consultationId - Consultation ID
   * @returns {Promise<Object>} Paginated clinical notes
   */
  getClinicalNotes: async (consultationId) => {
    const { data } = await apiClient.get(`/consultations/${consultationId}/clinical-notes/`);
    return data;
  },
  
  /**
   * Create a clinical note
   * @param {string} consultationId - Consultation ID
   * @param {Object} noteData - Clinical note data
   * @returns {Promise<Object>} Created clinical note
   */
  createClinicalNote: async (consultationId, noteData) => {
    const { data } = await apiClient.post(`/consultations/${consultationId}/clinical-notes/`, noteData);
    return data;
  },
  
  /**
   * Update a clinical note
   * @param {string} noteId - Clinical note ID
   * @param {Object} noteData - Updated clinical note data
   * @returns {Promise<Object>} Updated clinical note
   */
  updateClinicalNote: async (noteId, noteData) => {
    const { data } = await apiClient.patch(`/clinical-notes/${noteId}/`, noteData);
    return data;
  },
  
  /**
   * Get available providers
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated providers
   */
  getAvailableProviders: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/providers/available/?${params}`);
    return data;
  },
  
  /**
   * Get provider availability
   * @param {string} providerId - Provider ID
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @returns {Promise<Object>} Provider availability
   */
  getProviderAvailability: async (providerId, startDate, endDate) => {
    const params = buildParams({
      start_date: startDate,
      end_date: endDate
    });
    const { data } = await apiClient.get(`/providers/${providerId}/availability/?${params}`);
    return data;
  },
  
  /**
   * Get provider schedule for a specific date
   * @param {string} providerId - Provider ID
   * @param {string} date - Date (ISO format)
   * @returns {Promise<Object>} Provider schedule
   */
  getProviderSchedule: async (providerId, date) => {
    const { data } = await apiClient.get(`/providers/${providerId}/schedule/?date=${date}`);
    return data;
  },
  
  /**
   * Get referrals with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated referrals
   */
  getReferrals: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/referrals/?${params}`);
    return data;
  },
  
  /**
   * Create a new referral
   * @param {Object} referralData - Referral data
   * @returns {Promise<Object>} Created referral
   */
  createReferral: async (referralData) => {
    const { data } = await apiClient.post('/referrals/', referralData);
    return data;
  },
  
  /**
   * Update a referral
   * @param {string} id - Referral ID
   * @param {Object} referralData - Updated referral data
   * @returns {Promise<Object>} Updated referral
   */
  updateReferral: async (id, referralData) => {
    const { data } = await apiClient.patch(`/referrals/${id}/`, referralData);
    return data;
  }
};

export default telemedicineApi;