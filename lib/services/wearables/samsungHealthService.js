// lib/services/wearables/samsungHealthService.js
// Service wrapper for Samsung Health wearables API

import { apiRequest } from '../../../api/client';

/**
 * Samsung Health service that provides access to Samsung Health-specific API functions
 */
export const samsungHealthService = {
  /**
   * Get Samsung Health authorization URL
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Authorization URL and state
   */
  getAuthUrl: (userId) => 
    apiRequest('GET', '/wearables/samsung-health/auth-url', null, {
      params: { user_id: userId },
      errorMessage: 'Failed to get Samsung Health authorization URL'
    }),
  
  /**
   * Complete Samsung Health authorization
   * @param {Object} authData - Authorization data (code, state)
   * @returns {Promise<Object>} Connection result
   */
  completeAuth: (authData) => 
    apiRequest('POST', '/wearables/samsung-health/complete-auth', authData, {
      errorMessage: 'Failed to complete Samsung Health authorization',
      successMessage: 'Samsung Health connected successfully'
    }),
  
  /**
   * Get Samsung Health data
   * @param {string} userId - User ID
   * @param {string} dataType - Type of data to retrieve ('activity', 'heart_rate', 'sleep', etc.)
   * @param {string} startDate - Start date for data range (ISO format)
   * @param {string} endDate - End date for data range (ISO format)
   * @returns {Promise<Object>} Samsung Health data
   */
  getData: (userId, dataType, startDate = null, endDate = null) => 
    apiRequest('GET', '/wearables/samsung-health/data', null, {
      params: { 
        user_id: userId,
        data_type: dataType,
        start_date: startDate,
        end_date: endDate
      },
      errorMessage: 'Failed to fetch Samsung Health data'
    }),
  
  /**
   * Disconnect Samsung Health
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Disconnection response
   */
  disconnect: (userId) => 
    apiRequest('POST', '/wearables/samsung-health/disconnect', { user_id: userId }, {
      errorMessage: 'Failed to disconnect Samsung Health',
      successMessage: 'Samsung Health disconnected successfully'
    }),
    
  /**
   * Sync Samsung Health data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Sync response
   */
  syncData: (userId) => 
    apiRequest('POST', '/wearables/samsung-health/sync', { user_id: userId }, {
      errorMessage: 'Failed to sync Samsung Health data',
      successMessage: 'Samsung Health data synced successfully'
    }),
};

export default samsungHealthService;
