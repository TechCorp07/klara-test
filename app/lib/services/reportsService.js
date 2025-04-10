import api from "../apiClient"

// Reports API calls
export const reports = {
  // Analytics Reports
  getAnalyticsReports: async (options = {}) => {
    const response = await api.get("/reports/analytics", { params: options })
    return response.data
  },

  // Patient Reports
  getPatientReports: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/reports/patients", { params })
    return response.data
  },

  // Provider Reports
  getProviderReports: async (providerId) => {
    const params = providerId ? { provider: providerId } : {}
    const response = await api.get("/reports/providers", { params })
    return response.data
  },

  // Medication Adherence Reports
  getMedicationAdherenceReports: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/reports/medication-adherence", { params })
    return response.data
  },

  // Rare Condition Reports
  getRareConditionReports: async () => {
    const response = await api.get("/reports/rare-conditions")
    return response.data
  },

  // Generate Custom Report
  generateCustomReport: async (reportConfig) => {
    const response = await api.post("/reports/custom", reportConfig)
    return response.data
  },

  // Export Report
  exportReport: async (reportId, format = "pdf") => {
    const response = await api.get(`/reports/${reportId}/export`, {
      params: { format },
      responseType: "blob",
    })
    return response.data
  },
}

export default reports
