// lib/api/auth.js
import apiClient from './client';

/**
 * Authentication and user-related API functions
 */
const authApi = {
  /**
   * Get current authenticated user
   * @returns {Promise<Object>} User object
   */
  getMe: async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },
  
  /**
   * Login with credentials
   * @param {Object} credentials - { username, password }
   * @returns {Promise<Object>} Login response
   */
  login: async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Verify two-factor authentication code
   * @param {string} token - 2FA token
   * @param {string} code - Verification code
   * @returns {Promise<Object>} Verification response
   */
  verify2FA: async (token, code) => {
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, code }),
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  },
  
  /**
   * Log out the current user
   * @returns {Promise<Object>} Logout response
   */
  logout: async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  register: async (userData) => {
    const { data } = await apiClient.post('/users/users/', userData);
    return data;
  },
  
  /**
   * Update current user's profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated user object
   */
  updateProfile: async (profileData) => {
    const { data } = await apiClient.patch('/users/me/', profileData);
    return data;
  },
  
  /**
   * Request password reset
   * @param {string} email - User's email address
   * @returns {Promise<Object>} Reset request response
   */
  requestPasswordReset: async (email) => {
    const { data } = await apiClient.post('/users/request-password-reset/', { email });
    return data;
  },
  
  /**
   * Reset password with token
   * @param {Object} resetData - { token, password }
   * @returns {Promise<Object>} Password reset response
   */
  resetPassword: async (resetData) => {
    const { data } = await apiClient.post('/users/reset-password/', resetData);
    return data;
  },
  
  /**
   * Change password
   * @param {Object} passwordData - { current_password, new_password }
   * @returns {Promise<Object>} Password change response
   */
  changePassword: async (passwordData) => {
    const { data } = await apiClient.post('/users/change-password/', passwordData);
    return data;
  },
  
  /**
   * Setup two-factor authentication
   * @returns {Promise<Object>} 2FA setup response with QR code
   */
  setup2FA: async () => {
    const { data } = await apiClient.post('/users/setup-2fa/');
    return data;
  },
  
  /**
   * Confirm two-factor authentication setup
   * @param {string} code - Verification code
   * @returns {Promise<Object>} 2FA confirmation response
   */
  confirm2FA: async (code) => {
    const { data } = await apiClient.post('/users/confirm-2fa/', { code });
    return data;
  },
  
  /**
   * Disable two-factor authentication
   * @param {string} password - User's password
   * @returns {Promise<Object>} 2FA disabling response
   */
  disable2FA: async (password) => {
    const { data } = await apiClient.post('/users/disable-2fa/', { password });
    return data;
  },
  
  /**
   * Update user consent settings
   * @param {string} type - Consent type
   * @param {boolean} consented - Whether user has consented
   * @returns {Promise<Object>} Consent update response
   */
  updateConsent: async (type, consented) => {
    const { data } = await apiClient.post('/users/update-consent/', { 
      consent_type: type, 
      consented 
    });
    return data;
  }
};

export default authApi;