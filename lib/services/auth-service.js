/**
 * Authentication service for interacting with Django auth endpoints
 */
import apiClient from "../api-client"
import { API_ENDPOINTS } from "../config"

// Add this function to set the user role cookie after successful login
const setUserRoleCookie = (role) => {
  document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Strict; Secure`
}

const handleAuthError = (error) => {
  console.error("Authentication error:", error)
  // You can add more sophisticated error handling logic here,
  // such as displaying a user-friendly message or redirecting to an error page.
}

const authService = {
  /**
   * Log in a user
   * @param {Object} credentials - User credentials (username, password)
   * @returns {Promise<Object>} - Login response with tokens and user data
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", credentials)

      if (response.data.token) {
        localStorage.setItem("token", response.data.token)

        // Set the user role cookie for middleware access
        if (response.data.user && response.data.user.role) {
          setUserRoleCookie(response.data.user.role)
        }
      }

      return response.data
    } catch (error) {
      handleAuthError(error)
      throw error
    }
  },

  /**
   * Log out the current user
   * @returns {Promise<Object>} - Logout response
   */
  logout: async () => {
    try {
      await apiClient.post("/auth/logout")
    } catch (error) {
      console.error("Logout API error:", error)
    } finally {
      localStorage.removeItem("token")
      document.cookie = "user_role=; path=/; max-age=0; SameSite=Strict; Secure"
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registration response
   */
  register: async (userData) => {
    return apiClient.post(API_ENDPOINTS.USERS.REGISTER, userData, {
      withAuth: false,
      errorMessage: "Registration failed. Please check your information.",
      successMessage: "Registration successful. Please wait for account approval.",
    })
  },

  /**
   * Get the current authenticated user
   * @returns {Promise<Object>} - Current user data
   */
  getCurrentUser: async () => {
    return apiClient.get(API_ENDPOINTS.USERS.CURRENT_USER, {
      errorMessage: "Failed to fetch user data.",
    })
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} - Password reset request response
   */
  requestPasswordReset: async (email) => {
    return apiClient.post(
      API_ENDPOINTS.USERS.FORGOT_PASSWORD,
      { email },
      {
        withAuth: false,
        errorMessage: null, // Don't show error for security reasons
        successMessage: "If your email is registered with us, you will receive a password reset link shortly.",
      },
    )
  },

  /**
   * Reset password with token
   * @param {Object} resetData - Password reset data (token, password, password_confirm)
   * @returns {Promise<Object>} - Password reset response
   */
  resetPassword: async (resetData) => {
    return apiClient.post(API_ENDPOINTS.USERS.RESET_PASSWORD, resetData, {
      withAuth: false,
      errorMessage: "Password reset failed. Please try again.",
      successMessage: "Your password has been reset successfully.",
    })
  },

  /**
   * Verify email address
   * @param {Object} verificationData - Email verification data (token, email)
   * @returns {Promise<Object>} - Email verification response
   */
  verifyEmail: async (verificationData) => {
    return apiClient.post(API_ENDPOINTS.USERS.VERIFY_EMAIL, verificationData, {
      withAuth: false,
      errorMessage: "Email verification failed. Please try again.",
      successMessage: "Your email has been verified successfully.",
    })
  },

  /**
   * Request email verification
   * @returns {Promise<Object>} - Email verification request response
   */
  requestEmailVerification: async () => {
    return apiClient.post(API_ENDPOINTS.USERS.REQUEST_EMAIL_VERIFICATION, null, {
      errorMessage: "Failed to request email verification. Please try again.",
      successMessage: "Verification email sent. Please check your inbox.",
    })
  },

  /**
   * Setup two-factor authentication
   * @returns {Promise<Object>} - 2FA setup response with QR code
   */
  setup2FA: async () => {
    return apiClient.post(API_ENDPOINTS.USERS.SETUP_2FA, null, {
      errorMessage: "Failed to set up two-factor authentication. Please try again.",
    })
  },

  /**
   * Confirm two-factor authentication setup
   * @param {string} code - 2FA verification code
   * @returns {Promise<Object>} - 2FA confirmation response
   */
  confirm2FA: async (code) => {
    return apiClient.post(
      API_ENDPOINTS.USERS.CONFIRM_2FA,
      { code },
      {
        errorMessage: "Failed to confirm two-factor authentication. Please check your code.",
        successMessage: "Two-factor authentication enabled successfully.",
      },
    )
  },

  /**
   * Verify two-factor authentication code
   * @param {Object} data - 2FA verification data (token, code)
   * @returns {Promise<Object>} - 2FA verification response
   */
  verify2FA: async (data) => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.VERIFY_2FA, data, {
      withAuth: false,
      errorMessage: "Invalid verification code. Please try again.",
    })

    // Store tokens in localStorage
    if (response.access) {
      localStorage.setItem("access_token", response.access)
    }
    if (response.refresh) {
      localStorage.setItem("refresh_token", response.refresh)
    }

    return response
  },

  /**
   * Disable two-factor authentication
   * @param {string} code - 2FA verification code
   * @returns {Promise<Object>} - 2FA disable response
   */
  disable2FA: async (code) => {
    return apiClient.post(
      API_ENDPOINTS.USERS.DISABLE_2FA,
      { code },
      {
        errorMessage: "Failed to disable two-factor authentication. Please check your code.",
        successMessage: "Two-factor authentication disabled successfully.",
      },
    )
  },

  /**
   * Update user consent settings
   * @param {Object} consentData - Consent settings (consent_type, consented)
   * @returns {Promise<Object>} - Consent update response
   */
  updateConsent: async (consentData) => {
    return apiClient.post(API_ENDPOINTS.USERS.UPDATE_CONSENT, consentData, {
      errorMessage: "Failed to update consent settings. Please try again.",
      successMessage: "Consent settings updated successfully.",
    })
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("access_token")
  },

  /**
   * Refresh the access token
   * @returns {Promise<boolean>} - True if token was refreshed successfully
   */
  refreshToken: async () => {
    return apiClient.refreshToken()
  },
}

export default authService
