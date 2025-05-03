/**
 * API Client for connecting to the Klararety Healthcare Platform Django backend
 */
import { toast } from "react-toastify"

// Base URL for API requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.klararety.com/api"

// Default request timeout in milliseconds
const DEFAULT_TIMEOUT = 30000

/**
 * Create a fetch request with timeout
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} - Fetch promise with timeout
 */
const fetchWithTimeout = (url, options, timeout = DEFAULT_TIMEOUT) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), timeout)),
  ])
}

/**
 * Make an API request to the Django backend
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object|null} data - Request body data
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Response data
 */
export const apiRequest = async (method, endpoint, data = null, options = {}) => {
  const {
    params = {},
    headers = {},
    withAuth = true,
    timeout = DEFAULT_TIMEOUT,
    errorMessage = "An error occurred",
    successMessage = null,
  } = options

  // Build URL with query parameters
  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
  if (Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value)
      }
    })
    url += `?${queryParams.toString()}`
  }

  // Prepare headers
  const requestHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers,
  }

  // Add authorization header if required and token exists
  if (withAuth) {
    const token = localStorage.getItem("access_token")
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }
  }

  // Prepare request options
  const requestOptions = {
    method,
    headers: requestHeaders,
    credentials: "include",
  }

  // Add body for non-GET requests
  if (method !== "GET" && data) {
    requestOptions.body = JSON.stringify(data)
  }

  try {
    // Make the request with timeout
    const response = await fetchWithTimeout(url, requestOptions, timeout)

    // Handle HTTP errors
    if (!response.ok) {
      // Try to parse error response
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = { detail: response.statusText }
      }

      // Handle authentication errors
      if (response.status === 401) {
        // Attempt to refresh token or redirect to login
        if (endpoint !== "/token/refresh/") {
          // Try to refresh token
          try {
            const refreshed = await refreshAccessToken()
            if (refreshed) {
              // Retry the original request with new token
              return apiRequest(method, endpoint, data, options)
            }
          } catch (refreshError) {
            // If refresh fails, redirect to login
            window.location.href = "/auth/login?reason=session-expired"
          }
        }
      }

      // Show error toast if provided
      if (errorMessage) {
        const displayError = errorData.error?.message || errorData.detail || errorData.message || errorMessage
        toast.error(displayError)
      }

      throw new Error(errorData.error?.message || errorData.detail || errorData.message || "API request failed")
    }

    // Parse JSON response
    const contentType = response.headers.get("content-type")
    let responseData

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json()
    } else {
      responseData = await response.text()
    }

    // Show success toast if provided
    if (successMessage) {
      toast.success(successMessage)
    }

    return responseData
  } catch (error) {
    // Handle network errors
    if (errorMessage) {
      toast.error(error.message || errorMessage)
    }
    throw error
  }
}

/**
 * Refresh the access token using the refresh token
 * @returns {Promise<boolean>} - True if token was refreshed successfully
 */
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token")
  if (!refreshToken) return false

  try {
    const response = await apiRequest(
      "POST",
      "/token/refresh/",
      { refresh: refreshToken },
      {
        withAuth: false,
        errorMessage: null,
      },
    )

    if (response && response.access) {
      localStorage.setItem("access_token", response.access)
      return true
    }
    return false
  } catch (error) {
    console.error("Token refresh failed:", error)
    return false
  }
}

/**
 * API client with methods for common HTTP operations
 */
const apiClient = {
  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  get: (endpoint, options = {}) => {
    return apiRequest("GET", endpoint, null, options)
  },

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  post: (endpoint, data, options = {}) => {
    return apiRequest("POST", endpoint, data, options)
  },

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  put: (endpoint, data, options = {}) => {
    return apiRequest("PUT", endpoint, data, options)
  },

  /**
   * Make a PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  patch: (endpoint, data, options = {}) => {
    return apiRequest("PATCH", endpoint, data, options)
  },

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  delete: (endpoint, options = {}) => {
    return apiRequest("DELETE", endpoint, null, options)
  },

  /**
   * Refresh the access token
   * @returns {Promise<boolean>} - True if token was refreshed successfully
   */
  refreshToken: refreshAccessToken,
}

export default apiClient
