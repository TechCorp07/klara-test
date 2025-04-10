// lib/communication.js
import api from "./api"

// Communication API service for messaging, notifications, and other communication features
export const communication = {
  // Conversations
  getConversations: async () => {
    const response = await api.get("/communication/conversations/")
    return response.data
  },

  getConversation: async (conversationId) => {
    const response = await api.get(`/communication/conversations/${conversationId}/`)
    return response.data
  },

  createConversation: async (conversationData) => {
    const response = await api.post("/communication/conversations/", conversationData)
    return response.data
  },

  markConversationAsRead: async (conversationId) => {
    const response = await api.post(`/communication/conversations/${conversationId}/mark_read/`)
    return response.data
  },

  // Messages
  getMessages: async (conversationId) => {
    const response = await api.get(`/communication/conversations/${conversationId}/messages/`)
    return response.data
  },

  sendMessage: async (messageData) => {
    const response = await api.post("/communication/messages/", messageData)
    return response.data
  },

  // Notifications
  getNotifications: async (options = {}) => {
    const params = new URLSearchParams()
    if (options.limit) params.append("limit", options.limit)
    if (options.offset) params.append("offset", options.offset)
    if (options.unread_only) params.append("unread_only", "true")

    const response = await api.get(`/communication/notifications/?${params.toString()}`)
    return response.data
  },

  getUnreadNotifications: async () => {
    const response = await api.get("/communication/notifications/unread/")
    return response.data
  },

  markNotificationAsRead: async (notificationId) => {
    const response = await api.post(`/communication/notifications/${notificationId}/mark_read/`)
    return response.data
  },

  markAllNotificationsAsRead: async () => {
    const response = await api.post("/communication/notifications/mark_all_read/")
    return response.data
  },

  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/communication/notifications/${notificationId}/`)
    return response.data
  },

  // User search
  searchUsers: async (query) => {
    const response = await api.get(`/users/search/?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Notification settings
  getNotificationSettings: async () => {
    const response = await api.get("/communication/settings/")
    return response.data
  },

  updateNotificationSettings: async (settings) => {
    const response = await api.patch("/communication/settings/", settings)
    return response.data
  },

  // Communities/Forums
  getCommunityPosts: async (options = {}) => {
    const params = new URLSearchParams()
    if (options.group) params.append("group", options.group)
    if (options.category) params.append("category", options.category)
    if (options.tag) params.append("tag", options.tag)
    if (options.limit) params.append("limit", options.limit)
    if (options.offset) params.append("offset", options.offset)
    if (options.sort) params.append("sort", options.sort)

    const response = await api.get(`/community/posts/?${params.toString()}`)
    return response.data
  },

  getCommunityPost: async (postId) => {
    const response = await api.get(`/community/posts/${postId}/`)
    return response.data
  },

  createCommunityPost: async (postData) => {
    const response = await api.post("/community/posts/", postData)
    return response.data
  },

  updateCommunityPost: async (postId, postData) => {
    const response = await api.patch(`/community/posts/${postId}/`, postData)
    return response.data
  },

  deleteCommunityPost: async (postId) => {
    const response = await api.delete(`/community/posts/${postId}/`)
    return response.data
  },

  // Comments
  getComments: async (postId) => {
    const response = await api.get(`/community/posts/${postId}/comments/`)
    return response.data
  },

  createComment: async (commentData) => {
    const response = await api.post("/community/comments/", commentData)
    return response.data
  },

  // Community groups
  getCommunityGroups: async () => {
    const response = await api.get("/community/groups/")
    return response.data
  },

  joinCommunityGroup: async (groupId) => {
    const response = await api.post(`/community/groups/${groupId}/join/`)
    return response.data
  },

  leaveCommunityGroup: async (groupId) => {
    const response = await api.post(`/community/groups/${groupId}/leave/`)
    return response.data
  },

  // Community events
  getCommunityEvents: async (options = {}) => {
    const params = new URLSearchParams()
    if (options.group) params.append("group", options.group)
    if (options.start_date) params.append("start_date", options.start_date)
    if (options.end_date) params.append("end_date", options.end_date)

    const response = await api.get(`/community/events/?${params.toString()}`)
    return response.data
  },

  // RSVP to community event
  respondToEvent: async (eventId, status) => {
    const response = await api.post(`/community/events/${eventId}/rsvp/`, { status })
    return response.data
  },

  // Community resources
  getCommunityResources: async (options = {}) => {
    const params = new URLSearchParams()
    if (options.category) params.append("category", options.category)
    if (options.format) params.append("format", options.format)

    const response = await api.get(`/community/resources/?${params.toString()}`)
    return response.data
  },
}

export default communication
