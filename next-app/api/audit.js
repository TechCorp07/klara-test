// lib/api/audit.js
import apiClient, { createApiService, executeApiCall, buildParams } from '@/client';

/**
 * Base API services for audit-related endpoints
 */
const auditEventsService = createApiService('/audit/events');
const auditReportsService = createApiService('/audit/reports');
const auditSecurityService = createApiService('/audit/security');
const userService = createApiService('/users');

/**
 * Audit and administration-related API functions
 */
const auditApi = {
  // Base CRUD operations for audit events
  ...auditEventsService,
  
  /**
   * Get system statistics
   * @returns {Promise<Object>} System statistics
   */
  getSystemStats: async () => {
    return executeApiCall(
      () => apiClient.get('/audit/reports/dashboard/'),
      'Failed to fetch system statistics'
    );
  },
  
  /**
   * Get audit events with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated audit events
   */
  getAuditEvents: async (filters = {}) => {
    return auditEventsService.getList(filters, {
      errorMessage: 'Failed to fetch audit events'
    });
  },
  
  /**
   * Get audit event by ID
   * @param {string} id - Audit event ID
   * @returns {Promise<Object>} Audit event
   */
  getAuditEvent: async (id) => {
    return auditEventsService.getById(id, {
      errorMessage: 'Failed to fetch audit event details'
    });
  },
  
  /**
   * Export audit events with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Export response
   */
  exportAuditEvents: async (filters = {}) => {
    const params = buildParams(filters);
    return executeApiCall(
      () => apiClient.post(`/audit/events/export/?${params}`),
      'Failed to export audit events',
      { filters }
    );
  },
  
  /**
   * Log audit event
   * @param {Object} eventData - Audit event data
   * @returns {Promise<Object>} Created audit event
   */
  logAuditEvent: async (eventData) => {
    return auditEventsService.create(eventData, {
      errorMessage: 'Failed to log audit event'
    });
  },
  
  /**
   * Get event summary
   * @param {string} timeframe - Timeframe (e.g., 'last_30_days')
   * @returns {Promise<Object>} Event summary
   */
  getEventSummary: async (timeframe = 'last_30_days') => {
    return executeApiCall(
      () => apiClient.get(`/audit/events/summary/?timeframe=${timeframe}`),
      'Failed to fetch event summary',
      { timeframe }
    );
  },
  
  /**
   * Get user activity
   * @param {string} userId - User ID
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated audit events for user
   */
  getUserActivity: async (userId, filters = {}) => {
    return auditEventsService.getList({
      ...filters,
      user: userId
    }, {
      errorMessage: 'Failed to fetch user activity',
      trackingContext: { userId }
    });
  },
  
  /**
   * Get resource activity
   * @param {string} type - Resource type
   * @param {string} id - Resource ID
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated audit events for resource
   */
  getResourceActivity: async (type, id, filters = {}) => {
    return auditEventsService.getList({
      ...filters,
      resource_type: type,
      resource_id: id
    }, {
      errorMessage: 'Failed to fetch resource activity',
      trackingContext: { resourceType: type, resourceId: id }
    });
  },
  
  /**
   * Get PHI access logs with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated PHI access logs
   */
  getPHIAccessLogs: async (filters = {}) => {
    const params = buildParams(filters);
    return executeApiCall(
      () => apiClient.get(`/audit/phi-access/?${params}`),
      'Failed to fetch PHI access logs',
      { filters }
    );
  },
  
  /**
   * Get security incidents with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated security incidents
   */
  getSecurityIncidents: async (filters = {}) => {
    return auditSecurityService.getList(filters, {
      errorMessage: 'Failed to fetch security incidents'
    });
  },
  
  /**
   * Log security incident
   * @param {Object} incidentData - Security incident data
   * @returns {Promise<Object>} Created security incident
   */
  logSecurityIncident: async (incidentData) => {
    return auditSecurityService.create(incidentData, {
      errorMessage: 'Failed to log security incident'
    });
  },
  
  /**
   * Resolve security incident
   * @param {string} id - Security incident ID
   * @param {string} resolution - Resolution description
   * @returns {Promise<Object>} Resolved security incident
   */
  resolveSecurityIncident: async (id, resolution) => {
    return auditSecurityService.performAction(id, 'resolve', { resolution }, {
      errorMessage: 'Failed to resolve security incident'
    });
  },
  
  /**
   * Get compliance reports with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated compliance reports
   */
  getComplianceReports: async (filters = {}) => {
    return auditReportsService.getList(filters, {
      errorMessage: 'Failed to fetch compliance reports'
    });
  },
  
  /**
   * Get compliance report by ID
   * @param {string} id - Compliance report ID
   * @returns {Promise<Object>} Compliance report
   */
  getComplianceReport: async (id) => {
    return auditReportsService.getById(id, {
      errorMessage: 'Failed to fetch compliance report'
    });
  },
  
  /**
   * Generate compliance report
   * @param {string} type - Report type
   * @param {string} range - Date range
   * @returns {Promise<Object>} Generated compliance report
   */
  generateComplianceReport: async (type, range) => {
    return executeApiCall(
      () => apiClient.post('/audit/reports/generate/', {
        report_type: type,
        date_range: range
      }),
      'Failed to generate compliance report',
      { reportType: type, dateRange: range }
    );
  },
  
  /**
   * Get dashboard metrics
   * @returns {Promise<Object>} Dashboard metrics
   */
  getDashboardMetrics: async () => {
    return executeApiCall(
      () => apiClient.get('/audit/reports/dashboard/'),
      'Failed to fetch dashboard metrics'
    );
  },
  
  /**
   * Get compliance metrics
   * @returns {Promise<Object>} Compliance metrics
   */
  getComplianceMetrics: async () => {
    return executeApiCall(
      () => apiClient.get('/audit/compliance/metrics/'),
      'Failed to fetch compliance metrics'
    );
  },
  
  /**
   * Get patient access history
   * @param {string} patientId - Patient ID
   * @param {Object} options - Options
   * @returns {Promise<Object>} Paginated patient access history
   */
  getPatientAccessHistory: async (patientId, options = {}) => {
    const params = buildParams(options);
    return executeApiCall(
      () => apiClient.get(`/audit/compliance/patient-access/${patientId}/?${params}`),
      'Failed to fetch patient access history',
      { patientId, ...options }
    );
  },
  
  /**
   * Get recent users
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated recent users
   */
  getRecentUsers: async (filters = {}) => {
    const params = buildParams(filters);
    return executeApiCall(
      () => apiClient.get(`/users/recent/?${params}`),
      'Failed to fetch recent users',
      { filters }
    );
  },
  
  /**
   * Get users with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated users
   */
  getUsers: async (filters = {}) => {
    return userService.getList(filters, {
      errorMessage: 'Failed to fetch users'
    });
  },
  
  /**
   * Get system alerts with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated system alerts
   */
  getSystemAlerts: async (filters = {}) => {
    const params = buildParams(filters);
    return executeApiCall(
      () => apiClient.get(`/audit/alerts/?${params}`),
      'Failed to fetch system alerts',
      { filters }
    );
  },
  
  /**
   * Get critical alerts
   * @returns {Promise<Object>} Paginated critical alerts
   */
  getCriticalAlerts: async () => {
    return executeApiCall(
      () => apiClient.get('/audit/alerts/?severity=critical'),
      'Failed to fetch critical alerts'
    );
  },
  
  /**
   * Get admin users
   * @returns {Promise<Object>} Paginated admin users
   */
  getAdminUsers: async () => {
    return executeApiCall(
      () => apiClient.get('/users/users/?role=admin,superadmin'),
      'Failed to fetch admin users'
    );
  },
  
  /**
   * Get organization statistics
   * @returns {Promise<Object>} Organization statistics
   */
  getOrganizationStats: async () => {
    return executeApiCall(
      () => apiClient.get('/audit/organizations/stats/'),
      'Failed to fetch organization statistics'
    );
  }
};

export default auditApi;