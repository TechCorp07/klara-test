// lib/audit.js
import api from "./api"

// Audit API service for HIPAA compliance
export const audit = {
  // Audit Events
  getAuditEvents: async (options = {}) => {
    const params = new URLSearchParams()
    if (options.user) params.append("user", options.user)
    if (options.event_type) params.append("event_type", options.event_type)
    if (options.resource_type) params.append("resource_type", options.resource_type)
    if (options.resource_id) params.append("resource_id", options.resource_id)
    if (options.ip_address) params.append("ip_address", options.ip_address)
    if (options.date_range) params.append("date_range", options.date_range)
    if (options.start_date) params.append("start_date", options.start_date)
    if (options.end_date) params.append("end_date", options.end_date)
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
    if (options.start_date) params.append("start_date", options.start_date)
    if (options.end_date) params.append("end_date", options.end_date)

    const response = await api.post(`/audit/events/export/?${params.toString()}`)
    return response.data
  },

  // PHI Access Logs
  getPHIAccessLogs: async (options = {}) => {
    const params = new URLSearchParams()
    if (options.patient) params.append("patient", options.patient)
    if (options.user) params.append("user", options.user)
    if (options.date_range) params.append("date_range", options.date_range)
    if (options.start_date) params.append("start_date", options.start_date)
    if (options.end_date) params.append("end_date", options.end_date)
    if (options.limit) params.append("limit", options.limit)
    if (options.page) params.append("page", options.page)

    const response = await api.get(`/audit/phi-access/?${params.toString()}`)
    return response.data
  },

  // Security Incidents
  getSecurityIncidents: async (options = {}) => {
    const params = new URLSearchParams()
    if (options.status) params.append("status", options.status)
    if (options.severity) params.append("severity", options.severity)
    if (options.date_range) params.append("date_range", options.date_range)
    if (options.start_date) params.append("start_date", options.start_date)
    if (options.end_date) params.append("end_date", options.end_date)
    if (options.limit) params.append("limit", options.limit)
    if (options.page) params.append("page", options.page)

    const response = await api.get(`/audit/security/?${params.toString()}`)
    return response.data
  },

  logSecurityIncident: async (incidentData) => {
    const response = await api.post("/audit/security/", incidentData)
    return response.data
  },

  resolveSecurityIncident: async (incidentId, resolution) => {
    const response = await api.post(`/audit/security/${incidentId}/resolve/`, { resolution })
    return response.data
  },

  // Compliance Reports
  getComplianceReports: async (options = {}) => {
    const params = new URLSearchParams()
    if (options.report_type) params.append("report_type", options.report_type)
    if (options.start_date) params.append("start_date", options.start_date)
    if (options.end_date) params.append("end_date", options.end_date)
    if (options.limit) params.append("limit", options.limit)
    if (options.page) params.append("page", options.page)

    const response = await api.get(`/audit/reports/?${params.toString()}`)
    return response.data
  },

  getComplianceReport: async (reportId) => {
    const response = await api.get(`/audit/reports/${reportId}/`)
    return response.data
  },

  generateComplianceReport: async (reportType, dateRange) => {
    const response = await api.post("/audit/reports/generate/", {
      report_type: reportType,
      date_range: dateRange,
    })
    return response.data
  },

  // Dashboard Metrics
  getDashboardMetrics: async () => {
    const response = await api.get("/audit/reports/dashboard/")
    return response.data
  },

  // Patient Access History
  getPatientAccessHistory: async (patientId, options = {}) => {
    const params = new URLSearchParams()
    if (options.limit) params.append("limit", options.limit)
    if (options.page) params.append("page", options.page)

    const response = await api.get(`/audit/compliance/patient-access/${patientId}/?${params.toString()}`)
    return response.data
  },

  // Event Summaries
  getEventSummary: async (timeframe = "last_30_days") => {
    const response = await api.get(`/audit/events/summary/?timeframe=${timeframe}`)
    return response.data
  },

  // User Activity
  getUserActivity: async (userId, options = {}) => {
    const params = new URLSearchParams()
    params.append("user", userId)
    if (options.event_type) params.append("event_type", options.event_type)
    if (options.date_range) params.append("date_range", options.date_range)
    if (options.limit) params.append("limit", options.limit)
    if (options.page) params.append("page", options.page)

    const response = await api.get(`/audit/events/?${params.toString()}`)
    return response.data
  },

  // Resource Activity
  getResourceActivity: async (resourceType, resourceId, options = {}) => {
    const params = new URLSearchParams()
    params.append("resource_type", resourceType)
    params.append("resource_id", resourceId)
    if (options.event_type) params.append("event_type", options.event_type)
    if (options.date_range) params.append("date_range", options.date_range)
    if (options.limit) params.append("limit", options.limit)
    if (options.page) params.append("page", options.page)

    const response = await api.get(`/audit/events/?${params.toString()}`)
    return response.data
  },

  // Log manual audit event (for client-side actions)
  logAuditEvent: async (eventData) => {
    const response = await api.post("/audit/events/", eventData)
    return response.data
  },
}

export default audit
