import { BASE_URLS, API_ENDPOINTS } from "@/lib/config"
import { formatDate } from "@/lib/utils/dateUtils"

/**
 * Service for interacting with wearable devices
 */
class WearablesService {
  /**
   * Get available wearable devices
   * @returns {Promise<Array>} List of available devices
   */
  async getAvailableDevices() {
    try {
      const response = await fetch(`${BASE_URLS.API}${API_ENDPOINTS.WEARABLES.AVAILABLE_DEVICES}`, {
        credentials: "include",
      })
      return await response.json()
    } catch (error) {
      console.error("Error getting available devices:", error)
      throw error
    }
  }

  /**
   * Get user's connected devices
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} List of user's connected devices
   */
  async getUserDevices(userId) {
    try {
      const response = await fetch(`${BASE_URLS.API}${API_ENDPOINTS.WEARABLES.USER_DEVICES(userId)}`, {
        credentials: "include",
      })
      return await response.json()
    } catch (error) {
      console.error("Error getting user devices:", error)
      throw error
    }
  }

  /**
   * Connect a new device
   * @param {Object} deviceData - The device data
   * @returns {Promise<Object>} The connected device
   */
  async connectDevice(deviceData) {
    try {
      const response = await fetch(`${BASE_URLS.API}${API_ENDPOINTS.WEARABLES.CONNECT_DEVICE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deviceData),
        credentials: "include",
      })
      return await response.json()
    } catch (error) {
      console.error("Error connecting device:", error)
      throw error
    }
  }

  /**
   * Disconnect a device
   * @param {string} deviceId - The device ID
   * @returns {Promise<Object>} The response from the API
   */
  async disconnectDevice(deviceId) {
    try {
      const response = await fetch(`${BASE_URLS.API}${API_ENDPOINTS.WEARABLES.DISCONNECT_DEVICE(deviceId)}`, {
        method: "POST",
        credentials: "include",
      })
      return await response.json()
    } catch (error) {
      console.error("Error disconnecting device:", error)
      throw error
    }
  }

  /**
   * Sync data from a device
   * @param {string} deviceId - The device ID
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} The response from the API
   */
  async syncDevice(deviceId, options = {}) {
    try {
      const response = await fetch(`${BASE_URLS.API}${API_ENDPOINTS.WEARABLES.SYNC_DEVICE(deviceId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
        credentials: "include",
      })
      return await response.json()
    } catch (error) {
      console.error("Error syncing device:", error)
      throw error
    }
  }

  /**
   * Get health data for a user
   * @param {string} userId - The user ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} The health data
   */
  async getHealthData(userId, options = {}) {
    try {
      const { startDate, endDate, metric } = options
      const queryParams = new URLSearchParams()

      if (startDate) {
        queryParams.append("startDate", formatDate(startDate, "YYYY-MM-DD"))
      }

      if (endDate) {
        queryParams.append("endDate", formatDate(endDate, "YYYY-MM-DD"))
      }

      if (metric) {
        queryParams.append("metric", metric)
      }

      const url = `${BASE_URLS.API}${API_ENDPOINTS.WEARABLES.HEALTH_DATA(userId)}?${queryParams.toString()}`

      const response = await fetch(url, {
        credentials: "include",
      })

      return await response.json()
    } catch (error) {
      console.error("Error getting health data:", error)
      throw error
    }
  }

  /**
   * Analyze health data
   * @param {Object} data - The health data to analyze
   * @returns {Promise<Object>} The analysis results
   */
  async analyzeHealthData(data) {
    try {
      const response = await fetch(`${BASE_URLS.API}${API_ENDPOINTS.WEARABLES.ANALYZE_HEALTH_DATA}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      })
      return await response.json()
    } catch (error) {
      console.error("Error analyzing health data:", error)
      throw error
    }
  }
}

// Create and export the service instance
export const wearablesService = new WearablesService()
