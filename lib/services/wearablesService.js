"use client"

import { apiRequest } from "../../api/client"
import { withingsService } from "./wearables/withingsService"
import { appleHealthService } from "./wearables/appleHealthService"
import { fitbitService } from "./wearables/fitbitService"
import { garminService } from "./wearables/garminService"
import { samsungHealthService } from "./wearables/samsungHealthService"

/**
 * Service for managing wearable devices and health data
 */
class WearablesService {
  /**
   * Get all wearable devices for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - List of wearable devices
   */
  async getWearableDevices(userId) {
    return apiRequest("GET", `/wearables/devices?userId=${userId}`, null, {
      errorMessage: "Failed to fetch wearable devices",
    })
  }

  /**
   * Get wearable data for a specific data type
   * @param {string} userId - User ID
   * @param {string} dataType - Type of data (e.g., 'heart_rate', 'steps', 'sleep')
   * @param {string} startDate - Start date in ISO format
   * @param {string} endDate - End date in ISO format
   * @returns {Promise<Object>} - Wearable data
   */
  async getWearableData(userId, dataType, startDate, endDate) {
    return apiRequest(
      "GET",
      `/wearables/data?userId=${userId}&dataType=${dataType}&startDate=${startDate}&endDate=${endDate}`,
      null,
      {
        errorMessage: "Failed to fetch wearable data",
      },
    )
  }

  /**
   * Connect to Withings API
   * @returns {Promise<Object>} - Authorization URL
   */
  async connectWithings() {
    return apiRequest("POST", "/wearables/withings/connect", null, {
      errorMessage: "Failed to connect to Withings",
    })
  }

  /**
   * Get Withings profile information
   * @returns {Promise<Object>} - Withings profile
   */
  async getWithingsProfile() {
    return apiRequest("GET", "/wearables/withings/profile", null, {
      errorMessage: "Failed to fetch Withings profile",
    })
  }

  /**
   * Fetch data from Withings
   * @param {string} startDate - Start date in ISO format
   * @param {string} endDate - End date in ISO format
   * @returns {Promise<Object>} - Sync status
   */
  async fetchWithingsData(startDate, endDate) {
    return apiRequest(
      "POST",
      "/wearables/withings/sync",
      { startDate, endDate },
      {
        errorMessage: "Failed to sync Withings data",
      },
    )
  }

  /**
   * Disconnect from Withings
   * @returns {Promise<Object>} - Disconnect status
   */
  async disconnectWithings() {
    return apiRequest("POST", "/wearables/withings/disconnect", null, {
      errorMessage: "Failed to disconnect from Withings",
    })
  }

  /**
   * Get health metrics summary
   * @param {string} userId - User ID
   * @param {string} startDate - Start date in ISO format
   * @param {string} endDate - End date in ISO format
   * @returns {Promise<Object>} - Health metrics summary
   */
  async getHealthMetricsSummary(userId, startDate, endDate) {
    return apiRequest(
      "GET",
      `/wearables/metrics/summary?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
      null,
      {
        errorMessage: "Failed to fetch health metrics summary",
      },
    )
  }

  /**
   * Get available device integrations
   * @returns {Promise<Array>} - List of available integrations
   */
  async getAvailableIntegrations() {
    return apiRequest("GET", "/wearables/integrations", null, {
      errorMessage: "Failed to fetch available integrations",
    })
  }
}

// Create instance of the service
const wearablesServiceInstance = new WearablesService()

// Export the service with specific device integrations
export const wearablesService = {
  ...wearablesServiceInstance,
  withings: withingsService,
  appleHealth: appleHealthService,
  fitbit: fitbitService,
  garmin: garminService,
  samsungHealth: samsungHealthService,
}

// Export as 'wearables' for compatibility with existing code
export const wearables = wearablesServiceInstance
