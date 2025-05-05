// lib/services/auditService.js
// Service wrapper for audit logging and monitoring
// Updated based on API documentation analysis

import { apiRequest } from "@/api/client";

/**
 * Audit service for system logging and monitoring
 */
export const auditService = {
  /**
   * Get system statistics
   * Aligned with GET /audit/system-stats
   * @returns {Promise<Object>} System statistics
   */
  getSystemStats: () =>
    apiRequest("GET", "/audit/system-stats", null, {
      errorMessage: "Failed to fetch system statistics",
    }),

  /**
   * Get audit logs
   * Aligned with GET /audit/logs
   * @param {Object} params - Query parameters (e.g., user_id, action, start_date, end_date)
   * @returns {Promise<Object>} Audit logs data
   */
  getAuditLogs: (params = {}) =>
    apiRequest("GET", "/audit/logs", null, {
      params,
      errorMessage: "Failed to fetch audit logs",
    }),

  /**
   * Get audit log details
   * Aligned with GET /audit/logs/{log_id}
   * @param {string} logId - Audit log ID
   * @returns {Promise<Object>} Audit log details
   */
  getAuditLogDetails: (logId) =>
    apiRequest("GET", `/audit/logs/${logId}`, null, {
      errorMessage: "Failed to fetch audit log details",
    }),

  /**
   * Create audit log entry
   * Aligned with POST /audit/logs
   * @param {Object} data - Audit log data (e.g., user_id, action, details)
   * @returns {Promise<Object>} Created audit log
   */
  createAuditLog: (data) =>
    apiRequest("POST", "/audit/logs", data, {
      errorMessage: "Failed to create audit log",
      // successMessage: "Audit log created successfully", // Usually not needed for logging
    }),

  /**
   * Get compliance report
   * Aligned with GET /audit/compliance-report
   * @param {Object} params - Query parameters (e.g., report_type, date_range)
   * @returns {Promise<Object>} Compliance report data
   */
  getComplianceReport: (params = {}) =>
    apiRequest("GET", "/audit/compliance-report", null, {
      params,
      errorMessage: "Failed to fetch compliance report",
    }),

  // NOTE: Removed getRecentUsers and getSystemAlerts as they were not found in the backend documentation.
  // These might be derived from logs or require specific backend endpoints if needed.
};

export default auditService;

