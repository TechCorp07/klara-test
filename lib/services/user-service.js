/**
 * User service for user management operations
 */
import apiClient from "../api-client"
import { API_ENDPOINTS } from "../config"

const userService = {
  /**
   * Get list of users
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated users
   */
  getUsers: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.USERS.USERS, {
      params,
      errorMessage: "Failed to fetch users",
    })
  },

  /**
   * Get a specific user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User details
   */
  getUserById: (userId) => {
    return apiClient.get(API_ENDPOINTS.USERS.USER(userId), {
      errorMessage: "Failed to fetch user details",
    })
  },

  /**
   * Create a new user
   * @param {Object} data - User data
   * @returns {Promise<Object>} - Created user
   */
  createUser: (data) => {
    return apiClient.post(API_ENDPOINTS.USERS.USERS, data, {
      errorMessage: "Failed to create user",
      successMessage: "User created successfully",
    })
  },

  /**
   * Update a user
   * @param {string} userId - User ID
   * @param {Object} data - Updated user data
   * @returns {Promise<Object>} - Updated user
   */
  updateUser: (userId, data) => {
    return apiClient.put(API_ENDPOINTS.USERS.USER(userId), data, {
      errorMessage: "Failed to update user",
      successMessage: "User updated successfully",
    })
  },

  /**
   * Delete a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Deletion result
   */
  deleteUser: (userId) => {
    return apiClient.delete(API_ENDPOINTS.USERS.USER(userId), {
      errorMessage: "Failed to delete user",
      successMessage: "User deleted successfully",
    })
  },

  /**
   * Get pending user approvals
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Pending approvals
   */
  getPendingApprovals: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.USERS.PENDING_APPROVALS, {
      params,
      errorMessage: "Failed to fetch pending approvals",
    })
  },

  /**
   * Approve a user
   * @param {string} userId - User ID
   * @param {Object} data - Approval data
   * @returns {Promise<Object>} - Approval result
   */
  approveUser: (userId, data = {}) => {
    return apiClient.post(API_ENDPOINTS.USERS.APPROVE_USER(userId), data, {
      errorMessage: "Failed to approve user",
      successMessage: "User approved successfully",
    })
  },

  /**
   * Get patient profile
   * @param {string} profileId - Profile ID
   * @returns {Promise<Object>} - Patient profile
   */
  getPatientProfile: (profileId) => {
    return apiClient.get(API_ENDPOINTS.USERS.PATIENT_PROFILE(profileId), {
      errorMessage: "Failed to fetch patient profile",
    })
  },

  /**
   * Get provider profile
   * @param {string} profileId - Profile ID
   * @returns {Promise<Object>} - Provider profile
   */
  getProviderProfile: (profileId) => {
    return apiClient.get(API_ENDPOINTS.USERS.PROVIDER_PROFILE(profileId), {
      errorMessage: "Failed to fetch provider profile",
    })
  },

  /**
   * Get patient conditions
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Patient conditions
   */
  getPatientConditions: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.USERS.PATIENT_CONDITIONS, {
      params,
      errorMessage: "Failed to fetch patient conditions",
    })
  },

  /**
   * Get consent logs
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Consent logs
   */
  getConsentLogs: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.USERS.CONSENT_LOGS, {
      params,
      errorMessage: "Failed to fetch consent logs",
    })
  },
}

export default userService
