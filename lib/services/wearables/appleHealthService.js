// lib/services/wearables/appleHealthService.js
// Service wrapper for Apple Health wearables API

import { apiRequest } from "../../../api/client"

/**
 * Apple Health service that provides access to Apple Health-specific API functions
 */
export const appleHealthService = {
  /**
   * Get Apple Health authorization URL
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Authorization URL and state
   */
  getAuthUrl: (userId) =>
    apiRequest("GET", "/wearables/apple-health/auth-url", null, {
      params: { user_id: userId },
      errorMessage: "Failed to get Apple Health authorization URL",
    }),

  /**
   * Complete Apple Health authorization
   * @param {Object} authData - Authorization data (code, state)
   * @returns {Promise<Object>} Connection result
   */
  completeAuth: (authData) =>
    apiRequest("POST", "/wearables/apple-health/complete-auth", authData, {
      errorMessage: "Failed to complete Apple Health authorization",
      successMessage: "Apple Health connected successfully",
    }),

  /**
   * Get Apple Health data
   * @param {string} userId - User ID
   * @param {string} dataType - Type of data to retrieve ('activity', 'heart_rate', 'sleep', etc.)
   * @param {string} startDate - Start date for data range (ISO format)
   * @param {string} endDate - End date for data range (ISO format)
   * @returns {Promise<Object>} Apple Health data
   */
  getData: (userId, dataType, startDate = null, endDate = null) =>
    apiRequest("GET", "/wearables/apple-health/data", null, {
      params: {
        user_id: userId,
        data_type: dataType,
        start_date: startDate,
        end_date: endDate,
      },
      errorMessage: "Failed to fetch Apple Health data",
    }),

  /**
   * Disconnect Apple Health
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Disconnection response
   */
  disconnect: (userId) =>
    apiRequest(
      "POST",
      "/wearables/apple-health/disconnect",
      { user_id: userId },
      {
        errorMessage: "Failed to disconnect Apple Health",
        successMessage: "Apple Health disconnected successfully",
      },
    ),

  /**
   * Sync Apple Health data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Sync response
   */
  syncData: (userId) =>
    apiRequest(
      "POST",
      "/wearables/apple-health/sync",
      { user_id: userId },
      {
        errorMessage: "Failed to sync Apple Health data",
        successMessage: "Apple Health data synced successfully",
      },
    ),
}

export default appleHealthService
