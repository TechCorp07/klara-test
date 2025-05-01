// lib/services/wearables/appleHealthService.js
// Service wrapper for Apple Health wearables API
// Updated based on API documentation analysis

import { apiRequest } from '../../../api/client';

/**
 * Apple Health service that provides access to Apple Health-specific API functions
 */
export const appleHealthService = {
  /**
   * Get Apple Health authorization URL (Aligned with GET /wearables/providers/apple-health/auth-url)
   * @param {Object} params - Query parameters (e.g., redirect_uri)
   * @returns {Promise<Object>} Authorization URL and state
   */
  getAuthUrl: (params = {}) => 
    apiRequest('GET', '/wearables/providers/apple-health/auth-url', null, {
      params,
      errorMessage: 'Failed to get Apple Health authorization URL'
    }),
  
  /**
   * Complete Apple Health authorization (Aligned with POST /wearables/providers/apple-health/complete-auth)
   * @param {Object} authData - Authorization data (code, state, redirect_uri)
   * @returns {Promise<Object>} Connection result
   */
  completeAuth: (authData) => 
    apiRequest('POST', '/wearables/providers/apple-health/complete-auth', authData, {
      errorMessage: 'Failed to complete Apple Health authorization',
      successMessage: 'Apple Health connected successfully'
    }),
  
  /**
   * Disconnect Apple Health (Aligned with POST /wearables/providers/apple-health/disconnect)
   * @returns {Promise<Object>} Disconnection response
   */
  disconnect: () => 
    apiRequest('POST', '/wearables/providers/apple-health/disconnect', null, {
      errorMessage: 'Failed to disconnect Apple Health',
      successMessage: 'Apple Health disconnected successfully'
    }),
    
  /**
   * Sync Apple Health data (Aligned with POST /wearables/providers/apple-health/sync)
   * @returns {Promise<Object>} Sync response
   */
  syncData: () => 
    apiRequest('POST', '/wearables/providers/apple-health/sync', null, {
      errorMessage: 'Failed to sync Apple Health data',
      successMessage: 'Apple Health data synced successfully'
    }),

  // NOTE: The original `getData` function is removed.
  // Fetching data should now be done via the main wearables service:
  // 1. List devices using `wearablesService.getConnectedDevices()` to find the Apple Health device ID.
  // 2. Trigger sync using `appleHealthService.syncData()`.
  // 3. Fetch measurements using `wearablesService.getMeasurements(deviceId, params)`.
};

export default appleHealthService;
