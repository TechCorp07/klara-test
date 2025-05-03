/**
 * Community service for community-related operations
 */
import apiClient from "../api-client"
import { API_ENDPOINTS } from "../config"

const communityService = {
  /**
   * Get community groups
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated groups
   */
  getGroups: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.COMMUNITY.GROUPS, {
      params,
      errorMessage: "Failed to fetch community groups",
    })
  },

  /**
   * Get a specific community group
   * @param {string} groupId - Group ID
   * @returns {Promise<Object>} - Group details
   */
  getGroupById: (groupId) => {
    return apiClient.get(API_ENDPOINTS.COMMUNITY.GROUP(groupId), {
      errorMessage: "Failed to fetch community group",
    })
  },

  /**
   * Create a community group
   * @param {Object} data - Group data
   * @returns {Promise<Object>} - Created group
   */
  createGroup: (data) => {
    return apiClient.post(API_ENDPOINTS.COMMUNITY.GROUPS, data, {
      errorMessage: "Failed to create community group",
      successMessage: "Community group created successfully",
    })
  },

  /**
   * Update a community group
   * @param {string} groupId - Group ID
   * @param {Object} data - Updated group data
   * @returns {Promise<Object>} - Updated group
   */
  updateGroup: (groupId, data) => {
    return apiClient.put(API_ENDPOINTS.COMMUNITY.GROUP(groupId), data, {
      errorMessage: "Failed to update community group",
      successMessage: "Community group updated successfully",
    })
  },

  /**
   * Delete a community group
   * @param {string} groupId - Group ID
   * @returns {Promise<Object>} - Deletion result
   */
  deleteGroup: (groupId) => {
    return apiClient.delete(API_ENDPOINTS.COMMUNITY.GROUP(groupId), {
      errorMessage: "Failed to delete community group",
      successMessage: "Community group deleted successfully",
    })
  },

  /**
   * Get group memberships
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated memberships
   */
  getMemberships: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.COMMUNITY.MEMBERSHIPS, {
      params,
      errorMessage: "Failed to fetch memberships",
    })
  },

  /**
   * Join a community group
   * @param {Object} data - Membership data
   * @returns {Promise<Object>} - Created membership
   */
  joinGroup: (data) => {
    return apiClient.post(API_ENDPOINTS.COMMUNITY.MEMBERSHIPS, data, {
      errorMessage: "Failed to join community group",
      successMessage: "Joined community group successfully",
    })
  },

  /**
   * Leave a community group
   * @param {string} membershipId - Membership ID
   * @returns {Promise<Object>} - Deletion result
   */
  leaveGroup: (membershipId) => {
    return apiClient.delete(`${API_ENDPOINTS.COMMUNITY.MEMBERSHIPS}${membershipId}/`, {
      errorMessage: "Failed to leave community group",
      successMessage: "Left community group successfully",
    })
  },

  /**
   * Get community posts
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated posts
   */
  getPosts: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.COMMUNITY.POSTS, {
      params,
      errorMessage: "Failed to fetch community posts",
    })
  },

  /**
   * Create a community post
   * @param {Object} data - Post data
   * @returns {Promise<Object>} - Created post
   */
  createPost: (data) => {
    return apiClient.post(API_ENDPOINTS.COMMUNITY.POSTS, data, {
      errorMessage: "Failed to create community post",
      successMessage: "Community post created successfully",
    })
  },

  /**
   * Get post comments
   * @param {string} postId - Post ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated comments
   */
  getComments: (postId, params = {}) => {
    return apiClient.get(`${API_ENDPOINTS.COMMUNITY.POSTS}${postId}/comments/`, {
      params,
      errorMessage: "Failed to fetch comments",
    })
  },

  /**
   * Create a comment on a post
   * @param {string} postId - Post ID
   * @param {Object} data - Comment data
   * @returns {Promise<Object>} - Created comment
   */
  createComment: (postId, data) => {
    return apiClient.post(`${API_ENDPOINTS.COMMUNITY.POSTS}${postId}/comments/`, data, {
      errorMessage: "Failed to create comment",
      successMessage: "Comment created successfully",
    })
  },

  /**
   * Get community events
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated events
   */
  getEvents: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.COMMUNITY.EVENTS, {
      params,
      errorMessage: "Failed to fetch community events",
    })
  },

  /**
   * Create a community event
   * @param {Object} data - Event data
   * @returns {Promise<Object>} - Created event
   */
  createEvent: (data) => {
    return apiClient.post(API_ENDPOINTS.COMMUNITY.EVENTS, data, {
      errorMessage: "Failed to create community event",
      successMessage: "Community event created successfully",
    })
  },

  /**
   * RSVP to an event
   * @param {string} eventId - Event ID
   * @param {Object} data - RSVP data
   * @returns {Promise<Object>} - RSVP result
   */
  rsvpToEvent: (eventId, data) => {
    return apiClient.post(`${API_ENDPOINTS.COMMUNITY.EVENTS}${eventId}/rsvp/`, data, {
      errorMessage: "Failed to RSVP to event",
      successMessage: "RSVP submitted successfully",
    })
  },

  /**
   * Get community resources
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated resources
   */
  getResources: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.COMMUNITY.RESOURCES, {
      params,
      errorMessage: "Failed to fetch community resources",
    })
  },

  /**
   * Get community accessibility settings
   * @returns {Promise<Object>} - Accessibility settings
   */
  getAccessibilitySettings: () => {
    return apiClient.get(API_ENDPOINTS.COMMUNITY.ACCESSIBILITY, {
      errorMessage: "Failed to fetch accessibility settings",
    })
  },

  /**
   * Update community accessibility settings
   * @param {Object} data - Updated settings
   * @returns {Promise<Object>} - Updated settings
   */
  updateAccessibilitySettings: (data) => {
    return apiClient.put(API_ENDPOINTS.COMMUNITY.ACCESSIBILITY, data, {
      errorMessage: "Failed to update accessibility settings",
      successMessage: "Accessibility settings updated successfully",
    })
  },
}

export default communityService
