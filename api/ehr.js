// api/ehr.js
import { apiRequest } from "./client"

/**
 * EHR Integration API service
 * Handles integration with major EHR systems
 */
const ehrAPI = {
  /**
   * Get available EHR systems for integration
   * @returns {Promise<Object>} List of available EHR systems
   */
  getAvailableSystems: () =>
    apiRequest("GET", "ehr/systems", null, {
      errorMessage: "Failed to fetch available EHR systems",
    }),

  /**
   * Get integration status for a specific EHR system
   * @param {string} systemId - EHR system ID
   * @returns {Promise<Object>} Integration status
   */
  getIntegrationStatus: (systemId) =>
    apiRequest("GET", `ehr/systems/${systemId}/status`, null, {
      errorMessage: "Failed to fetch integration status",
    }),

  /**
   * Configure integration with an EHR system
   * @param {string} systemId - EHR system ID
   * @param {Object} config - Integration configuration
   * @returns {Promise<Object>} Configuration result
   */
  configureIntegration: (systemId, config) =>
    apiRequest("POST", `ehr/systems/${systemId}/configure`, config, {
      errorMessage: "Failed to configure EHR integration",
      successMessage: "EHR integration configured successfully",
    }),

  /**
   * Test connection to an EHR system
   * @param {string} systemId - EHR system ID
   * @returns {Promise<Object>} Connection test result
   */
  testConnection: (systemId) =>
    apiRequest("POST", `ehr/systems/${systemId}/test`, null, {
      errorMessage: "Failed to test EHR connection",
    }),

  /**
   * Sync data with an EHR system
   * @param {string} systemId - EHR system ID
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} Sync result
   */
  syncData: (systemId, options = {}) =>
    apiRequest("POST", `ehr/systems/${systemId}/sync`, options, {
      errorMessage: "Failed to sync data with EHR system",
    }),

  /**
   * Get sync history for an EHR system
   * @param {string} systemId - EHR system ID
   * @returns {Promise<Object>} Sync history
   */
  getSyncHistory: (systemId) =>
    apiRequest("GET", `ehr/systems/${systemId}/sync-history`, null, {
      errorMessage: "Failed to fetch sync history",
    }),

  /**
   * Get available data mappings for an EHR system
   * @param {string} systemId - EHR system ID
   * @returns {Promise<Object>} Available data mappings
   */
  getDataMappings: (systemId) =>
    apiRequest("GET", `ehr/systems/${systemId}/mappings`, null, {
      errorMessage: "Failed to fetch data mappings",
    }),

  /**
   * Update data mappings for an EHR system
   * @param {string} systemId - EHR system ID
   * @param {Object} mappings - Data mappings
   * @returns {Promise<Object>} Update result
   */
  updateDataMappings: (systemId, mappings) =>
    apiRequest("PUT", `ehr/systems/${systemId}/mappings`, mappings, {
      errorMessage: "Failed to update data mappings",
      successMessage: "Data mappings updated successfully",
    }),
}

export default ehrAPI
