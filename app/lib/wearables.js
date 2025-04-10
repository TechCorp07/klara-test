// lib/wearables.js
import api from "./api"

// Wearables API service for device integrations
export const wearables = {
  // Withings Integration
  getWithingsProfile: async () => {
    try {
      const response = await api.get("/health-devices/withings/profile/")
      return response.data
    } catch (error) {
      // Return null if profile doesn't exist (404)
      if (error.response && error.response.status === 404) {
        return null
      }
      throw error
    }
  },

  connectWithings: async () => {
    const response = await api.get("/health-devices/withings/connect/")
    return response.data
  },

  fetchWithingsData: async (startDate, endDate) => {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)

    const response = await api.get(`/health-devices/withings/fetch-data/?${params.toString()}`)
    return response.data
  },

  disconnectWithings: async () => {
    const response = await api.post("/health-devices/withings/disconnect/")
    return response.data
  },

  // Health Device Management
  getDevices: async () => {
    const response = await api.get("/health-devices/")
    return response.data
  },

  getDevice: async (id) => {
    const response = await api.get(`/health-devices/${id}/`)
    return response.data
  },

  registerDevice: async (deviceData) => {
    const response = await api.post("/health-devices/", deviceData)
    return response.data
  },

  updateDevice: async (id, deviceData) => {
    const response = await api.patch(`/health-devices/${id}/`, deviceData)
    return response.data
  },

  deleteDevice: async (id) => {
    const response = await api.delete(`/health-devices/${id}/`)
    return response.data
  },

  getDeviceStatus: async (id) => {
    const response = await api.get(`/health-devices/${id}/status/`)
    return response.data
  },

  syncDevice: async (id) => {
    const response = await api.post(`/health-devices/${id}/sync/`)
    return response.data
  },

  // Measurements
  getMeasurements: async (options = {}) => {
    const params = new URLSearchParams()
    if (options.deviceId) params.append("device", options.deviceId)
    if (options.type) params.append("type", options.type)
    if (options.startDate) params.append("start_date", options.startDate)
    if (options.endDate) params.append("end_date", options.endDate)
    if (options.limit) params.append("limit", options.limit)
    if (options.offset) params.append("offset", options.offset)

    const response = await api.get(`/health-devices/measurements/?${params.toString()}`)
    return response.data
  },

  getMeasurementsByType: async (type, options = {}) => {
    const params = new URLSearchParams()
    params.append("type", type)
    if (options.startDate) params.append("start_date", options.startDate)
    if (options.endDate) params.append("end_date", options.endDate)
    if (options.limit) params.append("limit", options.limit)
    if (options.offset) params.append("offset", options.offset)

    const response = await api.get(`/health-devices/measurements/?${params.toString()}`)
    return response.data
  },

  // Other integrations
  getIntegrations: async () => {
    const response = await api.get("/health-devices/integrations/")
    return response.data
  },

  getIntegrationConfig: async (provider) => {
    const response = await api.get(`/health-devices/integrations/${provider}/config/`)
    return response.data
  },

  // Analytics
  getHealthSummary: async (startDate, endDate) => {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)

    const response = await api.get(`/health-devices/summary/?${params.toString()}`)
    return response.data
  },

  getTrends: async (measurementType, options = {}) => {
    const params = new URLSearchParams()
    params.append("type", measurementType)
    if (options.startDate) params.append("start_date", options.startDate)
    if (options.endDate) params.append("end_date", options.endDate)
    if (options.interval) params.append("interval", options.interval)

    const response = await api.get(`/health-devices/trends/?${params.toString()}`)
    return response.data
  },

  // Insights and Recommendations
  getInsights: async () => {
    const response = await api.get("/health-devices/insights/")
    return response.data
  },

  getRecommendations: async () => {
    const response = await api.get("/health-devices/recommendations/")
    return response.data
  },
}
