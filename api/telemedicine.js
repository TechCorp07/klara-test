// api/telemedicine.js
// lib/api/telemedicine.js
import { apiRequest, createApiService } from "./client"

/**
 * Base API service for appointment-related endpoints
 */
const telemedicineApi = createApiService("/telemedicine")

/**
 * Telemedicine-related API functions
 */
const telemedicine = {
  ...telemedicineApi,

  /**
   * Get upcoming appointments
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated appointments
   */
  getUpcomingAppointments: (filters = {}) =>
    apiRequest("GET", "/telemedicine/appointments/upcoming", null, {
      params: filters,
      errorMessage: "Failed to fetch upcoming appointments",
    }),

  /**
   * Get provider appointments
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated appointments
   */
  getProviderAppointments: (filters = {}) =>
    apiRequest("GET", "/telemedicine/provider/appointments", null, {
      params: filters,
      errorMessage: "Failed to fetch provider appointments",
    }),

  /**
   * Schedule appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} Created appointment
   */
  scheduleAppointment: (appointmentData) =>
    apiRequest("POST", "/telemedicine/appointments", appointmentData, {
      errorMessage: "Failed to schedule appointment",
      successMessage: "Appointment scheduled successfully",
    }),

  /**
   * Cancel appointment
   * @param {string} appointmentId - Appointment ID
   * @param {Object} cancellationData - Cancellation data with reason
   * @returns {Promise<Object>} Cancellation response
   */
  cancelAppointment: (appointmentId, cancellationData) =>
    apiRequest("POST", `/telemedicine/appointments/${appointmentId}/cancel`, cancellationData, {
      errorMessage: "Failed to cancel appointment",
      successMessage: "Appointment cancelled successfully",
    }),

  /**
   * Reschedule appointment
   * @param {string} appointmentId - Appointment ID
   * @param {Object} rescheduleData - Reschedule data with new time
   * @returns {Promise<Object>} Rescheduled appointment
   */
  rescheduleAppointment: (appointmentId, rescheduleData) =>
    apiRequest("POST", `/telemedicine/appointments/${appointmentId}/reschedule`, rescheduleData, {
      errorMessage: "Failed to reschedule appointment",
      successMessage: "Appointment rescheduled successfully",
    }),

  /**
   * Get provider availability
   * @param {string} providerId - Provider ID
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Provider availability
   */
  getProviderAvailability: (providerId, filters = {}) =>
    apiRequest("GET", `/telemedicine/providers/${providerId}/availability`, null, {
      params: filters,
      errorMessage: "Failed to fetch provider availability",
    }),

  /**
   * Get provider messages
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated messages
   */
  getProviderMessages: (filters = {}) =>
    apiRequest("GET", "/telemedicine/provider/messages", null, {
      params: filters,
      errorMessage: "Failed to fetch provider messages",
    }),

  /**
   * Start telemedicine session
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<Object>} Session details
   */
  startSession: (appointmentId) =>
    apiRequest("POST", `/telemedicine/appointments/${appointmentId}/start`, null, {
      errorMessage: "Failed to start telemedicine session",
    }),

  /**
   * End telemedicine session
   * @param {string} sessionId - Session ID
   * @param {Object} sessionData - Session data with notes
   * @returns {Promise<Object>} Session summary
   */
  endSession: (sessionId, sessionData) =>
    apiRequest("POST", `/telemedicine/sessions/${sessionId}/end`, sessionData, {
      errorMessage: "Failed to end telemedicine session",
      successMessage: "Session ended successfully",
    }),
}

export default telemedicine
