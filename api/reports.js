// api/reports.js - Updated to align with backend API
import { apiRequest } from "./client"

/**
 * Reports API service
 * Handles reporting and analytics features
 */
const reportsAPI = {
  /**
   * Get available report types
   * @returns {Promise<Object>} List of report types
   */
  getReportTypes: () =>
    apiRequest("GET", "reports", null, {
      params: { type: "all" },
      errorMessage: "Failed to fetch report types",
    }),

  /**
   * Generate a report
   * @param {string} reportType - Report type
   * @param {Object} parameters - Report parameters
   * @returns {Promise<Object>} Generated report or job ID
   */
  generateReport: (reportType, parameters = {}) =>
    apiRequest(
      "POST",
      `reports/generate`,
      { ...parameters, reportType },
      {
        errorMessage: "Failed to generate report",
        successMessage: "Report generation initiated",
      },
    ),

  /**
   * Get report status
   * @param {string} reportId - Report ID
   * @returns {Promise<Object>} Report status
   */
  getReportStatus: (reportId) =>
    apiRequest("GET", `reports/${reportId}`.replace(/\${reportId}/g, reportId), null, {
      params: { includeStatus: true },
      errorMessage: "Failed to fetch report status",
    }),

  /**
   * Get report result
   * @param {string} reportId - Report ID
   * @returns {Promise<Object>} Report result
   */
  getReportResult: (reportId) =>
    apiRequest("GET", `reports/${reportId}`.replace(/\${reportId}/g, reportId), null, {
      errorMessage: "Failed to fetch report result",
    }),

  /**
   * Get user reports
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of user reports
   */
  getUserReports: (params = {}) =>
    apiRequest("GET", "reports", null, {
      params: { ...params, scope: "user" },
      errorMessage: "Failed to fetch user reports",
    }),

  /**
   * Get dashboard data
   * @param {string} dashboardId - Dashboard ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Dashboard data
   */
  getDashboardData: (dashboardId, params = {}) =>
    apiRequest("GET", `reports/dashboards/${dashboardId}`.replace(/\${dashboardId}/g, dashboardId), null, {
      params,
      errorMessage: "Failed to fetch dashboard data",
    }),

  /**
   * Get available dashboards
   * @returns {Promise<Object>} List of dashboards
   */
  getDashboards: () =>
    apiRequest("GET", "reports/dashboards", null, {
      errorMessage: "Failed to fetch dashboards",
    }),

  /**
   * Export report to format
   * @param {string} reportId - Report ID
   * @param {string} format - Export format (pdf, csv, excel)
   * @returns {Promise<Object>} Export result with download URL
   */
  exportReport: (reportId, format) =>
    apiRequest("GET", `reports/${reportId}`.replace(/\${reportId}/g, reportId), null, {
      params: { format },
      errorMessage: `Failed to export report to ${format}`,
    }),

  /**
   * Schedule a recurring report
   * @param {string} reportType - Report type
   * @param {Object} schedule - Schedule parameters
   * @returns {Promise<Object>} Scheduled report
   */
  scheduleReport: (reportType, schedule) =>
    apiRequest(
      "POST",
      `reports/generate`,
      { ...schedule, reportType, scheduled: true },
      {
        errorMessage: "Failed to schedule report",
        successMessage: "Report scheduled successfully",
      },
    ),

  /**
   * Get scheduled reports
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of scheduled reports
   */
  getScheduledReports: (params = {}) =>
    apiRequest("GET", "reports", null, {
      params: { ...params, scheduled: true },
      errorMessage: "Failed to fetch scheduled reports",
    }),

  /**
   * Cancel scheduled report
   * @param {string} scheduleId - Schedule ID
   * @returns {Promise<Object>} Cancellation response
   */
  cancelScheduledReport: (scheduleId) =>
    apiRequest("DELETE", `reports/${scheduleId}`.replace(/\${scheduleId}/g, scheduleId), null, {
      errorMessage: "Failed to cancel scheduled report",
      successMessage: "Scheduled report cancelled",
    }),

  /**
   * Get analytics data
   * @param {string} metric - Metric name
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Analytics data
   */
  getAnalyticsData: (metric, params = {}) =>
    apiRequest("GET", `reports`, null, {
      params: { ...params, metric, type: "analytics" },
      errorMessage: "Failed to fetch analytics data",
    }),

  /**
   * Get predictive analytics
   * @param {string} model - Predictive model
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Predictive analytics data
   */
  getPredictiveAnalytics: (model, params = {}) =>
    apiRequest("GET", `ai/predictions/${model}`.replace(/\${model}/g, model), null, {
      params,
      errorMessage: "Failed to fetch predictive analytics",
    }),
}

export default reportsAPI
