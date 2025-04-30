// lib/services/wearables/fitbitService.js
// Service wrapper for Fitbit wearables API

import { apiRequest } from "../../../api/client"

/**
 * Fitbit service that provides access to Fitbit-specific API functions
 */
export const fitbitService = {
  /**
   * Get Fitbit authorization URL
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Authorization URL and state
   */
  getAuthUrl: (userId) =>
    apiRequest("GET", "/wearables/fitbit/auth-url", null, {
      params: { user_id: userId },
      errorMessage: "Failed to get Fitbit authorization URL",
    }),

  /**
   * Complete Fitbit authorization
   * @param {Object} authData - Authorization data (code, state)
   * @returns {Promise<Object>} Connection result
   */
  completeAuth: (authData) =>
    apiRequest("POST", "/wearables/fitbit/complete-auth", authData, {
      errorMessage: "Failed to complete Fitbit authorization",
      successMessage: "Fitbit device connected successfully",
    }),

  /**
   * Get Fitbit data
   * @param {string} userId - User ID
   * @param {string} dataType - Type of data to retrieve ('activity', 'heart_rate', 'sleep', etc.)
   * @param {string} startDate - Start date for data range (ISO format)
   * @param {string} endDate - End date for data range (ISO format)
   * @returns {Promise<Object>} Fitbit data
   */
  getData: (userId, dataType, startDate = null, endDate = null) =>
    apiRequest("GET", "/wearables/fitbit/data", null, {
      params: {
        user_id: userId,
        data_type: dataType,
        start_date: startDate,
        end_date: endDate,
      },
      errorMessage: "Failed to fetch Fitbit data",
    }),

  /**
   * Disconnect Fitbit device
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Disconnection response
   */
  disconnect: (userId) =>
    apiRequest(
      "POST",
      "/wearables/fitbit/disconnect",
      { user_id: userId },
      {
        errorMessage: "Failed to disconnect Fitbit device",
        successMessage: "Fitbit device disconnected successfully",
      },
    ),

  /**
   * Sync Fitbit data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Sync response
   */
  syncData: (userId) =>
    apiRequest(
      "POST",
      "/wearables/fitbit/sync",
      { user_id: userId },
      {
        errorMessage: "Failed to sync Fitbit data",
        successMessage: "Fitbit data synced successfully",
      },
    ),
}

export default fitbitService
