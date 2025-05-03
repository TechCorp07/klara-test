// api/index.js
// Export all API services

import auth from "./auth"
import healthcare from "./healthcare"
import telemedicine from "./telemedicine"
import audit from "./audit"
import token from "./token"
import ehr from "./ehr"

// Communication service for patient-provider messaging
export const Communication = {
  getMessages: (userId, options = {}) => {
    const { limit = 20, offset = 0, includeArchived = false } = options
    return fetch(
      `messages?userId=${userId}&limit=${limit}&offset=${offset}&includeArchived=${includeArchived}`,
    ).then((res) => res.json())
  },

  getMessageById: (messageId) => {
    return fetch(`messages/${messageId}`).then((res) => res.json())
  },

  sendMessage: (message) => {
    return fetch("messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    }).then((res) => res.json())
  },

  updateMessage: (messageId, updates) => {
    return fetch(`messages/${messageId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }).then((res) => res.json())
  },

  deleteMessage: (messageId) => {
    return fetch(`messages/${messageId}`, {
      method: "DELETE",
    }).then((res) => res.json())
  },

  markAsRead: (messageId) => {
    return fetch(`messages/${messageId}/read`, {
      method: "POST",
    }).then((res) => res.json())
  },

  archiveMessage: (messageId) => {
    return fetch(`messages/${messageId}/archive`, {
      method: "POST",
    }).then((res) => res.json())
  },

  getUnreadCount: (userId) => {
    return fetch(`messages/unread-count?userId=${userId}`).then((res) => res.json())
  },
}

export { auth, healthcare, telemedicine, audit, token, ehr }

export default {
  auth,
  healthcare,
  telemedicine,
  audit,
  token,
  ehr,
  Communication,
}
