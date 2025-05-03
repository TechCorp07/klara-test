/**
 * Patient service for interacting with Django patient endpoints
 */
import apiClient from "../api-client"
import redisClient from "../redis-client"

const patientService = {
  /**
   * Get all patients with optional filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Patients list response
   */
  getPatients: async (params = {}) => {
    const cacheKey = `patients:${JSON.stringify(params)}`

    // Try to get from cache first
    const cachedData = await redisClient.getValue(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // If not in cache, fetch from API
    const response = await apiClient.request("/patients/", {
      params,
    })

    // Cache the response for 5 minutes
    await redisClient.setWithExpiry(cacheKey, response, 300)

    return response
  },

  /**
   * Get patient by ID
   * @param {number} id - Patient ID
   * @returns {Promise<Object>} - Patient details
   */
  getPatientById: async (id) => {
    const cacheKey = `patient:${id}`

    // Try to get from cache first
    const cachedData = await redisClient.getValue(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // If not in cache, fetch from API
    const response = await apiClient.request(`/patients/${id}/`)

    // Cache the response for 5 minutes
    await redisClient.setWithExpiry(cacheKey, response, 300)

    return response
  },

  /**
   * Create a new patient
   * @param {Object} patientData - Patient data
   * @returns {Promise<Object>} - Created patient
   */
  createPatient: async (patientData) => {
    const response = await apiClient.request("/patients/", {
      method: "POST",
      data: patientData,
    })

    // Invalidate patients cache
    await redisClient.deleteValue("patients:*")

    return response
  },

  /**
   * Update a patient
   * @param {number} id - Patient ID
   * @param {Object} patientData - Updated patient data
   * @returns {Promise<Object>} - Updated patient
   */
  updatePatient: async (id, patientData) => {
    const response = await apiClient.request(`/patients/${id}/`, {
      method: "PUT",
      data: patientData,
    })

    // Invalidate specific patient cache and patients list cache
    await redisClient.deleteValue(`patient:${id}`)
    await redisClient.deleteValue("patients:*")

    return response
  },

  /**
   * Get patient medical records
   * @param {number} id - Patient ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Medical records
   */
  getPatientMedicalRecords: async (id, params = {}) => {
    return apiClient.request(`/patients/${id}/medical-records/`, {
      params,
    })
  },

  /**
   * Get patient medications
   * @param {number} id - Patient ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Medications
   */
  getPatientMedications: async (id, params = {}) => {
    return apiClient.request(`/patients/${id}/medications/`, {
      params,
    })
  },

  /**
   * Get patient health metrics
   * @param {number} id - Patient ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Health metrics
   */
  getPatientHealthMetrics: async (id, params = {}) => {
    return apiClient.request(`/patients/${id}/health-metrics/`, {
      params,
    })
  },

  /**
   * Upload patient document
   * @param {number} id - Patient ID
   * @param {FormData} formData - Form data with file
   * @returns {Promise<Object>} - Upload response
   */
  uploadPatientDocument: async (id, formData) => {
    return apiClient.request(`/patients/${id}/documents/upload/`, {
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },

  /**
   * Get patient documents
   * @param {number} id - Patient ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Documents
   */
  getPatientDocuments: async (id, params = {}) => {
    return apiClient.request(`/patients/${id}/documents/`, {
      params,
    })
  },

  /**
   * Search patients
   * @param {string} query - Search query
   * @returns {Promise<Object>} - Search results
   */
  searchPatients: async (query) => {
    return apiClient.request("/patients/search/", {
      params: { query },
    })
  },
}

export default patientService
