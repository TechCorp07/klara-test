// lib/services/wearables/withingsService.js
// Service wrapper for Withings wearables API

import { apiRequest } from "../../../api/client"

/**
 * Withings service that provides access to Withings-specific API functions
 */
export const withingsService = {
  /**
   * Get Withings authorization URL
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Authorization URL and state
   */
  getAuthUrl: (userId) =>
    apiRequest("GET", "/wearables/withings/auth-url", null, {
      params: { user_id: userId },
      errorMessage: "Failed to get Withings authorization URL",
    }),

  /**
   * Complete Withings authorization
   * @param {Object} authData - Authorization data (code, state)
   * @returns {Promise<Object>} Connection result
   */
  completeAuth: (authData) =>
    apiRequest("POST", "/wearables/withings/complete-auth", authData, {
      errorMessage: "Failed to complete Withings authorization",
      successMessage: "Withings device connected successfully",
    }),

  /**
   * Get Withings data
   * @param {string} userId - User ID
   * @param {string} dataType - Type of data to retrieve ('weight', 'activity', 'sleep', etc.)
   * @param {string} startDate - Start date for data range (ISO format)
   * @param {string} endDate - End date for data range (ISO format)
   * @returns {Promise<Object>} Withings data
   */
  getData: (userId, dataType, startDate = null, endDate = null) =>
    apiRequest("GET", "/wearables/withings/data", null, {
      params: {
        user_id: userId,
        data_type: dataType,
        start_date: startDate,
        end_date: endDate,
      },
      errorMessage: "Failed to fetch Withings data",
    }),

  /**
   * Disconnect Withings device
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Disconnection response
   */
  disconnect: (userId) =>
    apiRequest(
      "POST",
      "/wearables/withings/disconnect",
      { user_id: userId },
      {
        errorMessage: "Failed to disconnect Withings device",
        successMessage: "Withings device disconnected successfully",
      },
    ),
}

export default withingsService
