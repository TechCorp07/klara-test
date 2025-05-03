// lib/services/wearables/fitbitService.js
// Service wrapper for Fitbit wearables API
// Updated based on API documentation analysis

import { apiRequest } from "../../../api/client"

/**
 * Fitbit service that provides access to Fitbit-specific API functions
 */
export const fitbitService = {
  /**
   * Get Fitbit authorization URL (Aligned with GET /wearables/providers/fitbit/auth-url)
   * @param {Object} params - Query parameters (e.g., redirect_uri)
   * @returns {Promise<Object>} Authorization URL and state
   */
  getAuthUrl: (params = {}) =>
    apiRequest("GET", "/wearables/providers/fitbit/auth-url", null, {
      params,
      errorMessage: "Failed to get Fitbit authorization URL",
    }),

  /**
   * Complete Fitbit authorization (Aligned with POST /wearables/providers/fitbit/complete-auth)
   * @param {Object} authData - Authorization data (code, state, redirect_uri)
   * @returns {Promise<Object>} Connection result
   */
  completeAuth: (authData) =>
    apiRequest("POST", "/wearables/providers/fitbit/complete-auth", authData, {
      errorMessage: "Failed to complete Fitbit authorization",
      successMessage: "Fitbit device connected successfully",
    }),

  /**
   * Disconnect Fitbit provider (Aligned with POST /wearables/providers/fitbit/disconnect)
   * @returns {Promise<Object>} Disconnection response
   */
  disconnect: () =>
    apiRequest("POST", "/wearables/providers/fitbit/disconnect", null, {
      errorMessage: "Failed to disconnect Fitbit provider",
      successMessage: "Fitbit provider disconnected successfully",
    }),

  /**
   * Trigger data sync for Fitbit (Aligned with POST /wearables/providers/fitbit/sync)
   * @returns {Promise<Object>} Sync initiation response
   */
  syncData: () =>
    apiRequest("POST", "/wearables/providers/fitbit/sync", null, {
      errorMessage: "Failed to trigger Fitbit data sync",
      successMessage: "Fitbit data sync initiated",
    }),

  // NOTE: The original `getData` function is removed.
  // Fetching data should now be done via the main wearables service:
  // 1. List devices using `wearablesService.getConnectedDevices()` to find the Fitbit device ID.
  // 2. Trigger sync using `fitbitService.syncData()`.
  // 3. Fetch measurements using `wearablesService.getMeasurements(deviceId, params)`.
}

export default fitbitService
