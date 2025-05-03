// api/audit.js
// lib/api/audit.js
import { apiRequest, createApiService } from "./client"

/**
 * Base API services for audit-related endpoints
 */
const auditApi = createApiService("/audit")

/**
 * Audit-related API functions
 */
const audit = {
  ...auditApi,

  /**
   * Get audit logs with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated audit logs
   */
  getAuditLogs: (filters = {}) =>
    apiRequest("GET", "/audit/logs", null, {
      params: filters,
      errorMessage: "Failed to fetch audit logs",
    }),

  /**
   * Get system statistics
   * @returns {Promise<Object>} System statistics
   */
  getSystemStats: () =>
    apiRequest("GET", "/audit/system/stats", null, {
      errorMessage: "Failed to fetch system statistics",
    }),

  /**
   * Get recent users
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated recent users
   */
  getRecentUsers: (filters = {}) =>
    apiRequest("GET", "/audit/users/recent", null, {
      params: filters,
      errorMessage: "Failed to fetch recent users",
    }),

  /**
   * Get system alerts
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated system alerts
   */
  getSystemAlerts: (filters = {}) =>
    apiRequest("GET", "/audit/system/alerts", null, {
      params: filters,
      errorMessage: "Failed to fetch system alerts",
    }),
}

export default audit
