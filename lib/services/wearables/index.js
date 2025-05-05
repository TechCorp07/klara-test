// lib/services/wearables/index.js
// Unified wearables service that provides access to all wearable platforms

import withingsService from './withingsService';
import appleHealthService from './appleHealthService';
import samsungHealthService from './samsungHealthService';
import fitbitService from './fitbitService';
import garminService from './garminService';
import { apiRequest } from '../../../api/client';

/**
 * Unified wearables service that provides access to all wearable platforms
 */
export const wearablesService = {
  // Platform-specific services
  withings: withingsService,
  appleHealth: appleHealthService,
  samsungHealth: samsungHealthService,
  fitbit: fitbitService,
  garmin: garminService,
  
  /**
   * Get all supported wearable platforms
   * @returns {Promise<Object>} List of supported platforms
   */
  getSupportedPlatforms: () => 
    apiRequest('GET', '/wearables/platforms', null, {
      errorMessage: 'Failed to fetch supported platforms'
    }),
  
  /**
   * Get wearable data for a user across all connected platforms
   * @param {string} userId - User ID
   * @param {string} dataType - Type of data to retrieve ('all', 'heart_rate', 'steps', etc.)
   * @param {string} startDate - Start date for data range (ISO format)
   * @param {string} endDate - End date for data range (ISO format)
   * @returns {Promise<Object>} Paginated wearable data
   */
  getWearableData: (userId, dataType = 'all', startDate = null, endDate = null) => 
    apiRequest('GET', '/wearables/data', null, {
      params: { 
        user_id: userId,
        data_type: dataType,
        start_date: startDate,
        end_date: endDate
      },
      errorMessage: 'Failed to fetch wearable data'
    }),
  
  /**
   * Get connected devices for a user across all platforms
   * @param {string} userId - User ID
   * @returns {Promise<Object>} List of connected devices
   */
  getConnectedDevices: (userId) => 
    apiRequest('GET', '/wearables/devices', null, {
      params: { user_id: userId },
      errorMessage: 'Failed to fetch connected devices'
    }),
  
  /**
   * Get device connection status for a specific platform
   * @param {string} userId - User ID
   * @param {string} platform - Platform name ('withings', 'apple_health', 'samsung_health', 'fitbit', 'garmin')
   * @returns {Promise<Object>} Connection status
   */
  getConnectionStatus: (userId, platform) => 
    apiRequest('GET', `/wearables/${platform}/status`, null, {
      params: { user_id: userId },
      errorMessage: `Failed to fetch ${platform} connection status`
    }),
  
  /**
   * Sync data from all connected platforms
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Sync response
   */
  syncAllData: (userId) => 
    apiRequest('POST', '/wearables/sync-all', { user_id: userId }, {
      errorMessage: 'Failed to sync wearable data',
      successMessage: 'Wearable data synced successfully'
    }),
  
  /**
   * Get aggregated health metrics across all platforms
   * @param {string} userId - User ID
   * @param {string} metric - Metric type ('steps', 'heart_rate', 'sleep', etc.)
   * @param {string} period - Time period ('day', 'week', 'month')
   * @returns {Promise<Object>} Aggregated metrics
   */
  getAggregatedMetrics: (userId, metric, period = 'week') => 
    apiRequest('GET', '/wearables/metrics/aggregate', null, {
      params: { 
        user_id: userId,
        metric: metric,
        period: period
      },
      errorMessage: 'Failed to fetch aggregated metrics'
    }),
  
  /**
   * Get platform-specific authorization URL
   * @param {string} userId - User ID
   * @param {string} platform - Platform name ('withings', 'apple_health', 'samsung_health', 'fitbit', 'garmin')
   * @returns {Promise<Object>} Authorization URL and state
   */
  getAuthUrl: (userId, platform) => {
    switch(platform) {
      case 'withings':
        return withingsService.getAuthUrl(userId);
      case 'apple_health':
        return appleHealthService.getAuthUrl(userId);
      case 'samsung_health':
        return samsungHealthService.getAuthUrl(userId);
      case 'fitbit':
        return fitbitService.getAuthUrl(userId);
      case 'garmin':
        return garminService.getAuthUrl(userId);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  },
  
  /**
   * Complete platform-specific authorization
   * @param {string} platform - Platform name ('withings', 'apple_health', 'samsung_health', 'fitbit', 'garmin')
   * @param {Object} authData - Authorization data (code, state)
   * @returns {Promise<Object>} Connection result
   */
  completeAuth: (platform, authData) => {
    switch(platform) {
      case 'withings':
        return withingsService.completeAuth(authData);
      case 'apple_health':
        return appleHealthService.completeAuth(authData);
      case 'samsung_health':
        return samsungHealthService.completeAuth(authData);
      case 'fitbit':
        return fitbitService.completeAuth(authData);
      case 'garmin':
        return garminService.completeAuth(authData);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  },
  
  /**
   * Disconnect a specific platform
   * @param {string} userId - User ID
   * @param {string} platform - Platform name ('withings', 'apple_health', 'samsung_health', 'fitbit', 'garmin')
   * @returns {Promise<Object>} Disconnection response
   */
  disconnect: (userId, platform) => {
    switch(platform) {
      case 'withings':
        return withingsService.disconnect(userId);
      case 'apple_health':
        return appleHealthService.disconnect(userId);
      case 'samsung_health':
        return samsungHealthService.disconnect(userId);
      case 'fitbit':
        return fitbitService.disconnect(userId);
      case 'garmin':
        return garminService.disconnect(userId);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  },
  
  /**
   * Get platform-specific data
   * @param {string} userId - User ID
   * @param {string} platform - Platform name ('withings', 'apple_health', 'samsung_health', 'fitbit', 'garmin')
   * @param {string} dataType - Type of data to retrieve
   * @param {string} startDate - Start date for data range (ISO format)
   * @param {string} endDate - End date for data range (ISO format)
   * @returns {Promise<Object>} Platform-specific data
   */
  getPlatformData: (userId, platform, dataType, startDate = null, endDate = null) => {
    switch(platform) {
      case 'withings':
        return withingsService.getData(userId, dataType, startDate, endDate);
      case 'apple_health':
        return appleHealthService.getData(userId, dataType, startDate, endDate);
      case 'samsung_health':
        return samsungHealthService.getData(userId, dataType, startDate, endDate);
      case 'fitbit':
        return fitbitService.getData(userId, dataType, startDate, endDate);
      case 'garmin':
        return garminService.getData(userId, dataType, startDate, endDate);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
};

export default wearablesService;
