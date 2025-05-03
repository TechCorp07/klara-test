// api/token.js
import { apiRequest } from "./client"

/**
 * Token API service
 * Handles token refresh and management
 */
const tokenAPI = {
  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - Response with new access token
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await apiRequest("POST", "/token/refresh", { refresh: refreshToken })
      return response
    } catch (error) {
      throw error
    }
  },
}

export default tokenAPI
