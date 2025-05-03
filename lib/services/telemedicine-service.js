/**
 * Telemedicine service for appointment and consultation operations
 */
import apiClient from "../api-client"
import { API_ENDPOINTS } from "../config"

const telemedicineService = {
  /**
   * Get list of appointments
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated appointments
   */
  getAppointments: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.TELEMEDICINE.APPOINTMENTS, {
      params,
      errorMessage: "Failed to fetch appointments",
    })
  },

  /**
   * Get a specific appointment by ID
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<Object>} - Appointment details
   */
  getAppointmentById: (appointmentId) => {
    return apiClient.get(API_ENDPOINTS.TELEMEDICINE.APPOINTMENT(appointmentId), {
      errorMessage: "Failed to fetch appointment details",
    })
  },

  /**
   * Create a new appointment
   * @param {Object} data - Appointment data
   * @returns {Promise<Object>} - Created appointment
   */
  createAppointment: (data) => {
    return apiClient.post(API_ENDPOINTS.TELEMEDICINE.APPOINTMENTS, data, {
      errorMessage: "Failed to create appointment",
      successMessage: "Appointment created successfully",
    })
  },

  /**
   * Update an appointment
   * @param {string} appointmentId - Appointment ID
   * @param {Object} data - Updated appointment data
   * @returns {Promise<Object>} - Updated appointment
   */
  updateAppointment: (appointmentId, data) => {
    return apiClient.put(API_ENDPOINTS.TELEMEDICINE.APPOINTMENT(appointmentId), data, {
      errorMessage: "Failed to update appointment",
      successMessage: "Appointment updated successfully",
    })
  },

  /**
   * Delete an appointment
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<Object>} - Deletion result
   */
  deleteAppointment: (appointmentId) => {
    return apiClient.delete(API_ENDPOINTS.TELEMEDICINE.APPOINTMENT(appointmentId), {
      errorMessage: "Failed to delete appointment",
      successMessage: "Appointment deleted successfully",
    })
  },

  /**
   * Get list of consultations
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated consultations
   */
  getConsultations: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.TELEMEDICINE.CONSULTATIONS, {
      params,
      errorMessage: "Failed to fetch consultations",
    })
  },

  /**
   * Get a specific consultation by ID
   * @param {string} consultationId - Consultation ID
   * @returns {Promise<Object>} - Consultation details
   */
  getConsultationById: (consultationId) => {
    return apiClient.get(API_ENDPOINTS.TELEMEDICINE.CONSULTATION(consultationId), {
      errorMessage: "Failed to fetch consultation details",
    })
  },

  /**
   * Create a new consultation
   * @param {Object} data - Consultation data
   * @returns {Promise<Object>} - Created consultation
   */
  createConsultation: (data) => {
    return apiClient.post(API_ENDPOINTS.TELEMEDICINE.CONSULTATIONS, data, {
      errorMessage: "Failed to create consultation",
      successMessage: "Consultation created successfully",
    })
  },

  /**
   * Get provider availability
   * @param {Object} params - Query parameters (e.g., provider_id, date_range)
   * @returns {Promise<Object>} - Provider availability data
   */
  getProviderAvailability: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.TELEMEDICINE.AVAILABILITY, {
      params,
      errorMessage: "Failed to fetch provider availability",
    })
  },

  /**
   * Set provider availability
   * @param {Object} data - Availability data
   * @returns {Promise<Object>} - Created availability record
   */
  setProviderAvailability: (data) => {
    return apiClient.post(API_ENDPOINTS.TELEMEDICINE.AVAILABILITY, data, {
      errorMessage: "Failed to set provider availability",
      successMessage: "Provider availability set successfully",
    })
  },

  /**
   * Get waiting room status
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Waiting room data
   */
  getWaitingRoomStatus: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.TELEMEDICINE.WAITING_ROOMS, {
      params,
      errorMessage: "Failed to fetch waiting room status",
    })
  },

  /**
   * Get waiting room patients
   * @param {string} waitingRoomId - Waiting room ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Waiting room patients data
   */
  getWaitingRoomPatients: (waitingRoomId, params = {}) => {
    return apiClient.get(`${API_ENDPOINTS.TELEMEDICINE.WAITING_ROOMS}/${waitingRoomId}/patients`, {
      params,
      errorMessage: "Failed to fetch waiting room patients",
    })
  },

  /**
   * Create consultation notes
   * @param {Object} data - Consultation notes data
   * @returns {Promise<Object>} - Created consultation notes
   */
  createConsultationNotes: (data) => {
    return apiClient.post(API_ENDPOINTS.TELEMEDICINE.CONSULTATION_NOTES, data, {
      errorMessage: "Failed to create consultation notes",
      successMessage: "Consultation notes created successfully",
    })
  },

  /**
   * Get consultation notes
   * @param {Object} params - Query parameters (e.g., consultation_id)
   * @returns {Promise<Object>} - Consultation notes data
   */
  getConsultationNotes: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.TELEMEDICINE.CONSULTATION_NOTES, {
      params,
      errorMessage: "Failed to fetch consultation notes",
    })
  },
}

export default telemedicineService
