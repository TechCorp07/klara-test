"use client"

import { apiRequest } from "./client"

/**
 * Communication-related API endpoints
 */
const communicationApi = {
  /**
   * Send a message
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} - Sent message
   */
  sendMessage: async (messageData) => {
    return apiRequest("POST", "/communication/messages", messageData, {
      errorMessage: "Failed to send message",
    })
  },

  /**
   * Get messages
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - Messages
   */
  getMessages: async (filters = {}) => {
    const queryParams = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value)
      }
    })

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

    return apiRequest("GET", `/communication/messages${queryString}`, null, {
      errorMessage: "Failed to fetch messages",
    })
  },

  /**
   * Get message by ID
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} - Message
   */
  getMessageById: async (messageId) => {
    return apiRequest("GET", `/communication/messages/${messageId}`, null, {
      errorMessage: "Failed to fetch message",
    })
  },

  /**
   * Mark message as read
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} - Updated message
   */
  markMessageAsRead: async (messageId) => {
    return apiRequest("PUT", `/communication/messages/${messageId}/read`, null, {
      errorMessage: "Failed to mark message as read",
    })
  },

  /**
   * Delete message
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} - Delete result
   */
  deleteMessage: async (messageId) => {
    return apiRequest("DELETE", `/communication/messages/${messageId}`, null, {
      errorMessage: "Failed to delete message",
    })
  },

  /**
   * Get notifications
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - Notifications
   */
  getNotifications: async (filters = {}) => {
    const queryParams = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value)
      }
    })

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

    return apiRequest("GET", `/communication/notifications${queryString}`, null, {
      errorMessage: "Failed to fetch notifications",
    })
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} - Updated notification
   */
  markNotificationAsRead: async (notificationId) => {
    return apiRequest("PUT", `/communication/notifications/${notificationId}/read`, null, {
      errorMessage: "Failed to mark notification as read",
    })
  },

  /**
   * Update notification preferences
   * @param {Object} preferences - Notification preferences
   * @returns {Promise<Object>} - Updated preferences
   */
  updateNotificationPreferences: async (preferences) => {
    return apiRequest("PUT", "/communication/notification-preferences", preferences, {
      errorMessage: "Failed to update notification preferences",
    })
  },
}

export default communicationApi
