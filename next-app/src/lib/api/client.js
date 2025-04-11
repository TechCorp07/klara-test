// lib/api/client.js
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

// Constants
const TOKEN_REFRESH_MARGIN = 60_000; // 1 minute before expiry

// API base URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.klararety.com/api';

/**
 * Check if code is running on the client
 * @returns {boolean} Is client environment
 */
const isBrowser = () => typeof window !== 'undefined';

/**
 * Create axios instance with consistent config
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for auth
});

/**
 * Build URL parameters from an object
 * @param {Object} params - Parameters object
 * @returns {string} URL parameters string
 */
export const buildParams = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, value);
      }
    }
  });
  return searchParams.toString();
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} Is token expired or nearly expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    // Return true if token is expired or will expire in the next minute
    return exp * 1000 < Date.now() + TOKEN_REFRESH_MARGIN;
  } catch (err) {
    console.error('Token decode error', err);
    return true;
  }
};

/**
 * Refresh the access token
 * @returns {Promise<string|null>} New access token or null
 */
export const refreshAccessToken = async () => {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    });
    
    if (!res.ok) throw new Error('Refresh failed');
    
    const { access } = await res.json();
    return access;
  } catch (err) {
    console.error('Token refresh error:', err);
    return null;
  }
};

/**
 * Handle API errors consistently
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 * @param {boolean} showToast - Whether to show error toast
 * @returns {Object} Standardized error object
 */
export const handleApiError = (error, defaultMessage = 'An error occurred', showToast = true) => {
  // Default error structure
  const errorObject = {
    message: defaultMessage,
    status: 500,
    details: null,
    original: error
  };
  
  try {
    // Handle Axios errors
    if (error.response) {
      const { status, data } = error.response;
      errorObject.status = status;
      
      // Extract error message
      if (data) {
        errorObject.message = data.message || data.detail || defaultMessage;
        errorObject.details = data.details || data.errors || null;
      }
      
      // Handle specific status codes
      if (status === 401) {
        errorObject.message = 'Authentication required. Please log in.';
      } else if (status === 403) {
        errorObject.message = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        errorObject.message = 'The requested resource was not found.';
      } else if (status === 422) {
        errorObject.message = 'Validation error. Please check your input.';
      } else if (status >= 500) {
        errorObject.message = 'Server error. Please try again later.';
      }
    } else if (error.request) {
      // Request made but no response received
      errorObject.message = 'No response from server. Please check your connection.';
      errorObject.status = 0;
    }
    
    // Show toast notification if requested
    if (showToast) {
      toast.error(errorObject.message);
    }
    
    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('[API Error]:', error);
    }
    
    return errorObject;
  } catch (handlingError) {
    // In case error handling itself fails, return a safe error
    console.error('Error handling failure:', handlingError);
    
    if (showToast) {
      toast.error(defaultMessage);
    }
    
    return {
      message: defaultMessage,
      status: 500,
      details: null,
      original: error
    };
  }
};

// Add request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Token handling is done via HTTP-only cookies
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (isBrowser() && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?session=expired';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;