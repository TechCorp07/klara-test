// lib/api/client.js
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../env';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Enable cookies for all requests
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // No need to manually set tokens as we're using HttpOnly cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Attempt to refresh token
      try {
        originalRequest._retry = true;
        
        // Call the refresh token endpoint
        await fetch('/api/auth/refresh', { 
          method: 'POST',
          credentials: 'same-origin'
        });
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?session=expired';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      toast.error('A server error occurred. Please try again later.');
    }
    
    // Handle validation errors
    if (error.response?.data) {
      const { message, details } = error.response.data;
      
      if (details && typeof details === 'object') {
        const formattedErrors = Object.entries(details)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        
        toast.error(`${message || 'Validation error'}: ${formattedErrors}`);
      } else if (message) {
        toast.error(message);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper methods
export const buildParams = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

// Export API client and utilities
export { apiClient, buildParams };
export default apiClient;
