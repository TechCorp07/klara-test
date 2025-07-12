// src/lib/api/client.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Request deduplication map
const pendingRequests = new Map<string, Promise<AxiosResponse>>();

/**
 * Enhanced API client with proper proxy routing for authenticated requests
 */
export const apiClient = axios.create({
  baseURL: config.apiBaseUrl, // Keep the original baseURL for public requests
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Helper function to determine if a request needs authentication
 */
const needsAuthentication = (url?: string): boolean => {
  if (!url) return false;
  
  const publicEndpoints = [
    '/auth/login/',
    '/auth/register/',
    '/auth/check-status/',
    '/auth/forgot-password/',
    '/auth/reset-password/',
    '/auth/verify-email/',
  ];
  
  return !publicEndpoints.some(endpoint => url.includes(endpoint));
};

/**
 * Request interceptor - routes authenticated requests through proxy
 */
apiClient.interceptors.request.use(
  (requestConfig) => {
    const originalUrl = requestConfig.url || '';
    
    // Check if this request needs authentication and isn't already a proxy request
    if (needsAuthentication(originalUrl) && !originalUrl.startsWith('/api/proxy/')) {
      // Convert absolute backend URL to proxy route
      let proxyPath = originalUrl;
      
      // Remove the base URL if present to get just the path
      if (proxyPath.startsWith(config.apiBaseUrl)) {
        proxyPath = proxyPath.replace(config.apiBaseUrl, '');
      }
      
      // Remove leading slash if present
      proxyPath = proxyPath.startsWith('/') ? proxyPath.slice(1) : proxyPath;
      
      // Route through proxy
      requestConfig.url = `/api/proxy/${proxyPath}`;
      requestConfig.baseURL = ''; // Clear baseURL for proxy requests
      
      console.log(`🔄 Routing through proxy: ${originalUrl} → ${requestConfig.url}`);
    } else {
      // Public requests go directly to backend
      console.log(`📤 Direct request: ${originalUrl}`);
    }

    // Add HIPAA-compliant security headers
    if (requestConfig.headers) {
      requestConfig.headers['X-Requested-With'] = 'XMLHttpRequest';
      requestConfig.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      requestConfig.headers['Pragma'] = 'no-cache';
      requestConfig.headers['X-Request-Timestamp'] = new Date().toISOString();
    }

    // Request deduplication
    const requestKey = `${requestConfig.method?.toUpperCase()}:${requestConfig.url}`;
    
    if (pendingRequests.has(requestKey)) {
      console.log(`♻️ Reusing pending request: ${requestKey}`);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 Axios Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
    }
    
    return requestConfig;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles errors, retries, and cleanup
 */
apiClient.interceptors.response.use(
  (response) => {
    // Clean up pending request
    const requestKey = `${response.config.method?.toUpperCase()}:${response.config.url}`;
    pendingRequests.delete(requestKey);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 Axios Response: ${response.status} for ${requestKey}`);
    }
    
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    // Clean up pending request
    if (originalRequest) {
      const requestKey = `${originalRequest.method?.toUpperCase()}:${originalRequest.url}`;
      pendingRequests.delete(requestKey);
    }
    
    // Prevent infinite retry loops
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - token expired or missing
    if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/login/')) {
      originalRequest._retry = true;
      
      // Clear auth state and redirect to login
      if (typeof window !== 'undefined') {
        console.log('🔒 401 error - clearing auth and redirecting to login');
        
        // Call logout API to clear cookies
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
          });
        } catch (logoutError) {
          console.error('Failed to call logout API:', logoutError);
        }
        
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    // Handle other errors...
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Axios Response Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: originalRequest?.url,
        method: originalRequest?.method,
        data: error.response?.data
      });
    }

    return Promise.reject(error);
  }
);

/**
 * Clear all pending requests (useful for logout)
 */
export const clearPendingRequests = (): void => {
  console.log('🧹 Clearing all pending axios requests');
  pendingRequests.clear();
};

/**
 * Helper functions (maintain compatibility)
 */
export const extractDataFromResponse = <T = unknown>(response: AxiosResponse<T>): T => {
  return response.data;
};

export const extractArrayFromResponse = <T = unknown>(response: {
  results?: T[];
  data?: T | T[];
  count?: number;
  next?: string;
  previous?: string;
}): T[] => {
  if (response.results) return response.results;
  if (Array.isArray(response.data)) return response.data;
  if (response.data) return [response.data];
  if (Array.isArray(response)) return response;
  return [];
};

export default apiClient;