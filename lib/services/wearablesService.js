// lib/services/wearablesService.js
// Main wearables service that re-exports the unified interface
// Updated based on API documentation analysis

import withingsService from "./wearables/withingsService";
import appleHealthService from "./wearables/appleHealthService";
// import samsungHealthService from './wearables/samsungHealthService'; // Assuming Samsung Health is similar or not yet implemented based on docs
import fitbitService from "./wearables/fitbitService";
import garminService from "./wearables/garminService";
import { apiRequest } from "../../api/client";

/**
 * Main wearables service providing a unified interface for device management and data access.
 */
const wearablesService = {
  /**
   * Get list of connected wearable devices for the current user.
   * Aligned with GET /wearables/devices
   * @param {Object} params - Query parameters (e.g., user_id if needed, though likely inferred from auth)
   * @returns {Promise<Object>} List of connected devices
   */
  getConnectedDevices: (params = {}) =>
    apiRequest("GET", "/wearables/devices", null, {
      params,
      errorMessage: "Failed to fetch connected devices",
    }),

  /**
   * Get details for a specific connected device.
   * Aligned with GET /wearables/devices/{device_id}
   * @param {string} deviceId - The ID of the device
   * @returns {Promise<Object>} Device details
   */
  getDeviceById: (deviceId) =>
    apiRequest("GET", `/wearables/devices/${deviceId}`, null, {
      errorMessage: "Failed to fetch device details",
    }),

  /**
   * Disconnect a specific wearable device.
   * Aligned with DELETE /wearables/devices/{device_id}
   * @param {string} deviceId - The ID of the device to disconnect
   * @returns {Promise<Object>} Disconnection result
   */
  disconnectDevice: (deviceId) =>
    apiRequest("DELETE", `/wearables/devices/${deviceId}`, null, {
      errorMessage: "Failed to disconnect device",
      successMessage: "Device disconnected successfully",
    }),

  /**
   * Get measurements from connected devices.
   * Aligned with GET /wearables/measurements
   * @param {Object} params - Query parameters (e.g., device_id, type, start_date, end_date)
   * @returns {Promise<Object>} Measurement data
   */
  getMeasurements: (params = {}) =>
    apiRequest("GET", "/wearables/measurements", null, {
      params,
      errorMessage: "Failed to fetch measurements",
    }),

  /**
   * Get list of supported wearable providers.
   * Aligned with GET /wearables/providers
   * @returns {Promise<Object>} List of supported providers
   */
  getSupportedProviders: () =>
    apiRequest("GET", "/wearables/providers", null, {
      errorMessage: "Failed to fetch supported providers",
    }),

  // --- Provider-Specific Services --- //
  withings: withingsService,
  appleHealth: appleHealthService,
  // samsungHealth: samsungHealthService, // Include if implemented
  fitbit: fitbitService,
  garmin: garminService,

  // --- Deprecated/Removed Functions (based on analysis) --- //
  // connectDevice: Not directly supported, use provider-specific completeAuth
  // authorize*: Use provider-specific getAuthUrl and completeAuth
};

// Re-export the updated wearables service
export { wearablesService };
export default wearablesService;

