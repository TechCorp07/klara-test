/**
 * Wearables API Module
 * Handles all wearable device connections and health data synchronization
 */

import { apiClient } from './client';

/**
 * Get available wearable devices that can be connected
 * @returns {Promise} Promise object representing the available devices
 */
export const getAvailableDevices = async () => {
  try {
    const response = await apiClient.get('/api/wearables/available-devices');
    return response.data;
  } catch (error) {
    console.error('Error fetching available devices:', error);
    throw error;
  }
};

/**
 * Get connected wearable devices for a user
 * @param {string} userId - The user ID
 * @returns {Promise} Promise object representing the connected devices
 */
export const getConnectedDevices = async (userId) => {
  try {
    const response = await apiClient.get(`/api/wearables/user/${userId}/devices`);
    return response.data;
  } catch (error) {
    console.error('Error fetching connected devices:', error);
    throw error;
  }
};

/**
 * Connect a new wearable device
 * @param {Object} deviceData - The device connection data
 * @param {string} deviceData.userId - The user ID
 * @param {string} deviceData.deviceType - The type of device to connect
 * @param {string} deviceData.connectionMethod - The connection method (oauth or direct)
 * @returns {Promise} Promise object representing the connection result
 */
export const connectDevice = async (deviceData) => {
  try {
    const response = await apiClient.post('/api/wearables/connect-device', deviceData);
    return response.data;
  } catch (error) {
    console.error('Error connecting device:', error);
    throw error;
  }
};

/**
 * Disconnect a wearable device
 * @param {string} deviceId - The device ID to disconnect
 * @returns {Promise} Promise object representing the disconnection result
 */
export const disconnectDevice = async (deviceId) => {
  try {
    const response = await apiClient.post(`/api/wearables/devices/${deviceId}/disconnect`);
    return response.data;
  } catch (error) {
    console.error('Error disconnecting device:', error);
    throw error;
  }
};

/**
 * Sync data from a wearable device
 * @param {string} deviceId - The device ID to sync data from
 * @returns {Promise} Promise object representing the sync result
 */
export const syncDeviceData = async (deviceId) => {
  try {
    const response = await apiClient.post(`/api/wearables/devices/${deviceId}/sync`);
    return response.data;
  } catch (error) {
    console.error('Error syncing device data:', error);
    throw error;
  }
};

/**
 * Get health data for a user
 * @param {string} userId - The user ID
 * @param {string} range - The date range (day, week, month)
 * @returns {Promise} Promise object representing the health data
 */
export const getHealthData = async (userId, range = 'week') => {
  try {
    const response = await apiClient.get(`/api/wearables/user/${userId}/health-data?range=${range}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching health data:', error);
    throw error;
  }
};

/**
 * Analyze health data against medication plan
 * @param {Object} analysisData - The analysis data
 * @param {string} analysisData.userId - The user ID
 * @param {Array} analysisData.healthData - The health data to analyze
 * @param {Object} analysisData.medicationPlan - The medication plan to analyze against
 * @returns {Promise} Promise object representing the analysis result
 */
export const analyzeHealthData = async (analysisData) => {
  try {
    const response = await apiClient.post('/api/wearables/analyze-health-data', analysisData);
    return response.data;
  } catch (error) {
    console.error('Error analyzing health data:', error);
    throw error;
  }
};

/**
 * Get device sync history
 * @param {string} deviceId - The device ID
 * @param {number} limit - The maximum number of history items to return
 * @returns {Promise} Promise object representing the sync history
 */
export const getDeviceSyncHistory = async (deviceId, limit = 10) => {
  try {
    const response = await apiClient.get(`/api/wearables/devices/${deviceId}/sync-history?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching device sync history:', error);
    throw error;
  }
};

/**
 * Update device settings
 * @param {string} deviceId - The device ID
 * @param {Object} settings - The settings to update
 * @returns {Promise} Promise object representing the update result
 */
export const updateDeviceSettings = async (deviceId, settings) => {
  try {
    const response = await apiClient.put(`/api/wearables/devices/${deviceId}/settings`, settings);
    return response.data;
  } catch (error) {
    console.error('Error updating device settings:', error);
    throw error;
  }
};

/**
 * Get health metrics for a specific type
 * @param {string} userId - The user ID
 * @param {string} metricType - The metric type (heartRate, steps, sleep, etc.)
 * @param {string} range - The date range (day, week, month)
 * @returns {Promise} Promise object representing the health metrics
 */
export const getHealthMetrics = async (userId, metricType, range = 'week') => {
  try {
    const response = await apiClient.get(`/api/wearables/user/${userId}/metrics/${metricType}?range=${range}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${metricType} metrics:`, error);
    throw error;
  }
};
