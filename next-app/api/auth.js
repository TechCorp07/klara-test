// lib/api/auth.js
import apiClient, { createApiService, executeApiCall } from '@/client';

/**
 * Base API service for user-related endpoints
 */
const baseService = createApiService('/users');

/**
 * Authentication and user-related API functions
 */
const authApi = {
  // Base CRUD operations for users
  ...baseService,
  
  /**
   * Get current authenticated user
   * @returns {Promise<Object>} User object
   */
  getMe: async () => {
    return executeApiCall(
      () => apiClient.get('/api/auth/me'),
      'Failed to fetch user profile',
      { endpoint: '/api/auth/me' }
    ).then(data => data.user);
  },
  
  /**
   * Login with credentials
   * @param {Object} credentials - { username, password }
   * @returns {Promise<Object>} Login response
   */
  login: async (credentials) => {
    return executeApiCall(
      () => apiClient.post('/api/auth/login', credentials),
      'Login failed',
      { endpoint: '/api/auth/login' }
    );
  },
  
  /**
   * Verify two-factor authentication code
   * @param {string} token - 2FA token
   * @param {string} code - Verification code
   * @returns {Promise<Object>} Verification response
   */
  verify2FA: async (token, code) => {
    return executeApiCall(
      () => apiClient.post('/api/auth/verify-2fa', { token, code }),
      'Two-factor authentication verification failed',
      { endpoint: '/api/auth/verify-2fa' }
    );
  },
  
  /**
   * Log out the current user
   * @returns {Promise<Object>} Logout response
   */
  logout: async () => {
    return executeApiCall(
      () => apiClient.post('/api/auth/logout'),
      'Logout failed',
      { endpoint: '/api/auth/logout' }
    );
  },
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  register: async (userData) => {
    return baseService.create(userData, {
      errorMessage: 'User registration failed',
      trackingContext: { action: 'user_registration' }
    });
  },
  
  /**
   * Update current user's profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated user object
   */
  updateProfile: async (profileData) => {
    return executeApiCall(
      () => apiClient.patch('/users/me/', profileData),
      'Failed to update user profile',
      { endpoint: '/users/me' }
    );
  },
  
  /**
   * Request password reset
   * @param {string} email - User's email address
   * @returns {Promise<Object>} Reset request response
   */
  requestPasswordReset: async (email) => {
    return executeApiCall(
      () => apiClient.post('/users/request-password-reset/', { email }),
      'Failed to request password reset',
      { endpoint: '/users/request-password-reset' }
    );
  },
  
  /**
   * Reset password with token
   * @param {Object} resetData - { token, password }
   * @returns {Promise<Object>} Password reset response
   */
  resetPassword: async (resetData) => {
    return executeApiCall(
      () => apiClient.post('/users/reset-password/', resetData),
      'Failed to reset password',
      { endpoint: '/users/reset-password' }
    );
  },
  
  /**
   * Change password
   * @param {Object} passwordData - { current_password, new_password }
   * @returns {Promise<Object>} Password change response
   */
  changePassword: async (passwordData) => {
    return executeApiCall(
      () => apiClient.post('/users/change-password/', passwordData),
      'Failed to change password',
      { endpoint: '/users/change-password' }
    );
  },
  
  /**
   * Setup two-factor authentication
   * @returns {Promise<Object>} 2FA setup response with QR code
   */
  setup2FA: async () => {
    return executeApiCall(
      () => apiClient.post('/users/setup-2fa/'),
      'Failed to setup two-factor authentication',
      { endpoint: '/users/setup-2fa' }
    );
  },
  
  /**
   * Confirm two-factor authentication setup
   * @param {string} code - Verification code
   * @returns {Promise<Object>} 2FA confirmation response
   */
  confirm2FA: async (code) => {
    return executeApiCall(
      () => apiClient.post('/users/confirm-2fa/', { code }),
      'Failed to confirm two-factor authentication',
      { endpoint: '/users/confirm-2fa' }
    );
  },
  
  /**
   * Disable two-factor authentication
   * @param {string} password - User's password
   * @returns {Promise<Object>} 2FA disabling response
   */
  disable2FA: async (password) => {
    return executeApiCall(
      () => apiClient.post('/users/disable-2fa/', { password }),
      'Failed to disable two-factor authentication',
      { endpoint: '/users/disable-2fa' }
    );
  },
  
  /**
   * Update user consent settings
   * @param {string} type - Consent type
   * @param {boolean} consented - Whether user has consented
   * @returns {Promise<Object>} Consent update response
   */
  updateConsent: async (type, consented) => {
    return executeApiCall(
      () => apiClient.post('/users/update-consent/', { 
        consent_type: type, 
        consented 
      }),
      'Failed to update consent settings',
      { endpoint: '/users/update-consent' }
    );
  }
};

export default authApi;