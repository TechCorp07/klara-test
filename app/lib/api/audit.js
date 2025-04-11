// lib/api/audit.js
import apiClient, { buildParams } from './client';

/**
 * Audit and administration-related API functions
 */
const auditApi = {
  /**
   * Get system statistics
   * @returns {Promise<Object>} System statistics
   */
  getSystemStats: async () => {
    const { data } = await apiClient.get('/audit/reports/dashboard/');
    return data;
  },
  
  /**
   * Get audit events with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated audit events
   */
  getAuditEvents: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/audit/events/?${params}`);
    return data;
  },
  
  /**
   * Get audit event by ID
   * @param {string} id - Audit event ID
   * @returns {Promise<Object>} Audit event
   */
  getAuditEvent: async (id) => {
    const { data } = await apiClient.get(`/audit/events/${id}/`);
    return data;
  },
  
  /**
   * Export audit events with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Export response
   */
  exportAuditEvents: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.post(`/audit/events/export/?${params}`);
    return data;
  },
  
  /**
   * Log audit event
   * @param {Object} eventData - Audit event data
   * @returns {Promise<Object>} Created audit event
   */
  logAuditEvent: async (eventData) => {
    const { data } = await apiClient.post('/audit/events/', eventData);
    return data;
  },
  
  /**
   * Get event summary
   * @param {string} timeframe - Timeframe (e.g., 'last_30_days')
   * @returns {Promise<Object>} Event summary
   */
  getEventSummary: async (timeframe = 'last_30_days') => {
    const { data } = await apiClient.get(`/audit/events/summary/?timeframe=${timeframe}`);
    return data;
  },
  
  /**
   * Get user activity
   * @param {string} userId - User ID
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated audit events for user
   */
  getUserActivity: async (userId, filters = {}) => {
    const params = buildParams({
      ...filters,
      user: userId
    });
    const { data } = await apiClient.get(`/audit/events/?${params}`);
    return data;
  },
  
  /**
   * Get resource activity
   * @param {string} type - Resource type
   * @param {string} id - Resource ID
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated audit events for resource
   */
  getResourceActivity: async (type, id, filters = {}) => {
    const params = buildParams({
      ...filters,
      resource_type: type,
      resource_id: id
    });
    const { data } = await apiClient.get(`/audit/events/?${params}`);
    return data;
  },
  
  /**
   * Get PHI access logs with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated PHI access logs
   */
  getPHIAccessLogs: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/audit/phi-access/?${params}`);
    return data;
  },
  
  /**
   * Get security incidents with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated security incidents
   */
  getSecurityIncidents: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/audit/security/?${params}`);
    return data;
  },
  
  /**
   * Log security incident
   * @param {Object} incidentData - Security incident data
   * @returns {Promise<Object>} Created security incident
   */
  logSecurityIncident: async (incidentData) => {
    const { data } = await apiClient.post('/audit/security/', incidentData);
    return data;
  },
  
  /**
   * Resolve security incident
   * @param {string} id - Security incident ID
   * @param {string} resolution - Resolution description
   * @returns {Promise<Object>} Resolved security incident
   */
  resolveSecurityIncident: async (id, resolution) => {
    const { data } = await apiClient.post(`/audit/security/${id}/resolve/`, { resolution });
    return data;
  },
  
  /**
   * Get compliance reports with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated compliance reports
   */
  getComplianceReports: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/audit/reports/?${params}`);
    return data;
  },
  
  /**
   * Get compliance report by ID
   * @param {string} id - Compliance report ID
   * @returns {Promise<Object>} Compliance report
   */
  getComplianceReport: async (id) => {
    const { data } = await apiClient.get(`/audit/reports/${id}/`);
    return data;
  },
  
  /**
   * Generate compliance report
   * @param {string} type - Report type
   * @param {string} range - Date range
   * @returns {Promise<Object>} Generated compliance report
   */
  generateComplianceReport: async (type, range) => {
    const { data } = await apiClient.post('/audit/reports/generate/', {
      report_type: type,
      date_range: range
    });
    return data;
  },
  
  /**
   * Get dashboard metrics
   * @returns {Promise<Object>} Dashboard metrics
   */
  getDashboardMetrics: async () => {
    const { data } = await apiClient.get('/audit/reports/dashboard/');
    return data;
  },
  
  /**
   * Get compliance metrics
   * @returns {Promise<Object>} Compliance metrics
   */
  getComplianceMetrics: async () => {
    const { data } = await apiClient.get('/audit/compliance/metrics/');
    return data;
  },
  
  /**
   * Get patient access history
   * @param {string} patientId - Patient ID
   * @param {Object} options - Options
   * @returns {Promise<Object>} Paginated patient access history
   */
  getPatientAccessHistory: async (patientId, options = {}) => {
    const params = buildParams(options);
    const { data } = await apiClient.get(`/audit/compliance/patient-access/${patientId}/?${params}`);
    return data;
  },
  
  /**
   * Get recent users
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated recent users
   */
  getRecentUsers: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/users/recent/?${params}`);
    return data;
  },
  
  /**
   * Get users with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated users
   */
  getUsers: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/users/users/?${params}`);
    return data;
  },
  
  /**
   * Get system alerts with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated system alerts
   */
  getSystemAlerts: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/audit/alerts/?${params}`);
    return data;
  },
  
  /**
   * Get critical alerts
   * @returns {Promise<Object>} Paginated critical alerts
   */
  getCriticalAlerts: async () => {
    const { data } = await apiClient.get('/audit/alerts/?severity=critical');
    return data;
  },
  
  /**
   * Get admin users
   * @returns {Promise<Object>} Paginated admin users
   */
  getAdminUsers: async () => {
    const { data } = await apiClient.get('/users/users/?role=admin,superadmin');
    return data;
  },
  
  /**
   * Get organization statistics
   * @returns {Promise<Object>} Organization statistics
   */
  getOrganizationStats: async () => {
    const { data } = await apiClient.get('/audit/organizations/stats/');
    return data;
  }
};

export default auditApi;