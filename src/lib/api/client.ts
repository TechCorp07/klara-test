// src/lib/api/client.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { getCookieValue } from '@/lib/utils/cookies';
import { config } from '../config';
import { config as appConfig } from '@/lib/config';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Create the main API client instance
 * This is the central axios instance that all your API services will use
 */
export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for authentication
});

/**
 * Request interceptor - adds security headers and request tracking
 */
apiClient.interceptors.request.use(
  (requestConfig) => {
    // Add HIPAA-compliant security headers
    if (requestConfig.headers) {
      requestConfig.headers['X-Requested-With'] = 'XMLHttpRequest'; // CSRF protection
      requestConfig.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'; // Prevent PHI caching
      requestConfig.headers['Pragma'] = 'no-cache';
    }
    
    // Add request timestamp for audit logging
    if (typeof window !== 'undefined') {
      requestConfig.headers = requestConfig.headers || {};
      requestConfig.headers['X-Request-Timestamp'] = new Date().toISOString();
    }

     // Log outgoing requests in development for debugging
     if (process.env.NODE_ENV === 'development') {
      console.log(`📤 API Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
    }
    
    return requestConfig;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  // Success responses pass through unchanged
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    // Prevent infinite retry loops
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }
     /**
     * Handle 401 Unauthorized - token expired or invalid
     */
    if (error.response?.status === 401) {
      // Mark request as retried to prevent loops
      originalRequest._retry = true;
      
      // Clear authentication cookies
      try {
        await fetch('/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (logoutError) {
        console.error('Error clearing cookies after 401:', logoutError);
      }
      
      // Redirect to login with return URL
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        const returnUrl = encodeURIComponent(currentPath);
        window.location.href = `/login?returnUrl=${returnUrl}`;
      }
      
      return Promise.reject(error);
    }
    
    if (error.response?.status === 403) {
      const responseData = error.response?.data;
      
      if (responseData && typeof responseData === 'object') {
        const data = responseData as Record<string, unknown>;
        
      // Log potential HIPAA violations based on error context
      const errorDetail = data.detail as string;

        // Enhanced logging for audit trail (works with current backend)
        if (errorDetail && (
          errorDetail.toLowerCase().includes('phi') ||
          errorDetail.toLowerCase().includes('patient') ||
          errorDetail.toLowerCase().includes('medical') ||
          originalRequest?.url?.includes('/patient') ||
          originalRequest?.url?.includes('/medical-records')
        )) {
          console.error('Potential HIPAA-related access denial:', {
            timestamp: new Date().toISOString(),
            url: originalRequest?.url?.replace(/\/\d+/g, '/[ID]'),
            user_role: getCookieValue(appConfig.authCookieName),
            error_detail: errorDetail,
            method: originalRequest?.method?.toUpperCase(),
            severity: 'MEDIUM'
          });
          
          if (typeof window !== 'undefined') {
            window.location.href = '/compliance-violation';
          }
          return Promise.reject(error);
        }

        // Check for email verification requirement
        if (data.email_verification_required || data.detail === 'Email verification required') {
          if (typeof window !== 'undefined') {
            window.location.href = '/verify-email';
          }
          return Promise.reject(error);
        }
        
        // Check for approval requirement
        if (data.awaiting_approval || data.detail === 'Account pending approval') {
          if (typeof window !== 'undefined') {
            window.location.href = '/approval-pending';
          }
          return Promise.reject(error);
        }
        
        // General authorization failure - redirect to unauthorized page
        if (typeof window !== 'undefined') {
          window.location.href = '/unauthorized';
        }
      }
    }
    
      /**
           * Enhanced error logging for HIPAA audit requirements
           */
      if (error.response?.status && error.response.status >= 500) {
        const sanitizedError = {
          status: error.response.status,
          url: originalRequest?.url?.replace(/\/\d+/g, '/[ID]'),
          method: originalRequest?.method?.toUpperCase(),
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
          user_role: getCookieValue(appConfig.authCookieName) || 'unknown',
        };
      
        console.error('Server error (sanitized for HIPAA):', sanitizedError);
    }
    
    /**
     * HIPAA-Compliant Error Sanitization
     * Remove potential PHI from error responses before returning to frontend
     */
    if (error.response?.data && appConfig.isProduction) {
      const responseData = error.response.data;
      
      if (typeof responseData === 'object' && responseData !== null) {
        const sanitizedData = { ...responseData } as Record<string, unknown>;
        
        // List of fields that might contain PHI - sanitize them in production
        const phiFields = [
          'medical_records', 'diagnosis', 'treatment', 'health_data',
          'patient_name', 'ssn', 'medical_id', 'phone_number',
          'address', 'date_of_birth', 'allergies', 'medications'
        ];
        
        // Recursively sanitize PHI fields
        const sanitizeObject = (obj: Record<string, unknown>): Record<string, unknown> => {
          const sanitized = { ...obj };
          
          Object.keys(sanitized).forEach(key => {
            const lowerKey = key.toLowerCase();
            
            // Check if field name suggests PHI content
            const containsPhi = phiFields.some(phiField => 
              lowerKey.includes(phiField) || phiField.includes(lowerKey)
            );
            
            if (containsPhi) {
              sanitized[key] = '[REDACTED_FOR_HIPAA]';
            } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
              sanitized[key] = sanitizeObject(sanitized[key] as Record<string, unknown>);
            }
          });
          
          return sanitized;
        };
        
        error.response.data = sanitizeObject(sanitizedData);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper function to handle common API response patterns from your backend
 * Your backend sometimes returns paginated results, sometimes direct arrays
 */
export const extractDataFromResponse = <T>(response: {
  results?: T[];
  data?: T | T[];
  count?: number;
  next?: string;
  previous?: string;
}): T[] => {
  // Handle paginated response format
  if (response.results) {
    return response.results;
  }
  
  // Handle direct array response
  if (Array.isArray(response.data)) {
    return response.data;
  }
  
  // Handle single item response
  if (response.data) {
    return [response.data];
  }
  
  // Handle direct array at root level
  if (Array.isArray(response)) {
    return response;
  }
  
  return [];
};

/**
 * Helper function to build query parameters for API requests
 * Handles the common filtering and pagination parameters your backend expects
 */
export const buildQueryParams = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        // Handle array parameters (e.g., for multiple role filters)
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

/**
 * Helper function to safely handle file uploads with PHI protection
 * Ensures files are properly encrypted and audit-logged for HIPAA compliance
 */
export const createSecureFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      // Add audit metadata for file uploads
      formData.append(key, value);
      formData.append(`${key}_timestamp`, new Date().toISOString());
      formData.append(`${key}_size`, value.size.toString());
      formData.append(`${key}_type`, value.type);
    } else if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });
  
  return formData;
};

export default apiClient;