// api/auth.js
// lib/api/auth.js
import { apiRequest, createApiService } from "./client"

/**
 * Base API service for user-related endpoints
 */
const authApi = createApiService("/users")

/**
 * Auth-related API functions
 */
const auth = {
  ...authApi,

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Login response with tokens and user data
   */
  login: (credentials) =>
    apiRequest("POST", "/users/login", credentials, {
      errorMessage: "Login failed",
    }),

  /**
   * Logout user
   * @returns {Promise<Object>} Logout response
   */
  logout: () =>
    apiRequest("POST", "/users/logout", null, {
      errorMessage: "Logout failed",
    }),

  /**
   * Get current user
   * @returns {Promise<Object>} Current user data
   */
  getCurrentUser: () =>
    apiRequest("GET", "/users/me", null, {
      errorMessage: "Failed to fetch current user",
    }),

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  register: (userData) =>
    apiRequest("POST", "/users/register", userData, {
      errorMessage: "Registration failed",
      successMessage: "Registration successful",
    }),

  /**
   * Verify 2FA code
   * @param {Object} verificationData - 2FA verification data
   * @returns {Promise<Object>} Verification response
   */
  verify2FA: (verificationData) =>
    apiRequest("POST", "/users/verify-2fa", verificationData, {
      errorMessage: "2FA verification failed",
    }),

  /**
   * Setup 2FA
   * @returns {Promise<Object>} 2FA setup response with QR code
   */
  setup2FA: () =>
    apiRequest("POST", "/users/setup-2fa", null, {
      errorMessage: "2FA setup failed",
    }),

  /**
   * Confirm 2FA setup
   * @param {Object} confirmationData - 2FA confirmation data
   * @returns {Promise<Object>} Confirmation response
   */
  confirm2FA: (confirmationData) =>
    apiRequest("POST", "/users/confirm-2fa", confirmationData, {
      errorMessage: "2FA confirmation failed",
      successMessage: "2FA enabled successfully",
    }),

  /**
   * Disable 2FA
   * @param {Object} disableData - 2FA disable data
   * @returns {Promise<Object>} Disable response
   */
  disable2FA: (disableData) =>
    apiRequest("POST", "/users/disable-2fa", disableData, {
      errorMessage: "2FA disable failed",
      successMessage: "2FA disabled successfully",
    }),

  /**
   * Update user profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>} Updated profile
   */
  updateProfile: (profileData) =>
    apiRequest("POST", "/users/update-profile", profileData, {
      errorMessage: "Profile update failed",
      successMessage: "Profile updated successfully",
    }),
}

export default auth
