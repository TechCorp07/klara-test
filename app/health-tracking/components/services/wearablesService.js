/**
 * Service for interacting with the wearables API
 */

// Update imports to use the config
import { API_ENDPOINTS } from "../../../../lib/env"

// Helper function for making authenticated API requests
const fetchWithAuth = async (url, options = {}) => {
  // In a real implementation, you'd add authentication headers here
  // e.g., options.headers = { ...options.headers, Authorization: `Bearer ${getAuthToken()}` };

  const response = await fetch(url, options)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `API request failed with status ${response.status}`)
  }

  return response.json()
}

// Wearables service object
export const wearables = {
  /**
   * Get all wearable device integrations for a user
   * @param {string} userId
   * @returns {Promise<Object>} List of device integrations
   */
  getWearableDevices: async (userId) => {
    return fetchWithAuth(API_ENDPOINTS.WEARABLES.INTEGRATIONS)
  },

  /**
   * Get data for a specific wearable device
   * @param {string} userId
   * @param {string} dataType
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Promise<Object>} Device data
   */
  getWearableData: async (userId, dataType, startDate, endDate) => {
    const params = new URLSearchParams({
      measurement_type: dataType,
      start_date: startDate,
      end_date: endDate,
    })

    return fetchWithAuth(`${API_ENDPOINTS.WEARABLES.MEASUREMENTS}?${params}`)
  },

  /**
   * Get Withings profile
   * @returns {Promise<Object>} Withings profile
   */
  getWithingsProfile: async () => {
    const integrations = await fetchWithAuth(API_ENDPOINTS.WEARABLES.INTEGRATIONS)
    // Find the Withings integration if it exists
    const withingsIntegration = integrations.results.find((i) => i.integration_type === "withings")

    if (!withingsIntegration) {
      return null
    }

    return {
      user_email: `User ${withingsIntegration.user}`,
      connected_at: withingsIntegration.created_at,
      last_sync: withingsIntegration.last_sync || withingsIntegration.created_at,
      status: withingsIntegration.is_active ? "active" : "inactive",
    }
  },

  /**
   * Connect to Withings
   * @returns {Promise<Object>} Authorization URL
   */
  connectWithings: async () => {
    const connectInfo = await fetchWithAuth(API_ENDPOINTS.WEARABLES.CONNECT)
    return { authorization_url: connectInfo.withings.auth_url }
  },

  /**
   * Connect to any supported wearable device
   * @param {string} deviceType
   * @returns {Promise<Object>} Authorization URL or instructions
   */
  connectDevice: async (deviceType) => {
    const connectInfo = await fetchWithAuth(API_ENDPOINTS.WEARABLES.CONNECT)

    if (!connectInfo[deviceType]) {
      throw new Error(`Unsupported device type: ${deviceType}`)
    }

    return connectInfo[deviceType]
  },

  /**
   * Fetch data from Withings
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Promise<Object>} Sync status
   */
  fetchWithingsData: async (startDate, endDate) => {
    // Find the Withings integration ID first
    const integrations = await fetchWithAuth(API_ENDPOINTS.WEARABLES.INTEGRATIONS)
    const withingsIntegration = integrations.results.find((i) => i.integration_type === "withings")

    if (!withingsIntegration) {
      throw new Error("No Withings integration found")
    }

    return fetchWithAuth(API_ENDPOINTS.WEARABLES.SYNC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        integration_id: withingsIntegration.id,
      }),
    })
  },

  /**
   * Sync data from any device
   * @param {number} integrationId
   * @returns {Promise<Object>} Sync status
   */
  syncDeviceData: async (integrationId) => {
    return fetchWithAuth(API_ENDPOINTS.WEARABLES.SYNC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        integration_id: integrationId,
      }),
    })
  },

  /**
   * Disconnect a device
   * @param {number} integrationId
   * @returns {Promise<void>}
   */
  disconnectDevice: async (integrationId) => {
    return fetchWithAuth(`${API_ENDPOINTS.WEARABLES.INTEGRATIONS}${integrationId}/`, {
      method: "DELETE",
    })
  },

  /**
   * Handle OAuth callback
   * @param {string} integrationType
   * @param {string} code
   * @param {string} redirectUri
   * @returns {Promise<Object>} Integration details
   */
  handleOAuthCallback: async (integrationType, code, redirectUri) => {
    return fetchWithAuth(API_ENDPOINTS.WEARABLES.CALLBACK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        integration_type: integrationType,
        code,
        redirect_uri: redirectUri,
      }),
    })
  },

  /**
   * Sync Apple Health data from mobile app
   * @param {Array} measurements
   * @returns {Promise<Object>} Sync status
   */
  syncAppleHealthData: async (measurements) => {
    return fetchWithAuth(API_ENDPOINTS.WEARABLES.APPLE_HEALTH_SYNC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        measurements,
      }),
    })
  },

  /**
   * Sync Samsung Health data from mobile app
   * @param {Array} measurements
   * @returns {Promise<Object>} Sync status
   */
  syncSamsungHealthData: async (measurements) => {
    return fetchWithAuth(API_ENDPOINTS.WEARABLES.SAMSUNG_HEALTH_SYNC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        measurements,
      }),
    })
  },
}
