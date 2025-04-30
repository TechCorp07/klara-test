"use client"

import { apiRequest } from "../../api/client"

/**
 * Audit service for system logging and monitoring
 */
export const auditService = {
  /**
   * Get system statistics
   * @returns {Promise<Object>} System statistics
   */
  getSystemStats: () =>
    apiRequest("GET", "/audit/system-stats", null, {
      errorMessage: "Failed to fetch system statistics",
    }),

  /**
   * Get recent users
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Recent users data
   */
  getRecentUsers: (params = {}) =>
    apiRequest("GET", "/audit/recent-users", params, {
      errorMessage: "Failed to fetch recent users",
    }),

  /**
   * Get system alerts
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} System alerts data
   */
  getSystemAlerts: (params = {}) =>
    apiRequest("GET", "/audit/system-alerts", params, {
      errorMessage: "Failed to fetch system alerts",
    }),

  /**
   * Get audit logs
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Audit logs data
   */
  getAuditLogs: (params = {}) =>
    apiRequest("GET", "/audit/logs", params, {
      errorMessage: "Failed to fetch audit logs",
    }),

  /**
   * Get audit log details
   * @param {string} id - Audit log ID
   * @returns {Promise<Object>} Audit log details
   */
  getAuditLogDetails: (id) =>
    apiRequest("GET", `/audit/logs/${id}`, null, {
      errorMessage: "Failed to fetch audit log details",
    }),

  /**
   * Create audit log entry
   * @param {Object} data - Audit log data
   * @returns {Promise<Object>} Created audit log
   */
  createAuditLog: (data) =>
    apiRequest("POST", "/audit/logs", data, {
      errorMessage: "Failed to create audit log",
      successMessage: "Audit log created successfully",
    }),

  /**
   * Get compliance report
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Compliance report data
   */
  getComplianceReport: (params = {}) =>
    apiRequest("GET", "/audit/compliance-report", params, {
      errorMessage: "Failed to fetch compliance report",
    }),
}

// Export the audit service with a different name for compatibility
export const audit = auditService
