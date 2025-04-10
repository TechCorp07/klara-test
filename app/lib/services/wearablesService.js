import api from "../apiClient"

// Wearables API calls
export const wearables = {
  // Withings Integration
  getWithingsProfile: async () => {
    try {
      const response = await api.get("/wearables/withings/profile")
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
    const response = await api.get("/wearables/withings/connect")
    return response.data
  },

  fetchWithingsData: async (startDate, endDate) => {
    const params = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    const response = await api.get("/wearables/withings/fetch-data", { params })
    return response.data
  },

  // General Wearable Data
  getWearableData: async (patientId, dataType, startDate, endDate) => {
    const params = {}
    if (patientId) params.patient = patientId
    if (dataType) params.data_type = dataType
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    const response = await api.get("/wearables/data", { params })
    return response.data
  },

  // Wearable Integrations
  getWearableIntegrations: async () => {
    const response = await api.get("/wearables/integrations")
    return response.data
  },

  // Wearable Devices
  getWearableDevices: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/wearables/devices", { params })
    return response.data
  },

  // Wearable Metrics
  getWearableMetrics: async (patientId, metricType, startDate, endDate) => {
    const params = {}
    if (patientId) params.patient = patientId
    if (metricType) params.metric_type = metricType
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    const response = await api.get("/wearables/metrics", { params })
    return response.data
  },
}

export default wearables
