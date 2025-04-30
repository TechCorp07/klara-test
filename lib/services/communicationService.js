// lib/services/communicationService.js
// Service wrapper for communication API

import { apiRequest } from "../../api/client"

/**
 * Communication service that provides access to community and messaging-related API functions
 */
export const communication = {
  /**
   * Get community topics with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated topics
   */
  getTopics: (filters = {}) =>
    apiRequest("GET", "/communication/community/topics", null, {
      params: filters,
      errorMessage: "Failed to fetch community topics",
    }),

  /**
   * Get topic by ID
   * @param {string} id - Topic ID
   * @returns {Promise<Object>} Topic details
   */
  getTopic: (id) =>
    apiRequest("GET", `/communication/community/topics/${id}`, null, {
      errorMessage: "Failed to fetch topic details",
    }),

  /**
   * Create a new topic
   * @param {Object} topicData - Topic data
   * @returns {Promise<Object>} Created topic
   */
  createTopic: (topicData) =>
    apiRequest("POST", "/communication/community/topics", topicData, {
      errorMessage: "Failed to create topic",
      successMessage: "Topic created successfully",
    }),

  /**
   * Get posts for a topic
   * @param {string} topicId - Topic ID
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated posts
   */
  getPosts: (topicId, filters = {}) =>
    apiRequest("GET", `/communication/community/topics/${topicId}/posts`, null, {
      params: filters,
      errorMessage: "Failed to fetch posts",
    }),

  /**
   * Create a new post
   * @param {string} topicId - Topic ID
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Created post
   */
  createPost: (topicId, postData) =>
    apiRequest("POST", `/communication/community/topics/${topicId}/posts`, postData, {
      errorMessage: "Failed to create post",
      successMessage: "Post created successfully",
    }),

  /**
   * Get moderation queue
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated moderation items
   */
  getModerationQueue: (filters = {}) =>
    apiRequest("GET", "/communication/community/moderation", null, {
      params: filters,
      errorMessage: "Failed to fetch moderation queue",
    }),

  /**
   * Approve moderation item
   * @param {string} id - Moderation item ID
   * @returns {Promise<Object>} Approval response
   */
  approveModeration: (id) =>
    apiRequest("POST", `/communication/community/moderation/${id}/approve`, null, {
      errorMessage: "Failed to approve item",
      successMessage: "Item approved successfully",
    }),

  /**
   * Reject moderation item
   * @param {string} id - Moderation item ID
   * @param {Object} rejectionData - Rejection data with reason
   * @returns {Promise<Object>} Rejection response
   */
  rejectModeration: (id, rejectionData) =>
    apiRequest("POST", `/communication/community/moderation/${id}/reject`, rejectionData, {
      errorMessage: "Failed to reject item",
      successMessage: "Item rejected successfully",
    }),

  /**
   * Get user messages
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated messages
   */
  getMessages: (filters = {}) =>
    apiRequest("GET", "/communication/messages", null, {
      params: filters,
      errorMessage: "Failed to fetch messages",
    }),

  /**
   * Get conversation by ID
   * @param {string} id - Conversation ID
   * @returns {Promise<Object>} Conversation with messages
   */
  getConversation: (id) =>
    apiRequest("GET", `/communication/conversations/${id}`, null, {
      errorMessage: "Failed to fetch conversation",
    }),

  /**
   * Send message
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Sent message
   */
  sendMessage: (messageData) =>
    apiRequest("POST", "/communication/messages", messageData, {
      errorMessage: "Failed to send message",
      successMessage: "Message sent successfully",
    }),
}

export default communication
