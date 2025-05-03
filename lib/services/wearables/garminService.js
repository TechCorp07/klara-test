// lib/services/wearables/garminService.js
// Service wrapper for Garmin wearables API
// Updated based on API documentation analysis

import { apiRequest } from "../../../api/client"

/**
 * Garmin service that provides access to Garmin-specific API functions
 */
export const garminService = {
  /**
   * Get Garmin authorization URL (Aligned with GET /wearables/providers/garmin/auth-url)
   * @param {Object} params - Query parameters (e.g., redirect_uri)
   * @returns {Promise<Object>} Authorization URL and state
   */
  getAuthUrl: (params = {}) =>
    apiRequest("GET", "/wearables/providers/garmin/auth-url", null, {
      params,
      errorMessage: "Failed to get Garmin authorization URL",
    }),

  /**
   * Complete Garmin authorization (Aligned with POST /wearables/providers/garmin/complete-auth)
   * @param {Object} authData - Authorization data (code, state, redirect_uri)
   * @returns {Promise<Object>} Connection result
   */
  completeAuth: (authData) =>
    apiRequest("POST", "/wearables/providers/garmin/complete-auth", authData, {
      errorMessage: "Failed to complete Garmin authorization",
      successMessage: "Garmin device connected successfully",
    }),

  /**
   * Disconnect Garmin provider (Aligned with POST /wearables/providers/garmin/disconnect)
   * @returns {Promise<Object>} Disconnection response
   */
  disconnect: () =>
    apiRequest("POST", "/wearables/providers/garmin/disconnect", null, {
      errorMessage: "Failed to disconnect Garmin provider",
      successMessage: "Garmin provider disconnected successfully",
    }),

  /**
   * Trigger data sync for Garmin (Aligned with POST /wearables/providers/garmin/sync)
   * @returns {Promise<Object>} Sync initiation response
   */
  syncData: () =>
    apiRequest("POST", "/wearables/providers/garmin/sync", null, {
      errorMessage: "Failed to trigger Garmin data sync",
      successMessage: "Garmin data sync initiated",
    }),

  // NOTE: The original `getData` function is removed.
  // Fetching data should now be done via the main wearables service:
  // 1. List devices using `wearablesService.getConnectedDevices()` to find the Garmin device ID.
  // 2. Trigger sync using `garminService.syncData()`.
  // 3. Fetch measurements using `wearablesService.getMeasurements(deviceId, params)`.
}

export default garminService
