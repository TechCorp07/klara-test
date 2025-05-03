// lib/services/communicationService.js
// Service wrapper for communication API
// Updated based on API documentation analysis

import { apiRequest } from "@/api/client"
import { API_ENDPOINTS } from "@/lib/config"

/**
 * Communication service that provides access to community and messaging-related API functions
 */
export const communicationService = {
  // --- Community Forums/Threads/Posts --- //

  /**
   * Get community forums (Assuming a forum structure exists)
   * Aligned with GET /communication/community/forums
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated forums
   */
  getForums: (params = {}) =>
    apiRequest("GET", API_ENDPOINTS.COMMUNICATION.COMMUNITY.FORUMS, null, {
      params,
      errorMessage: "Failed to fetch community forums",
    }),

  /**
   * Get forum by ID
   * Aligned with GET /communication/community/forums/{forum_id}
   * @param {string} forumId - Forum ID
   * @returns {Promise<Object>} Forum details
   */
  getForumById: (forumId) =>
    apiRequest("GET", API_ENDPOINTS.COMMUNICATION.COMMUNITY.FORUM(forumId), null, {
      errorMessage: "Failed to fetch forum details",
    }),

  /**
   * Get community threads (Mapped from getTopics)
   * Aligned with GET /communication/community/threads
   * @param {Object} params - Query parameters (e.g., forum_id)
   * @returns {Promise<Object>} Paginated threads
   */
  getThreads: (params = {}) =>
    apiRequest("GET", API_ENDPOINTS.COMMUNICATION.COMMUNITY.THREADS, null, {
      params,
      errorMessage: "Failed to fetch community threads",
    }),

  /**
   * Get thread by ID (Mapped from getTopic)
   * Aligned with GET /communication/community/threads/{thread_id}
   * @param {string} threadId - Thread ID
   * @returns {Promise<Object>} Thread details
   */
  getThreadById: (threadId) =>
    apiRequest("GET", API_ENDPOINTS.COMMUNICATION.COMMUNITY.THREAD(threadId), null, {
      errorMessage: "Failed to fetch thread details",
    }),

  /**
   * Create a new thread (Mapped from createTopic)
   * Aligned with POST /communication/community/threads
   * @param {Object} threadData - Thread data (should include forum_id)
   * @returns {Promise<Object>} Created thread
   */
  createThread: (threadData) =>
    apiRequest("POST", API_ENDPOINTS.COMMUNICATION.COMMUNITY.THREADS, threadData, {
      errorMessage: "Failed to create thread",
      successMessage: "Thread created successfully",
    }),

  /**
   * Get posts for a thread (Mapped from getPosts)
   * Aligned with GET /communication/community/threads/{thread_id}/posts
   * @param {string} threadId - Thread ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated posts
   */
  getPosts: (threadId, params = {}) =>
    apiRequest("GET", API_ENDPOINTS.COMMUNICATION.COMMUNITY.POSTS(threadId), null, {
      params,
      errorMessage: "Failed to fetch posts",
    }),

  /**
   * Create a new post in a thread (Mapped from createPost)
   * Aligned with POST /communication/community/threads/{thread_id}/posts
   * @param {string} threadId - Thread ID
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Created post
   */
  createPost: (threadId, postData) =>
    apiRequest("POST", API_ENDPOINTS.COMMUNICATION.COMMUNITY.POSTS(threadId), postData, {
      errorMessage: "Failed to create post",
      successMessage: "Post created successfully",
    }),

  /**
   * Get a specific post by ID
   * Aligned with GET /communication/community/posts/{post_id}
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} Post details
   */
  getPostById: (postId) =>
    apiRequest("GET", API_ENDPOINTS.COMMUNICATION.COMMUNITY.POST(postId), null, {
      errorMessage: "Failed to fetch post details",
    }),

  /**
   * Update a post
   * Aligned with PUT /communication/community/posts/{post_id}
   * @param {string} postId - Post ID
   * @param {Object} postData - Updated post data
   * @returns {Promise<Object>} Updated post
   */
  updatePost: (postId, postData) =>
    apiRequest("PUT", API_ENDPOINTS.COMMUNICATION.COMMUNITY.POST(postId), postData, {
      errorMessage: "Failed to update post",
      successMessage: "Post updated successfully",
    }),

  /**
   * Delete a post
   * Aligned with DELETE /communication/community/posts/{post_id}
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} Deletion result
   */
  deletePost: (postId) =>
    apiRequest("DELETE", API_ENDPOINTS.COMMUNICATION.COMMUNITY.POST(postId), null, {
      errorMessage: "Failed to delete post",
      successMessage: "Post deleted successfully",
    }),

  // --- Community Moderation --- //

  /**
   * Get moderation queue (Mapped from getModerationQueue)
   * Aligned with GET /communication/community/moderation/queue
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated moderation items
   */
  getModerationQueue: (params = {}) =>
    apiRequest("GET", API_ENDPOINTS.COMMUNICATION.COMMUNITY.MODERATION.QUEUE, null, {
      params,
      errorMessage: "Failed to fetch moderation queue",
    }),

  /**
   * Approve moderation item (Mapped from approveModeration)
   * Aligned with POST /communication/community/moderation/items/{item_id}/approve
   * @param {string} itemId - Moderation item ID
   * @returns {Promise<Object>} Approval response
   */
  approveModerationItem: (itemId) =>
    apiRequest("POST", API_ENDPOINTS.COMMUNICATION.COMMUNITY.MODERATION.APPROVE(itemId), null, {
      errorMessage: "Failed to approve item",
      successMessage: "Item approved successfully",
    }),

  /**
   * Reject moderation item (Mapped from rejectModeration)
   * Aligned with POST /communication/community/moderation/items/{item_id}/reject
   * @param {string} itemId - Moderation item ID
   * @param {Object} rejectionData - Rejection data with reason
   * @returns {Promise<Object>} Rejection response
   */
  rejectModerationItem: (itemId, rejectionData) =>
    apiRequest("POST", API_ENDPOINTS.COMMUNICATION.COMMUNITY.MODERATION.REJECT(itemId), rejectionData, {
      errorMessage: "Failed to reject item",
      successMessage: "Item rejected successfully",
    }),

  // --- Direct Messaging & Conversations --- //

  /**
   * Get conversations for the current user
   * Aligned with GET /communication/conversations
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated conversations
   */
  getConversations: (params = {}) =>
    apiRequest("GET", API_ENDPOINTS.COMMUNICATION.CONVERSATIONS.BASE, null, {
      params,
      errorMessage: "Failed to fetch conversations",
    }),

  /**
   * Get conversation by ID (Mapped from getConversation)
   * Aligned with GET /communication/conversations/{conversation_id}
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} Conversation details
   */
  getConversationById: (conversationId) =>
    apiRequest("GET", API_ENDPOINTS.COMMUNICATION.CONVERSATIONS.CONVERSATION(conversationId), null, {
      errorMessage: "Failed to fetch conversation",
    }),

  /**
   * Create a new conversation
   * Aligned with POST /communication/conversations
   * @param {Object} conversationData - Conversation data (e.g., participants)
   * @returns {Promise<Object>} Created conversation
   */
  createConversation: (conversationData) =>
    apiRequest("POST", API_ENDPOINTS.COMMUNICATION.CONVERSATIONS.BASE, conversationData, {
      errorMessage: "Failed to create conversation",
      successMessage: "Conversation created successfully",
    }),

  /**
   * Get messages for a specific conversation
   * Aligned with GET /communication/conversations/{conversation_id}/messages
   * @param {string} conversationId - Conversation ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated messages
   */
  getConversationMessages: (conversationId, params = {}) =>
    apiRequest("GET", API_ENDPOINTS.COMMUNICATION.CONVERSATIONS.MESSAGES(conversationId), null, {
      params,
      errorMessage: "Failed to fetch conversation messages",
    }),

  /**
   * Send a message within a conversation
   * Aligned with POST /communication/conversations/{conversation_id}/messages
   * @param {string} conversationId - Conversation ID
   * @param {Object} messageData - Message data (content, etc.)
   * @returns {Promise<Object>} Sent message
   */
  sendMessageInConversation: (conversationId, messageData) =>
    apiRequest("POST", API_ENDPOINTS.COMMUNICATION.CONVERSATIONS.MESSAGES(conversationId), messageData, {
      errorMessage: "Failed to send message",
      successMessage: "Message sent successfully",
    }),

  /**
   * Get a specific message by ID
   * Aligned with GET /communication/messages/{message_id}
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Message details
   */
  getMessageById: (messageId) =>
    apiRequest("GET", API_ENDPOINTS.COMMUNICATION.MESSAGES.MESSAGE(messageId), null, {
      errorMessage: "Failed to fetch message details",
    }),

  /**
   * Update a message
   * Aligned with PUT /communication/messages/{message_id}
   * @param {string} messageId - Message ID
   * @param {Object} messageData - Updated message data
   * @returns {Promise<Object>} Updated message
   */
  updateMessage: (messageId, messageData) =>
    apiRequest("PUT", API_ENDPOINTS.COMMUNICATION.MESSAGES.MESSAGE(messageId), messageData, {
      errorMessage: "Failed to update message",
      successMessage: "Message updated successfully",
    }),

  /**
   * Delete a message
   * Aligned with DELETE /communication/messages/{message_id}
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Deletion result
   */
  deleteMessage: (messageId) =>
    apiRequest("DELETE", API_ENDPOINTS.COMMUNICATION.MESSAGES.MESSAGE(messageId), null, {
      errorMessage: "Failed to delete message",
      successMessage: "Message deleted successfully",
    }),

  // NOTE: The original `getMessages` and `sendMessage` might have been intended for a different flow.
  // The updated structure assumes messages are primarily managed within conversations.
  // If a general message list or sending outside conversations is needed, the backend API needs clarification.
}

export default communicationService
