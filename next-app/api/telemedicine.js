// lib/api/telemedicine.js
import apiClient, { createApiService, executeApiCall, buildParams } from '@/client';

/**
 * Base API service for appointment-related endpoints
 */
const appointmentService = createApiService('/appointments');

/**
 * Base API service for consultation-related endpoints
 */
const consultationService = createApiService('/consultations');

/**
 * Base API service for provider-related endpoints
 */
const providerService = createApiService('/providers');

/**
 * Base API service for referral-related endpoints
 */
const referralService = createApiService('/referrals');

/**
 * Telemedicine-related API functions
 */
const telemedicineApi = {
  // Base CRUD operations
  ...appointmentService,
  
  /**
   * Get appointments with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated appointments
   */
  getAppointments: async (filters = {}) => {
    return appointmentService.getList(filters, {
      errorMessage: 'Failed to fetch appointments'
    });
  },
  
  /**
   * Get upcoming appointments
   * @returns {Promise<Object>} Paginated upcoming appointments
   */
  getUpcomingAppointments: async () => {
    return executeApiCall(
      () => apiClient.get('/appointments/upcoming/'),
      'Failed to fetch upcoming appointments',
      { endpoint: '/appointments/upcoming' }
    );
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
    
    return executeApiCall(
      () => apiClient.get(`/appointments/?${params}`),
      'Failed to fetch past appointments',
      { endpoint: '/appointments', filters }
    );
  },
  
  /**
   * Get appointment by ID
   * @param {string} id - Appointment ID
   * @returns {Promise<Object>} Appointment
   */
  getAppointment: async (id) => {
    return appointmentService.getById(id, {
      errorMessage: 'Failed to fetch appointment details'
    });
  },
  
  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} Created appointment
   */
  createAppointment: async (appointmentData) => {
    return appointmentService.create(appointmentData, {
      errorMessage: 'Failed to create appointment'
    });
  },
  
  /**
   * Create a new telehealth appointment
   * @param {Object} appointmentData - Telehealth appointment data
   * @returns {Promise<Object>} Created telehealth appointment
   */
  createTelehealthAppointment: async (appointmentData) => {
    return executeApiCall(
      () => apiClient.post('/appointments/telehealth/', appointmentData),
      'Failed to create telehealth appointment',
      { endpoint: '/appointments/telehealth' }
    );
  },
  
  /**
   * Update an appointment
   * @param {string} id - Appointment ID
   * @param {Object} appointmentData - Updated appointment data
   * @returns {Promise<Object>} Updated appointment
   */
  updateAppointment: async (id, appointmentData) => {
    return appointmentService.update(id, appointmentData, {
      errorMessage: 'Failed to update appointment'
    });
  },
  
  /**
   * Cancel an appointment
   * @param {string} id - Appointment ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation response
   */
  cancelAppointment: async (id, reason) => {
    return appointmentService.performAction(id, 'cancel', { reason }, {
      errorMessage: 'Failed to cancel appointment'
    });
  },
  
  /**
   * Get join information for telehealth appointment
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<Object>} Join information
   */
  getJoinInfo: async (appointmentId) => {
    return appointmentService.performAction(appointmentId, 'join', null, {
      method: 'GET',
      errorMessage: 'Failed to get join information'
    });
  },
  
  /**
   * Get consultations with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated consultations
   */
  getConsultations: async (filters = {}) => {
    return consultationService.getList(filters, {
      errorMessage: 'Failed to fetch consultations'
    });
  },
  
  /**
   * Get consultation by ID
   * @param {string} id - Consultation ID
   * @returns {Promise<Object>} Consultation
   */
  getConsultation: async (id) => {
    return consultationService.getById(id, {
      errorMessage: 'Failed to fetch consultation details'
    });
  },
  
  /**
   * Get consultations by appointment
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<Object>} Paginated consultations
   */
  getConsultationsByAppointment: async (appointmentId) => {
    return consultationService.getList({ appointment: appointmentId }, {
      errorMessage: 'Failed to fetch consultations for appointment'
    });
  },
  
  /**
   * Start a consultation
   * @param {string} id - Consultation ID
   * @returns {Promise<Object>} Started consultation
   */
  startConsultation: async (id) => {
    return consultationService.performAction(id, 'start', null, {
      errorMessage: 'Failed to start consultation'
    });
  },
  
  /**
   * End a consultation
   * @param {string} id - Consultation ID
   * @param {string} notes - Consultation notes
   * @returns {Promise<Object>} Ended consultation
   */
  endConsultation: async (id, notes) => {
    return consultationService.performAction(id, 'end', { notes }, {
      errorMessage: 'Failed to end consultation'
    });
  },
  
  /**
   * Get clinical notes for a consultation
   * @param {string} consultationId - Consultation ID
   * @returns {Promise<Object>} Paginated clinical notes
   */
  getClinicalNotes: async (consultationId) => {
    return executeApiCall(
      () => apiClient.get(`/consultations/${consultationId}/clinical-notes/`),
      'Failed to fetch clinical notes',
      { consultationId }
    );
  },
  
  /**
   * Create a clinical note
   * @param {string} consultationId - Consultation ID
   * @param {Object} noteData - Clinical note data
   * @returns {Promise<Object>} Created clinical note
   */
  createClinicalNote: async (consultationId, noteData) => {
    return executeApiCall(
      () => apiClient.post(`/consultations/${consultationId}/clinical-notes/`, noteData),
      'Failed to create clinical note',
      { consultationId }
    );
  },
  
  /**
   * Update a clinical note
   * @param {string} noteId - Clinical note ID
   * @param {Object} noteData - Updated clinical note data
   * @returns {Promise<Object>} Updated clinical note
   */
  updateClinicalNote: async (noteId, noteData) => {
    return executeApiCall(
      () => apiClient.patch(`/clinical-notes/${noteId}/`, noteData),
      'Failed to update clinical note',
      { noteId }
    );
  },
  
  /**
   * Get available providers
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated providers
   */
  getAvailableProviders: async (filters = {}) => {
    return executeApiCall(
      () => {
        const params = buildParams(filters);
        return apiClient.get(`/providers/available/?${params}`);
      },
      'Failed to fetch available providers',
      { filters }
    );
  },
  
  /**
   * Get provider availability
   * @param {string} providerId - Provider ID
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @returns {Promise<Object>} Provider availability
   */
  getProviderAvailability: async (providerId, startDate, endDate) => {
    return executeApiCall(
      () => {
        const params = buildParams({
          start_date: startDate,
          end_date: endDate
        });
        return apiClient.get(`/providers/${providerId}/availability/?${params}`);
      },
      'Failed to fetch provider availability',
      { providerId, startDate, endDate }
    );
  },
  
  /**
   * Get provider schedule for a specific date
   * @param {string} providerId - Provider ID
   * @param {string} date - Date (ISO format)
   * @returns {Promise<Object>} Provider schedule
   */
  getProviderSchedule: async (providerId, date) => {
    return executeApiCall(
      () => apiClient.get(`/providers/${providerId}/schedule/?date=${date}`),
      'Failed to fetch provider schedule',
      { providerId, date }
    );
  },
  
  /**
   * Get referrals with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated referrals
   */
  getReferrals: async (filters = {}) => {
    return referralService.getList(filters, {
      errorMessage: 'Failed to fetch referrals'
    });
  },
  
  /**
   * Create a new referral
   * @param {Object} referralData - Referral data
   * @returns {Promise<Object>} Created referral
   */
  createReferral: async (referralData) => {
    return referralService.create(referralData, {
      errorMessage: 'Failed to create referral'
    });
  },
  
  /**
   * Update a referral
   * @param {string} id - Referral ID
   * @param {Object} referralData - Updated referral data
   * @returns {Promise<Object>} Updated referral
   */
  updateReferral: async (id, referralData) => {
    return referralService.update(id, referralData, {
      errorMessage: 'Failed to update referral'
    });
  }
};

export default telemedicineApi;