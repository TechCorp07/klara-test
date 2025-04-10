import api from "../apiClient"

// Authentication API calls
export const auth = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials)
    return response.data
  },

  verify2FA: async (token, code) => {
    const response = await api.post("/auth/verify-2fa", { token, code })
    return response.data
  },

  register: async (userData) => {
    const response = await api.post("/users/users", userData)
    return response.data
  },

  logout: async () => {
    const response = await api.post("/auth/logout")
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me")
    return response.data.user
  },

  updateProfile: async (userData) => {
    const response = await api.patch("/users/me", userData)
    return response.data
  },

  setup2FA: async () => {
    const response = await api.post("/users/setup-2fa")
    return response.data
  },

  confirm2FA: async (code) => {
    const response = await api.post("/users/confirm-2fa", { code })
    return response.data
  },

  disable2FA: async (password) => {
    const response = await api.post("/users/disable-2fa", { password })
    return response.data
  },

  updateConsent: async (consentType, consented) => {
    const response = await api.post("/users/update-consent", {
      consent_type: consentType,
      consented,
    })
    return response.data
  },
}
