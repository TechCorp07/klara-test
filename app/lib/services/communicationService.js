import api from "../apiClient"

// Communication API calls
export const communication = {
  // Conversations
  getConversations: async () => {
    const response = await api.get("/communication/conversations")
    return response.data
  },

  createConversation: async (conversationData) => {
    const response = await api.post("/communication/conversations", conversationData)
    return response.data
  },

  getConversation: async (id) => {
    const response = await api.get(`/communication/conversations/${id}`)
    return response.data
  },

  // Messages
  getMessages: async (conversationId) => {
    const params = conversationId ? { conversation: conversationId } : {}
    const response = await api.get("/communication/messages", { params })
    return response.data
  },

  sendMessage: async (messageData) => {
    const response = await api.post("/communication/messages", messageData)
    return response.data
  },

  // Notifications
  getNotifications: async () => {
    const response = await api.get("/communication/notifications")
    return response.data
  },

  markNotificationAsRead: async (notificationId) => {
    const response = await api.post(`/communication/notifications/${notificationId}/mark_read`)
    return response.data
  },

  // Real-time communication
  getWebSocketToken: async () => {
    const response = await api.get("/communication/websocket-token")
    return response.data
  },

  // Community
  getCommunityPosts: async (options = {}) => {
    const response = await api.get("/community/posts", { params: options })
    return response.data
  },

  createCommunityPost: async (postData) => {
    const response = await api.post("/community/posts", postData)
    return response.data
  },

  getCommunityComments: async (postId) => {
    const params = postId ? { post: postId } : {}
    const response = await api.get("/community/comments", { params })
    return response.data
  },

  createCommunityComment: async (commentData) => {
    const response = await api.post("/community/comments", commentData)
    return response.data
  },
}

export default communication
