// File: /lib/security.js
import api from "./api"

// Security API service for handling user security settings and audit logs
export const security = {
  // Get security status overview for a user
  getSecurityStatus: async () => {
    try {
      const response = await api.get("/security/status/")
      return response.data
    } catch (error) {
      // Handle 404 gracefully for new users without security profile
      if (error.response && error.response.status === 404) {
        return {
          password_status: "warning",
          password_description: "No password history found. Please consider updating your password.",
          two_factor_status: "danger",
          two_factor_description:
            "Two-factor authentication is not enabled. Enable it to add an extra layer of security.",
          account_activity_status: "secure",
          account_activity_description: "No suspicious activity detected in your recent account history.",
          two_factor_enabled: false,
        }
      }
      throw error
    }
  },

  // Get recent account activity
  getRecentActivity: async (limit = 10) => {
    const response = await api.get(`/security/activity/?limit=${limit}`)
    return response.data
  },

  // Get detailed activity for user
  getActivityHistory: async (options = {}) => {
    const params = new URLSearchParams()
    if (options.startDate) params.append("start_date", options.startDate)
    if (options.endDate) params.append("end_date", options.endDate)
    if (options.type) params.append("type", options.type)
    if (options.ip) params.append("ip_address", options.ip)
    if (options.limit) params.append("limit", options.limit)
    if (options.page) params.append("page", options.page)

    const response = await api.get(`/security/activity/?${params.toString()}`)
    return response.data
  },

  // Get active sessions for current user
  getActiveSessions: async () => {
    const response = await api.get("/security/sessions/")
    return response.data
  },

  // Terminate a specific session
  terminateSession: async (sessionId) => {
    const response = await api.delete(`/security/sessions/${sessionId}/`)
    return response.data
  },

  // Terminate all sessions except current
  terminateAllSessions: async () => {
    const response = await api.delete("/security/sessions/all/")
    return response.data
  },

  // Get Two-Factor Authentication status
  getTwoFactorStatus: async () => {
    try {
      const response = await api.get("/security/2fa/status/")
      return response.data
    } catch (error) {
      // Handle 404 gracefully for users without 2FA enabled
      if (error.response && error.response.status === 404) {
        return { enabled: false }
      }
      throw error
    }
  },

  // Get API keys for current user
  getApiKeys: async () => {
    const response = await api.get("/security/api-keys/")
    return response.data
  },

  // Create a new API key
  createApiKey: async (name, expiresIn) => {
    const response = await api.post("/security/api-keys/", { name, expires_in: expiresIn })
    return response.data
  },

  // Revoke an API key
  revokeApiKey: async (keyId) => {
    const response = await api.delete(`/security/api-keys/${keyId}/`)
    return response.data
  },

  // Audit API calls (admin only)
  audit: {
    getAuditEvents: async (options = {}) => {
      const params = new URLSearchParams()
      if (options.user) params.append("user", options.user)
      if (options.event_type) params.append("event_type", options.event_type)
      if (options.resource_type) params.append("resource_type", options.resource_type)
      if (options.resource_id) params.append("resource_id", options.resource_id)
      if (options.ip_address) params.append("ip_address", options.ip_address)
      if (options.date_range) params.append("date_range", options.date_range)
      if (options.limit) params.append("limit", options.limit)
      if (options.page) params.append("page", options.page)

      const response = await api.get(`/audit/events/?${params.toString()}`)
      return response.data
    },

    getAuditEvent: async (eventId) => {
      const response = await api.get(`/audit/events/${eventId}/`)
      return response.data
    },

    exportAuditEvents: async (options = {}) => {
      const params = new URLSearchParams()
      if (options.user) params.append("user", options.user)
      if (options.event_type) params.append("event_type", options.event_type)
      if (options.resource_type) params.append("resource_type", options.resource_type)
      if (options.date_range) params.append("date_range", options.date_range)

      const response = await api.post(`/audit/events/export/?${params.toString()}`)
      return response.data
    },

    getDashboardMetrics: async () => {
      const response = await api.get("/audit/reports/dashboard/")
      return response.data
    },

    getPHIAccessLogs: async (options = {}) => {
      const params = new URLSearchParams()
      if (options.patient) params.append("patient", options.patient)
      if (options.user) params.append("user", options.user)
      if (options.date_range) params.append("date_range", options.date_range)
      if (options.limit) params.append("limit", options.limit)
      if (options.page) params.append("page", options.page)

      const response = await api.get(`/audit/phi-access/?${params.toString()}`)
      return response.data
    },

    getSecurityIncidents: async (options = {}) => {
      const params = new URLSearchParams()
      if (options.status) params.append("status", options.status)
      if (options.severity) params.append("severity", options.severity)
      if (options.date_range) params.append("date_range", options.date_range)
      if (options.limit) params.append("limit", options.limit)
      if (options.page) params.append("page", options.page)

      const response = await api.get(`/audit/security/?${params.toString()}`)
      return response.data
    },

    resolveSecurityIncident: async (incidentId, resolution) => {
      const response = await api.post(`/audit/security/${incidentId}/resolve/`, { resolution })
      return response.data
    },

    getComplianceReports: async () => {
      const response = await api.get("/audit/reports/")
      return response.data
    },

    generateComplianceReport: async (reportType, dateRange) => {
      const response = await api.post("/audit/reports/generate/", {
        report_type: reportType,
        date_range: dateRange,
      })
      return response.data
    },
  },
}

export default security
