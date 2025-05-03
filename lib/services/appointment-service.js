/**
 * Appointment service for interacting with Django appointment endpoints
 */
import apiClient from "../api-client"
import redisClient from "../redis-client"

const appointmentService = {
  /**
   * Get all appointments with optional filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Appointments list response
   */
  getAppointments: async (params = {}) => {
    const cacheKey = `appointments:${JSON.stringify(params)}`

    // Try to get from cache first
    const cachedData = await redisClient.getValue(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // If not in cache, fetch from API
    const response = await apiClient.request("/appointments/", {
      params,
    })

    // Cache the response for 5 minutes
    await redisClient.setWithExpiry(cacheKey, response, 300)

    return response
  },

  /**
   * Get appointment by ID
   * @param {number} id - Appointment ID
   * @returns {Promise<Object>} - Appointment details
   */
  getAppointmentById: async (id) => {
    const cacheKey = `appointment:${id}`

    // Try to get from cache first
    const cachedData = await redisClient.getValue(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // If not in cache, fetch from API
    const response = await apiClient.request(`/appointments/${id}/`)

    // Cache the response for 5 minutes
    await redisClient.setWithExpiry(cacheKey, response, 300)

    return response
  },

  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} - Created appointment
   */
  createAppointment: async (appointmentData) => {
    const response = await apiClient.request("/appointments/", {
      method: "POST",
      data: appointmentData,
    })

    // Invalidate appointments cache
    await redisClient.deleteValue("appointments:*")

    return response
  },

  /**
   * Update an appointment
   * @param {number} id - Appointment ID
   * @param {Object} appointmentData - Updated appointment data
   * @returns {Promise<Object>} - Updated appointment
   */
  updateAppointment: async (id, appointmentData) => {
    const response = await apiClient.request(`/appointments/${id}/`, {
      method: "PUT",
      data: appointmentData,
    })

    // Invalidate specific appointment cache and appointments list cache
    await redisClient.deleteValue(`appointment:${id}`)
    await redisClient.deleteValue("appointments:*")

    return response
  },

  /**
   * Cancel an appointment
   * @param {number} id - Appointment ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} - Cancellation response
   */
  cancelAppointment: async (id, reason) => {
    const response = await apiClient.request(`/appointments/${id}/cancel/`, {
      method: "POST",
      data: { reason },
    })

    // Invalidate specific appointment cache and appointments list cache
    await redisClient.deleteValue(`appointment:${id}`)
    await redisClient.deleteValue("appointments:*")

    return response
  },

  /**
   * Get available appointment slots
   * @param {Object} params - Query parameters (date, provider_id, etc.)
   * @returns {Promise<Object>} - Available slots
   */
  getAvailableSlots: async (params = {}) => {
    const cacheKey = `appointment-slots:${JSON.stringify(params)}`

    // Try to get from cache first (short cache time for availability)
    const cachedData = await redisClient.getValue(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // If not in cache, fetch from API
    const response = await apiClient.request("/appointments/available-slots/", {
      params,
    })

    // Cache the response for 2 minutes (short time as availability changes frequently)
    await redisClient.setWithExpiry(cacheKey, response, 120)

    return response
  },

  /**
   * Get appointment history for a patient
   * @param {number} patientId - Patient ID
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} - Appointment history
   */
  getPatientAppointmentHistory: async (patientId, params = {}) => {
    return apiClient.request(`/appointments/patient/${patientId}/history/`, {
      params,
    })
  },

  /**
   * Get upcoming appointments for a patient
   * @param {number} patientId - Patient ID
   * @returns {Promise<Object>} - Upcoming appointments
   */
  getPatientUpcomingAppointments: async (patientId) => {
    return apiClient.request(`/appointments/patient/${patientId}/upcoming/`)
  },

  /**
   * Get provider schedule
   * @param {number} providerId - Provider ID
   * @param {Object} params - Query parameters (date range, etc.)
   * @returns {Promise<Object>} - Provider schedule
   */
  getProviderSchedule: async (providerId, params = {}) => {
    return apiClient.request(`/appointments/provider/${providerId}/schedule/`, {
      params,
    })
  },

  /**
   * Check in for an appointment
   * @param {number} id - Appointment ID
   * @returns {Promise<Object>} - Check-in response
   */
  checkInAppointment: async (id) => {
    const response = await apiClient.request(`/appointments/${id}/check-in/`, {
      method: "POST",
    })

    // Invalidate specific appointment cache
    await redisClient.deleteValue(`appointment:${id}`)

    return response
  },

  /**
   * Complete an appointment
   * @param {number} id - Appointment ID
   * @param {Object} data - Completion data (notes, follow-up, etc.)
   * @returns {Promise<Object>} - Completion response
   */
  completeAppointment: async (id, data) => {
    const response = await apiClient.request(`/appointments/${id}/complete/`, {
      method: "POST",
      data,
    })

    // Invalidate specific appointment cache and appointments list cache
    await redisClient.deleteValue(`appointment:${id}`)
    await redisClient.deleteValue("appointments:*")

    return response
  },
}

export default appointmentService
