// api/auth.js - Add email verification endpoints

import { apiRequest } from "./client"

/**
 * Authentication API service
 * Handles user authentication, registration, and profile management
 */
const authAPI = {
  /**
   * Login with username and password
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} - Response with user data and tokens
   */
  login: (credentials) =>
    apiRequest("POST", "/api/users/login/", credentials, {
      errorMessage: "Login failed",
    }),

  /**
   * Verify two-factor authentication
   * @param {Object} data - 2FA verification data
   * @returns {Promise<Object>} - Response with user data
   */
  verify2FA: (data) =>
    apiRequest("POST", "/api/users/verify-2fa/", data, {
      errorMessage: "2FA verification failed",
    }),

  /**
   * Setup two-factor authentication
   * @returns {Promise<Object>} - Response with 2FA setup data
   */
  setup2FA: () =>
    apiRequest("POST", "/api/users/setup-2fa/", null, {
      errorMessage: "2FA setup failed",
    }),

  /**
   * Confirm two-factor authentication setup
   * @param {Object} data - 2FA confirmation data
   * @returns {Promise<Object>} - Response with confirmation result
   */
  confirm2FA: (data) =>
    apiRequest("POST", "/api/users/confirm-2fa/", data, {
      errorMessage: "2FA confirmation failed",
    }),

  /**
   * Disable two-factor authentication
   * @param {Object} data - Password for verification
   * @returns {Promise<Object>} - Response with result
   */
  disable2FA: (data) =>
    apiRequest("POST", "/api/users/disable-2fa/", data, {
      errorMessage: "2FA disabling failed",
    }),

  /**
   * Logout current user
   * @returns {Promise<Object>} - Response with logout result
   */
  logout: () =>
    apiRequest("POST", "/api/users/logout/", null, {
      errorMessage: "Logout failed",
    }),

  /**
   * Get current user profile
   * @returns {Promise<Object>} - Response with user data
   */
  getCurrentUser: () =>
    apiRequest("GET", "/api/users/me/", null, {
      errorMessage: "Failed to fetch user profile",
    }),

  /**
   * Update user profile
   * @param {Object} data - Profile data to update
   * @returns {Promise<Object>} - Response with updated user data
   */
  updateProfile: (data) =>
    apiRequest("PUT", "/api/users/me/", data, {
      errorMessage: "Profile update failed",
      successMessage: "Profile updated successfully",
    }),

  /**
   * Request password reset
   * @param {Object} data - Email for password reset
   * @returns {Promise<Object>} - Response with result
   */
  requestPasswordReset: (data) =>
    apiRequest("POST", "/api/users/forgot-password/", data, {
      errorMessage: "Password reset request failed",
      successMessage: "Password reset instructions sent to your email",
    }),

  /**
   * Reset password with token
   * @param {Object} data - Reset token and new password
   * @returns {Promise<Object>} - Response with result
   */
  resetPassword: (data) =>
    apiRequest("POST", "/api/users/reset-password/", data, {
      errorMessage: "Password reset failed",
      successMessage: "Password reset successful",
    }),

  /**
   * Update user consent settings
   * @param {Object} data - Consent data
   * @returns {Promise<Object>} - Response with updated consent settings
   */
  updateConsent: (data) =>
    apiRequest("POST", "/api/users/update-consent/", data, {
      errorMessage: "Consent update failed",
      successMessage: "Consent settings updated",
    }),

  /**
   * Register new user
   * @param {Object} data - User registration data
   * @returns {Promise<Object>} - Response with new user data
   */
  registerUser: (data) =>
    apiRequest("POST", "/api/users/users/", data, {
      errorMessage: "Registration failed",
      successMessage: "Registration successful",
    }),

  /**
   * Request email verification
   * @param {Object} data - Email to verify
   * @returns {Promise<Object>} - Response with result
   */
  requestEmailVerification: (data) =>
    apiRequest("POST", "/api/users/request-email-verification/", data, {
      errorMessage: "Email verification request failed",
      successMessage: "Verification email sent",
    }),

  /**
   * Verify email with token
   * @param {Object} data - Verification token
   * @returns {Promise<Object>} - Response with verification result
   */
  verifyEmail: (data) =>
    apiRequest("POST", "/api/users/verify-email/", data, {
      errorMessage: "Email verification failed",
      successMessage: "Email verified successfully",
    }),
}

export default authAPI
