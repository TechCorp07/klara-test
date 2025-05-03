/**
 * Provider service for interacting with Django provider endpoints
 */
import apiClient from "../api-client"
import redisClient from "../redis-client"

const providerService = {
  /**
   * Get all providers with optional filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Providers list response
   */
  getProviders: async (params = {}) => {
    const cacheKey = `providers:${JSON.stringify(params)}`

    // Try to get from cache first
    const cachedData = await redisClient.getValue(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // If not in cache, fetch from API
    const response = await apiClient.request("/providers/", {
      params,
    })

    // Cache the response for 5 minutes
    await redisClient.setWithExpiry(cacheKey, response, 300)

    return response
  },

  /**
   * Get provider by ID
   * @param {number} id - Provider ID
   * @returns {Promise<Object>} - Provider details
   */
  getProviderById: async (id) => {
    const cacheKey = `provider:${id}`

    // Try to get from cache first
    const cachedData = await redisClient.getValue(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // If not in cache, fetch from API
    const response = await apiClient.request(`/providers/${id}/`)

    // Cache the response for 5 minutes
    await redisClient.setWithExpiry(cacheKey, response, 300)

    return response
  },

  /**
   * Create a new provider
   * @param {Object} providerData - Provider data
   * @returns {Promise<Object>} - Created provider
   */
  createProvider: async (providerData) => {
    const response = await apiClient.request("/providers/", {
      method: "POST",
      data: providerData,
    })

    // Invalidate providers cache
    await redisClient.deleteValue("providers:*")

    return response
  },

  /**
   * Update a provider
   * @param {number} id - Provider ID
   * @param {Object} providerData - Updated provider data
   * @returns {Promise<Object>} - Updated provider
   */
  updateProvider: async (id, providerData) => {
    const response = await apiClient.request(`/providers/${id}/`, {
      method: "PUT",
      data: providerData,
    })

    // Invalidate specific provider cache and providers list cache
    await redisClient.deleteValue(`provider:${id}`)
    await redisClient.deleteValue("providers:*")

    return response
  },

  /**
   * Get provider schedule
   * @param {number} id - Provider ID
   * @param {Object} params - Query parameters (date range, etc.)
   * @returns {Promise<Object>} - Provider schedule
   */
  getProviderSchedule: async (id, params = {}) => {
    return apiClient.request(`/providers/${id}/schedule/`, {
      params,
    })
  },

  /**
   * Get provider availability
   * @param {number} id - Provider ID
   * @param {Object} params - Query parameters (date, etc.)
   * @returns {Promise<Object>} - Provider availability
   */
  getProviderAvailability: async (id, params = {}) => {
    return apiClient.request(`/providers/${id}/availability/`, {
      params,
    })
  },

  /**
   * Update provider availability
   * @param {number} id - Provider ID
   * @param {Object} availabilityData - Availability data
   * @returns {Promise<Object>} - Updated availability
   */
  updateProviderAvailability: async (id, availabilityData) => {
    return apiClient.request(`/providers/${id}/availability/`, {
      method: "PUT",
      data: availabilityData,
    })
  },

  /**
   * Get provider patients
   * @param {number} id - Provider ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Provider's patients
   */
  getProviderPatients: async (id, params = {}) => {
    return apiClient.request(`/providers/${id}/patients/`, {
      params,
    })
  },

  /**
   * Search providers
   * @param {Object} params - Search parameters (specialty, name, etc.)
   * @returns {Promise<Object>} - Search results
   */
  searchProviders: async (params = {}) => {
    return apiClient.request("/providers/search/", {
      params,
    })
  },

  /**
   * Get provider specialties
   * @returns {Promise<Object>} - List of specialties
   */
  getSpecialties: async () => {
    const cacheKey = "provider-specialties"

    // Try to get from cache first
    const cachedData = await redisClient.getValue(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // If not in cache, fetch from API
    const response = await apiClient.request("/providers/specialties/")

    // Cache the response for 1 day (specialties don't change often)
    await redisClient.setWithExpiry(cacheKey, response, 86400)

    return response
  },
}

export default providerService
