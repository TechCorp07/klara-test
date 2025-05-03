/**
 * Communication service for messaging and notifications
 */
import apiClient from "../api-client"
import { API_ENDPOINTS } from "../config"

const communicationService = {
  /**
   * Get conversations
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated conversations
   */
  getConversations: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.COMMUNICATION.CONVERSATIONS.BASE, {
      params,
      errorMessage: "Failed to fetch conversations",
    })
  },

  /**
   * Get a specific conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} - Conversation details
   */
  getConversationById: (conversationId) => {
    return apiClient.get(API_ENDPOINTS.COMMUNICATION.CONVERSATIONS.CONVERSATION(conversationId), {
      errorMessage: "Failed to fetch conversation",
    })
  },

  /**
   * Create a new conversation
   * @param {Object} data - Conversation data
   * @returns {Promise<Object>} - Created conversation
   */
  createConversation: (data) => {
    return apiClient.post(API_ENDPOINTS.COMMUNICATION.CONVERSATIONS.BASE, data, {
      errorMessage: "Failed to create conversation",
      successMessage: "Conversation created successfully",
    })
  },

  /**
   * Get messages for a conversation
   * @param {string} conversationId - Conversation ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated messages
   */
  getConversationMessages: (conversationId, params = {}) => {
    return apiClient.get(API_ENDPOINTS.COMMUNICATION.CONVERSATIONS.MESSAGES(conversationId), {
      params,
      errorMessage: "Failed to fetch messages",
    })
  },

  /**
   * Send a message in a conversation
   * @param {string} conversationId - Conversation ID
   * @param {Object} data - Message data
   * @returns {Promise<Object>} - Created message
   */
  sendMessage: (conversationId, data) => {
    return apiClient.post(API_ENDPOINTS.COMMUNICATION.CONVERSATIONS.MESSAGES(conversationId), data, {
      errorMessage: "Failed to send message",
    })
  },

  /**
   * Get all messages
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated messages
   */
  getMessages: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.COMMUNICATION.MESSAGES.BASE, {
      params,
      errorMessage: "Failed to fetch messages",
    })
  },

  /**
   * Get a specific message
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} - Message details
   */
  getMessageById: (messageId) => {
    return apiClient.get(API_ENDPOINTS.COMMUNICATION.MESSAGES.MESSAGE(messageId), {
      errorMessage: "Failed to fetch message",
    })
  },

  /**
   * Mark a message as read
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} - Updated message
   */
  markMessageAsRead: (messageId) => {
    return apiClient.patch(
      API_ENDPOINTS.COMMUNICATION.MESSAGES.MESSAGE(messageId),
      { read: true },
      {
        errorMessage: "Failed to mark message as read",
      },
    )
  },

  /**
   * Get notifications
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated notifications
   */
  getNotifications: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.COMMUNICATION.NOTIFICATIONS, {
      params,
      errorMessage: "Failed to fetch notifications",
    })
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} - Updated notification
   */
  markNotificationAsRead: (notificationId) => {
    return apiClient.patch(
      `${API_ENDPOINTS.COMMUNICATION.NOTIFICATIONS}${notificationId}/`,
      { is_read: true },
      {
        errorMessage: "Failed to mark notification as read",
      },
    )
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} - Result
   */
  markAllNotificationsAsRead: () => {
    return apiClient.post(
      `${API_ENDPOINTS.COMMUNICATION.NOTIFICATIONS}mark-all-read/`,
      {},
      {
        errorMessage: "Failed to mark all notifications as read",
        successMessage: "All notifications marked as read",
      },
    )
  },

  /**
   * Get community forums
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated forums
   */
  getForums: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.COMMUNICATION.COMMUNITY.FORUMS, {
      params,
      errorMessage: "Failed to fetch forums",
    })
  },

  /**
   * Get a specific forum
   * @param {string} forumId - Forum ID
   * @returns {Promise<Object>} - Forum details
   */
  getForumById: (forumId) => {
    return apiClient.get(API_ENDPOINTS.COMMUNICATION.COMMUNITY.FORUM(forumId), {
      errorMessage: "Failed to fetch forum",
    })
  },

  /**
   * Get forum threads
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated threads
   */
  getThreads: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.COMMUNICATION.COMMUNITY.THREADS, {
      params,
      errorMessage: "Failed to fetch threads",
    })
  },

  /**
   * Get a specific thread
   * @param {string} threadId - Thread ID
   * @returns {Promise<Object>} - Thread details
   */
  getThreadById: (threadId) => {
    return apiClient.get(API_ENDPOINTS.COMMUNICATION.COMMUNITY.THREAD(threadId), {
      errorMessage: "Failed to fetch thread",
    })
  },

  /**
   * Get thread posts
   * @param {string} threadId - Thread ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated posts
   */
  getThreadPosts: (threadId, params = {}) => {
    return apiClient.get(API_ENDPOINTS.COMMUNICATION.COMMUNITY.POSTS(threadId), {
      params,
      errorMessage: "Failed to fetch posts",
    })
  },

  /**
   * Create a post in a thread
   * @param {string} threadId - Thread ID
   * @param {Object} data - Post data
   * @returns {Promise<Object>} - Created post
   */
  createPost: (threadId, data) => {
    return apiClient.post(API_ENDPOINTS.COMMUNICATION.COMMUNITY.POSTS(threadId), data, {
      errorMessage: "Failed to create post",
      successMessage: "Post created successfully",
    })
  },

  /**
   * Get moderation queue
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Paginated moderation items
   */
  getModerationQueue: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.COMMUNICATION.COMMUNITY.MODERATION.QUEUE, {
      params,
      errorMessage: "Failed to fetch moderation queue",
    })
  },

  /**
   * Approve a moderation item
   * @param {string} itemId - Moderation item ID
   * @returns {Promise<Object>} - Result
   */
  approveModeration: (itemId) => {
    return apiClient.post(
      API_ENDPOINTS.COMMUNICATION.COMMUNITY.MODERATION.APPROVE(itemId),
      {},
      {
        errorMessage: "Failed to approve item",
        successMessage: "Item approved successfully",
      },
    )
  },

  /**
   * Reject a moderation item
   * @param {string} itemId - Moderation item ID
   * @param {Object} data - Rejection data (reason)
   * @returns {Promise<Object>} - Result
   */
  rejectModeration: (itemId, data) => {
    return apiClient.post(API_ENDPOINTS.COMMUNICATION.COMMUNITY.MODERATION.REJECT(itemId), data, {
      errorMessage: "Failed to reject item",
      successMessage: "Item rejected successfully",
    })
  },
}

export default communicationService
