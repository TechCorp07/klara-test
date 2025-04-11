// lib/api/client.js
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import * as Sentry from '@sentry/nextjs';

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
        searchParams.append(key, value.toString());
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
 * Format validation errors into a readable form
 * @param {Object} errors - Validation errors object
 * @returns {string} Formatted error string
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return '';
  }
  
  return Object.entries(errors)
    .map(([field, messages]) => {
      const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      const formattedMessages = Array.isArray(messages) ? messages.join(', ') : messages;
      return `${fieldName}: ${formattedMessages}`;
    })
    .join('; ');
};

/**
 * Handle API errors consistently with Sentry tracking
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 * @param {boolean} showToast - Whether to show error toast
 * @param {Object} additionalContext - Additional context for error tracking
 * @returns {Object} Standardized error object
 */
export const handleApiError = (error, defaultMessage = 'An error occurred', showToast = true, additionalContext = {}) => {
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
      const { status, data, config } = error.response;
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
        
        // Format validation errors for display
        if (data.details && typeof data.details === 'object') {
          const formattedErrors = formatValidationErrors(data.details);
          if (formattedErrors) {
            errorObject.message = `${errorObject.message}: ${formattedErrors}`;
          }
        }
      } else if (status >= 500) {
        errorObject.message = 'Server error. Please try again later.';
      }
      
      // Track error in Sentry for non-401 errors (not auth issues)
      if (status !== 401 && status !== 403) {
        Sentry.withScope((scope) => {
          scope.setTag('api_request', 'true');
          scope.setTag('status_code', status);
          scope.setExtra('endpoint', config?.url || 'unknown');
          scope.setExtra('method', config?.method || 'unknown');
          scope.setExtra('response_data', data);
          
          // Add additional context if provided
          if (additionalContext) {
            Object.entries(additionalContext).forEach(([key, value]) => {
              scope.setExtra(key, value);
            });
          }
          
          Sentry.captureException(error);
        });
      }
    } else if (error.request) {
      // Request made but no response received
      errorObject.message = 'No response from server. Please check your connection.';
      errorObject.status = 0;
      
      // Track network error in Sentry
      Sentry.withScope((scope) => {
        scope.setTag('api_request', 'true');
        scope.setTag('error_type', 'network');
        
        // Add request details if available
        if (error.request) {
          scope.setExtra('request', {
            url: error.request.url || error.config?.url,
            method: error.config?.method
          });
        }
        
        // Add additional context if provided
        if (additionalContext) {
          Object.entries(additionalContext).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }
        
        Sentry.captureException(error);
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      // Track general error in Sentry
      Sentry.withScope((scope) => {
        scope.setTag('api_request', 'true');
        scope.setTag('error_type', 'setup');
        
        // Add additional context if provided
        if (additionalContext) {
          Object.entries(additionalContext).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }
        
        Sentry.captureException(error);
      });
    }
    
    // Show toast notification if requested
    if (showToast && isBrowser()) {
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
    
    // Track error handling failure in Sentry
    Sentry.withScope((scope) => {
      scope.setTag('error_handling_failure', 'true');
      Sentry.captureException(handlingError);
    });
    
    if (showToast && isBrowser()) {
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

/**
 * Make an API request with error handling and authentication
 * Works in both client and server components
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request data
 * @param {Object} options - Additional options
 * @returns {Promise<any>} Response data
 */
export const apiRequest = async (method, endpoint, data = null, options = {}) => {
  const { 
    headers = {}, 
    params = {}, 
    errorMessage = 'An error occurred',
    showErrorToast = true,
    withAuth = true,
    trackingContext = {}
  } = options;

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    const queryParams = buildParams(params);
    const requestUrl = queryParams ? `${url}?${queryParams}` : url;
    
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      credentials: withAuth ? 'include' : 'same-origin'
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(data);
    }
    
    const response = await fetch(requestUrl, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { 
        response: { 
          status: response.status, 
          data: errorData,
          config: {
            url: requestUrl,
            method: method,
            data: data
          }
        } 
      };
    }
    
    // Parse JSON if the response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return await response.json();
    }
    
    return {};
  } catch (error) {
    const errorObj = handleApiError(error, errorMessage, showErrorToast, {
      ...trackingContext,
      endpoint,
      method
    });
    throw errorObj;
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
    if (error.response?.status === 401 && !originalRequest._retry && isBrowser()) {
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

/**
 * Safe wrapper for apiClient that works in both client and server components
 */
export const createServerSafeApiClient = () => {
  const get = (endpoint, params = {}, options = {}) => 
    apiRequest('GET', endpoint, null, { params, ...options });

  const post = (endpoint, data = {}, options = {}) => 
    apiRequest('POST', endpoint, data, options);

  const put = (endpoint, data = {}, options = {}) => 
    apiRequest('PUT', endpoint, data, options);

  const patch = (endpoint, data = {}, options = {}) => 
    apiRequest('PATCH', endpoint, data, options);

  const del = (endpoint, options = {}) => 
    apiRequest('DELETE', endpoint, null, options);

  return {
    get,
    post,
    put,
    patch,
    delete: del
  };
};

// Create a server-safe API client
export const serverSafeApiClient = createServerSafeApiClient();

// Export convenience methods
export const get = (endpoint, params = {}, options = {}) => 
  apiRequest('GET', endpoint, null, { params, ...options });

export const post = (endpoint, data = {}, options = {}) => 
  apiRequest('POST', endpoint, data, options);

export const put = (endpoint, data = {}, options = {}) => 
  apiRequest('PUT', endpoint, data, options);

export const patch = (endpoint, data = {}, options = {}) => 
  apiRequest('PATCH', endpoint, data, options);

export const del = (endpoint, options = {}) => 
  apiRequest('DELETE', endpoint, null, options);

export { apiClient };
export default apiClient;