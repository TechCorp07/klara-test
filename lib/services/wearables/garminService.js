// lib/services/wearables/garminService.js
// Service wrapper for Garmin wearables API

import { apiRequest } from "../../../api/client"

/**
 * Garmin service that provides access to Garmin-specific API functions
 */
export const garminService = {
  /**
   * Get Garmin authorization URL
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Authorization URL and state
   */
  getAuthUrl: (userId) =>
    apiRequest("GET", "/wearables/garmin/auth-url", null, {
      params: { user_id: userId },
      errorMessage: "Failed to get Garmin authorization URL",
    }),

  /**
   * Complete Garmin authorization
   * @param {Object} authData - Authorization data (code, state)
   * @returns {Promise<Object>} Connection result
   */
  completeAuth: (authData) =>
    apiRequest("POST", "/wearables/garmin/complete-auth", authData, {
      errorMessage: "Failed to complete Garmin authorization",
      successMessage: "Garmin device connected successfully",
    }),

  /**
   * Get Garmin data
   * @param {string} userId - User ID
   * @param {string} dataType - Type of data to retrieve ('activity', 'heart_rate', 'sleep', etc.)
   * @param {string} startDate - Start date for data range (ISO format)
   * @param {string} endDate - End date for data range (ISO format)
   * @returns {Promise<Object>} Garmin data
   */
  getData: (userId, dataType, startDate = null, endDate = null) =>
    apiRequest("GET", "/wearables/garmin/data", null, {
      params: {
        user_id: userId,
        data_type: dataType,
        start_date: startDate,
        end_date: endDate,
      },
      errorMessage: "Failed to fetch Garmin data",
    }),

  /**
   * Disconnect Garmin device
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Disconnection response
   */
  disconnect: (userId) =>
    apiRequest(
      "POST",
      "/wearables/garmin/disconnect",
      { user_id: userId },
      {
        errorMessage: "Failed to disconnect Garmin device",
        successMessage: "Garmin device disconnected successfully",
      },
    ),

  /**
   * Sync Garmin data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Sync response
   */
  syncData: (userId) =>
    apiRequest(
      "POST",
      "/wearables/garmin/sync",
      { user_id: userId },
      {
        errorMessage: "Failed to sync Garmin data",
        successMessage: "Garmin data synced successfully",
      },
    ),
}

export default garminService
