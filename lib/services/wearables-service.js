/**
 * Wearables service for device integration and health data
 */
import apiClient from "../api-client"
import { API_ENDPOINTS } from "../config"

const wearablesService = {
  /**
   * Get list of integrations
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated integrations
   */
  getIntegrations: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.WEARABLES.INTEGRATIONS, {
      params,
      errorMessage: "Failed to fetch wearable integrations",
    })
  },

  /**
   * Get a specific integration by ID
   * @param {string} integrationId - Integration ID
   * @returns {Promise<Object>} - Integration details
   */
  getIntegrationById: (integrationId) => {
    return apiClient.get(API_ENDPOINTS.WEARABLES.INTEGRATION(integrationId), {
      errorMessage: "Failed to fetch integration details",
    })
  },

  /**
   * Create a new integration
   * @param {Object} data - Integration data
   * @returns {Promise<Object>} - Created integration
   */
  createIntegration: (data) => {
    return apiClient.post(API_ENDPOINTS.WEARABLES.INTEGRATIONS, data, {
      errorMessage: "Failed to create integration",
      successMessage: "Device integration created successfully",
    })
  },

  /**
   * Update an integration
   * @param {string} integrationId - Integration ID
   * @param {Object} data - Updated integration data
   * @returns {Promise<Object>} - Updated integration
   */
  updateIntegration: (integrationId, data) => {
    return apiClient.put(API_ENDPOINTS.WEARABLES.INTEGRATION(integrationId), data, {
      errorMessage: "Failed to update integration",
      successMessage: "Integration updated successfully",
    })
  },

  /**
   * Delete an integration
   * @param {string} integrationId - Integration ID
   * @returns {Promise<Object>} - Deletion result
   */
  deleteIntegration: (integrationId) => {
    return apiClient.delete(API_ENDPOINTS.WEARABLES.INTEGRATION(integrationId), {
      errorMessage: "Failed to delete integration",
      successMessage: "Integration deleted successfully",
    })
  },

  /**
   * Get wearable measurements
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated measurements
   */
  getMeasurements: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.WEARABLES.MEASUREMENTS, {
      params,
      errorMessage: "Failed to fetch wearable measurements",
    })
  },

  /**
   * Get connection endpoints for wearable devices
   * @returns {Promise<Object>} - Connection endpoints
   */
  getConnectionEndpoints: () => {
    return apiClient.get(API_ENDPOINTS.WEARABLES.CONNECT, {
      errorMessage: "Failed to fetch connection endpoints",
    })
  },

  /**
   * Process OAuth callback
   * @param {Object} data - Callback data
   * @returns {Promise<Object>} - Integration result
   */
  processCallback: (data) => {
    return apiClient.post(API_ENDPOINTS.WEARABLES.CALLBACK, data, {
      errorMessage: "Failed to process device connection",
      successMessage: "Device connected successfully",
    })
  },

  /**
   * Sync data from a device
   * @param {Object} data - Sync data
   * @returns {Promise<Object>} - Sync result
   */
  syncDevice: (data) => {
    return apiClient.post(API_ENDPOINTS.WEARABLES.SYNC, data, {
      errorMessage: "Failed to sync device data",
      successMessage: "Device sync initiated successfully",
    })
  },

  /**
   * Sync Apple Health data
   * @param {Object} data - Health data
   * @returns {Promise<Object>} - Sync result
   */
  syncAppleHealthData: (data) => {
    return apiClient.post(API_ENDPOINTS.WEARABLES.MOBILE.APPLE_HEALTH_SYNC, data, {
      errorMessage: "Failed to sync Apple Health data",
      successMessage: "Apple Health data synced successfully",
    })
  },

  /**
   * Sync Samsung Health data
   * @param {Object} data - Health data
   * @returns {Promise<Object>} - Sync result
   */
  syncSamsungHealthData: (data) => {
    return apiClient.post(API_ENDPOINTS.WEARABLES.MOBILE.SAMSUNG_HEALTH_SYNC, data, {
      errorMessage: "Failed to sync Samsung Health data",
      successMessage: "Samsung Health data synced successfully",
    })
  },

  /**
   * Get available wearable devices
   * @returns {Promise<Object>} - Available devices
   */
  getAvailableDevices: () => {
    return apiClient.get(API_ENDPOINTS.WEARABLES.AVAILABLE_DEVICES, {
      errorMessage: "Failed to fetch available devices",
    })
  },

  /**
   * Get user's connected devices
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User's connected devices
   */
  getUserDevices: (userId) => {
    return apiClient.get(API_ENDPOINTS.WEARABLES.USER_DEVICES(userId), {
      errorMessage: "Failed to fetch user devices",
    })
  },

  /**
   * Connect a device
   * @param {Object} data - Device data
   * @returns {Promise<Object>} - Connection result
   */
  connectDevice: (data) => {
    return apiClient.post(API_ENDPOINTS.WEARABLES.CONNECT_DEVICE, data, {
      errorMessage: "Failed to connect device",
      successMessage: "Device connected successfully",
    })
  },

  /**
   * Disconnect a device
   * @param {string} deviceId - Device ID
   * @returns {Promise<Object>} - Disconnection result
   */
  disconnectDevice: (deviceId) => {
    return apiClient.post(API_ENDPOINTS.WEARABLES.DISCONNECT_DEVICE(deviceId), null, {
      errorMessage: "Failed to disconnect device",
      successMessage: "Device disconnected successfully",
    })
  },

  /**
   * Get health data for a user
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Health data
   */
  getHealthData: (userId, params = {}) => {
    return apiClient.get(API_ENDPOINTS.WEARABLES.HEALTH_DATA(userId), {
      params,
      errorMessage: "Failed to fetch health data",
    })
  },

  /**
   * Analyze health data
   * @param {Object} data - Health data to analyze
   * @returns {Promise<Object>} - Analysis results
   */
  analyzeHealthData: (data) => {
    return apiClient.post(API_ENDPOINTS.WEARABLES.ANALYZE_HEALTH_DATA, data, {
      errorMessage: "Failed to analyze health data",
    })
  },
}

export default wearablesService
