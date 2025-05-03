import { BASE_URLS, API_ENDPOINTS } from "@/lib/config"
import { formatDate } from "@/lib/utils"

/**
 * Service for interacting with Withings API
 */
class WithingsService {
  /**
   * Get the authorization URL for Withings OAuth
   * @returns {Promise<string>} The authorization URL
   */
  async getAuthUrl() {
    try {
      const response = await fetch(`${BASE_URLS.API}${API_ENDPOINTS.WEARABLES.PROVIDERS.WITHINGS.AUTH_URL}`)
      const data = await response.json()
      return data.authUrl
    } catch (error) {
      console.error("Error getting Withings auth URL:", error)
      throw error
    }
  }

  /**
   * Complete the OAuth flow with the authorization code
   * @param {string} code - The authorization code from Withings
   * @returns {Promise<Object>} The response from the API
   */
  async completeAuth(code) {
    try {
      const response = await fetch(`${BASE_URLS.API}${API_ENDPOINTS.WEARABLES.PROVIDERS.WITHINGS.COMPLETE_AUTH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
        credentials: "include",
      })
      return await response.json()
    } catch (error) {
      console.error("Error completing Withings auth:", error)
      throw error
    }
  }

  /**
   * Disconnect the user's Withings account
   * @returns {Promise<Object>} The response from the API
   */
  async disconnect() {
    try {
      const response = await fetch(`${BASE_URLS.API}${API_ENDPOINTS.WEARABLES.PROVIDERS.WITHINGS.DISCONNECT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
      return await response.json()
    } catch (error) {
      console.error("Error disconnecting Withings account:", error)
      throw error
    }
  }

  /**
   * Sync data from the user's Withings account
   * @param {Object} options - Sync options
   * @param {string} options.startDate - Start date for sync (YYYY-MM-DD)
   * @param {string} options.endDate - End date for sync (YYYY-MM-DD)
   * @returns {Promise<Object>} The response from the API
   */
  async syncData(options = {}) {
    try {
      const { startDate, endDate } = options
      const queryParams = new URLSearchParams()

      if (startDate) {
        queryParams.append("startDate", formatDate(startDate, "YYYY-MM-DD"))
      }

      if (endDate) {
        queryParams.append("endDate", formatDate(endDate, "YYYY-MM-DD"))
      }

      const url = `${BASE_URLS.API}${API_ENDPOINTS.WEARABLES.PROVIDERS.WITHINGS.SYNC}?${queryParams.toString()}`

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      return await response.json()
    } catch (error) {
      console.error("Error syncing Withings data:", error)
      throw error
    }
  }

  /**
   * Get health data from Withings
   * @param {string} userId - The user ID
   * @param {Object} options - Query options
   * @param {string} options.startDate - Start date for data (YYYY-MM-DD)
   * @param {string} options.endDate - End date for data (YYYY-MM-DD)
   * @param {string} options.metric - Specific metric to retrieve
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
      console.error("Error getting Withings health data:", error)
      throw error
    }
  }
}

export const withingsService = new WithingsService()
export default withingsService
