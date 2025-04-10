import axios from "axios"
import { getAccessToken, refreshAccessToken, isTokenExpired, logout } from "./auth"

// Create axios instance
const api = axios.create({
  baseURL: "/api", // Use Next.js API routes
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  async (config) => {
    let token = getAccessToken()

    // If token exists but is expired, try to refresh it
    if (token && isTokenExpired(token)) {
      token = await refreshAccessToken()

      // If refresh failed, redirect to login
      if (!token) {
        logout()
        return Promise.reject(new Error("Authentication expired"))
      }
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 error and not already retrying
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const token = await refreshAccessToken()

        if (token) {
          // Update the authorization header
          originalRequest.headers["Authorization"] = `Bearer ${token}`
          // Retry the request
          return api(originalRequest)
        } else {
          // If refresh failed, logout
          logout()
          return Promise.reject(new Error("Authentication expired"))
        }
      } catch (refreshError) {
        // If refresh failed, logout
        logout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api
