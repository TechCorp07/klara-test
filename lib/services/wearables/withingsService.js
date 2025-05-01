// lib/services/wearables/withingsService.js
// Service wrapper for Withings wearables API
// Updated based on API documentation analysis

import { apiRequest } from "../../../api/client";

/**
 * Withings service that provides access to Withings-specific API functions
 */
export const withingsService = {
  /**
   * Get Withings authorization URL (Aligned with GET /wearables/providers/withings/auth-url)
   * @param {Object} params - Query parameters (e.g., redirect_uri)
   * @returns {Promise<Object>} Authorization URL and state
   */
  getAuthUrl: (params = {}) =>
    apiRequest("GET", "/wearables/providers/withings/auth-url", null, {
      params,
      errorMessage: "Failed to get Withings authorization URL",
    }),

  /**
   * Complete Withings authorization (Aligned with POST /wearables/providers/withings/complete-auth)
   * @param {Object} authData - Authorization data (code, state, redirect_uri)
   * @returns {Promise<Object>} Connection result
   */
  completeAuth: (authData) =>
    apiRequest("POST", "/wearables/providers/withings/complete-auth", authData, {
      errorMessage: "Failed to complete Withings authorization",
      successMessage: "Withings device connected successfully",
    }),

  /**
   * Disconnect Withings provider (Aligned with POST /wearables/providers/withings/disconnect)
   * @returns {Promise<Object>} Disconnection response
   */
  disconnect: () =>
    apiRequest("POST", "/wearables/providers/withings/disconnect", null, {
      errorMessage: "Failed to disconnect Withings provider",
      successMessage: "Withings provider disconnected successfully",
    }),

  /**
   * Trigger data sync for Withings (Aligned with POST /wearables/providers/withings/sync)
   * @returns {Promise<Object>} Sync initiation response
   */
  syncData: () =>
    apiRequest("POST", "/wearables/providers/withings/sync", null, {
      errorMessage: "Failed to trigger Withings data sync",
      successMessage: "Withings data sync initiated",
    }),

  // NOTE: The original `getData` function is removed.
  // Fetching data should now be done via the main wearables service:
  // 1. List devices using `wearablesService.getConnectedDevices()` to find the Withings device ID.
  // 2. Trigger sync using `withingsService.syncData()`.
  // 3. Fetch measurements using `wearablesService.getMeasurements(deviceId, params)`.
};

export default withingsService;

