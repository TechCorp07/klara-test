import api from "../apiClient"

// Audit API calls
export const audit = {
  // Audit Events
  getEvents: async (options = {}) => {
    const response = await api.get("/audit/events", { params: options })
    return response.data
  },

  // Export Audit Events
  exportEvents: async (options = {}) => {
    const response = await api.post("/audit/exports", options)
    return response.data
  },

  // Audit Logs
  getAuditLogs: async (options = {}) => {
    const response = await api.get("/audit/logs", { params: options })
    return response.data
  },

  // Compliance Reports
  getComplianceReports: async () => {
    const response = await api.get("/audit/compliance-reports")
    return response.data
  },

  // Security Incidents
  getSecurityIncidents: async () => {
    const response = await api.get("/audit/security-incidents")
    return response.data
  },

  // Report Security Incident
  reportSecurityIncident: async (incidentData) => {
    const response = await api.post("/audit/security-incidents", incidentData)
    return response.data
  },
}

export default audit

// Export audit as auditService for named imports
export const auditService = audit
