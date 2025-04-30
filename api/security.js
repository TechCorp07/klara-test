"use client"

import { apiRequest } from "./client"

/**
 * Security-related API endpoints
 */
const securityApi = {
  /**
   * Set up two-factor authentication
   * @returns {Promise<Object>} - 2FA setup data including QR code URL
   */
  setup2FA: async () => {
    return apiRequest("POST", "/auth/setup-2fa", null, {
      errorMessage: "Failed to set up two-factor authentication",
    })
  },

  /**
   * Verify two-factor authentication setup
   * @param {string} code - Verification code from authenticator app
   * @returns {Promise<Object>} - Verification result
   */
  verify2FA: async (code) => {
    return apiRequest(
      "POST",
      "/auth/verify-2fa",
      { code },
      {
        errorMessage: "Failed to verify two-factor authentication",
      },
    )
  },

  /**
   * Disable two-factor authentication
   * @returns {Promise<Object>} - Disable result
   */
  disable2FA: async () => {
    return apiRequest("POST", "/auth/disable-2fa", null, {
      errorMessage: "Failed to disable two-factor authentication",
    })
  },

  /**
   * Get login history
   * @param {number} limit - Maximum number of entries to return
   * @returns {Promise<Object>} - Login history
   */
  getLoginHistory: async (limit = 10) => {
    return apiRequest("GET", `/auth/login-history?limit=${limit}`, null, {
      errorMessage: "Failed to fetch login history",
    })
  },

  /**
   * Change password
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} - Password change result
   */
  changePassword: async (passwordData) => {
    return apiRequest("POST", "/auth/change-password", passwordData, {
      errorMessage: "Failed to change password",
    })
  },

  /**
   * Get security settings
   * @returns {Promise<Object>} - Security settings
   */
  getSecuritySettings: async () => {
    return apiRequest("GET", "/auth/security-settings", null, {
      errorMessage: "Failed to fetch security settings",
    })
  },

  /**
   * Update security settings
   * @param {Object} settings - Security settings to update
   * @returns {Promise<Object>} - Updated security settings
   */
  updateSecuritySettings: async (settings) => {
    return apiRequest("PUT", "/auth/security-settings", settings, {
      errorMessage: "Failed to update security settings",
    })
  },
}

export default securityApi
