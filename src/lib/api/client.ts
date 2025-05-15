// src/lib/api/client.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from '@/lib/config';

/**
 * Creates an Axios instance configured for the Klararety API
 * with appropriate interceptors for authentication and error handling.
 * 
 * The interceptors handle:
 * 1. Token refreshing when access token expires
 * 2. Adding appropriate headers to requests
 * 3. Centralizing error handling
 */

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Create Axios client with default configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Important for sending cookies with requests
});

// Request interceptor to add headers or handle pre-request logic
apiClient.interceptors.request.use(
  (config) => {
    // You can add request timestamps, logging, or other pre-request logic here
    
    // Note: We don't need to manually add the auth token here since it's
    // being sent as an HttpOnly cookie automatically with withCredentials: true
    
    // Add additional security headers for HIPAA compliance
    config.headers['X-Requested-With'] = 'XMLHttpRequest'; // Helps prevent CSRF
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle expired tokens and other response logic
apiClient.interceptors.response.use(
  // For successful responses, just return the response
  (response) => response,

  // For error responses, handle token refresh if needed
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    // If there's no config or we've already tried to refresh, reject
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Check if error is due to expired token (401 Unauthorized)
    if (error.response?.status === 401) {
      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        // The refresh token is automatically sent in the cookies due to withCredentials: true
        await axios.post(`${config.apiBaseUrl}/token/refresh/`, {}, {
          withCredentials: true
        });
        
        // Retry the original request with the new token
        // The new token is now in the cookies
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If token refresh fails (e.g., refresh token also expired),
        // redirect to login and clear authentication state
        
        // Clear cookies via the logout API route
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
          });
        } catch (logoutError) {
          console.error('Error during logout after token refresh failure:', logoutError);
        }
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          // Save the current URL to redirect back after login
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other types of errors (400, 403, 404, 500, etc.)
    if (error.response?.status === 403) {
      // For forbidden errors, check if it's due to email verification or approval
      const responseData = error.response?.data;
      
      if (typeof responseData == 'object' && responseData !== null) {
        const dataObj = responseData as Record<string, unknown>;
        
        if (dataObj.email_verification_required) {
        if (typeof window !== 'undefined') {
          window.location.href = '/verify-email';
        }
      } else if (dataObj.awaiting_approval) {
        // Redirect to approval pending page
        if (typeof window !== 'undefined') {
          window.location.href = '/approval-pending';
        }
      }
    }
  }
    
    // For server errors, log them for monitoring
    if (error.response?.status && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
      // In production, you might want to send this to an error monitoring service
    }
    
    // For HIPAA compliance, don't expose sensitive details in errors
    // Sanitize error messages before returning them
    if (error.response?.data) {
      // Ensure we're not leaking PHI in error messages
      const sanitizedError = { ...error };
      
      // If in development, keep full error details
      if (!config.isProduction) {
        return Promise.reject(sanitizedError);
      }
      
      // In production, sanitize error details
      const responseData = sanitizedError.response?.data;
      if (typeof responseData === 'object' && responseData !== null) {
        const dataObj = responseData as Record<string, unknown>;

        const sensitiveFields = ['medical_records', 'diagnosis', 'treatment', 'health_data'];
        for (const field of sensitiveFields) {
          if (field in dataObj) {
            dataObj[field] = '[REDACTED]';
          }
        }
      }

      return Promise.reject(sanitizedError);
      }
    
    return Promise.reject(error);
  }
);

export default apiClient;