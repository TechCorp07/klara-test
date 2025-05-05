"use client";

/**
 * API client for making requests to the backend
 */

/**
 * Get the appropriate API base URL based on the current environment
 * @returns {string} The base URL for API requests
 */
export const getApiBaseUrl = () => {
  // Check if we're in the browser environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    }
    
    // Production environment - main domain
    if (hostname === 'klararety.com' || hostname.includes('klararety.com')) {
      return 'https://api.klararety.com/api';
    }
  }
  
  // Default or server-side rendering
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.klararety.com/api';
};

/**
 * Make an API request
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request data (for POST, PUT)
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response data
 */
export const apiRequest = async (method, endpoint, data = null, options = {}) => {
  const { errorMessage = 'Request failed', successMessage = '' } = options;
  
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Add CORS headers for cross-domain requests
    'Origin': typeof window !== 'undefined' ? window.location.origin : 'https://klararety.com',
  };
  
  // Add auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method,
    headers,
    credentials: 'include',
    mode: 'cors', // Explicitly set CORS mode
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

/**
 * Create an API service with predefined endpoints
 * @param {string} baseEndpoint - Base endpoint for the service
 * @returns {Object} API service object with CRUD methods
 */
export const createApiService = (baseEndpoint) => {
  return {
    getAll: (params = {}) => 
      apiRequest('GET', baseEndpoint, null, { 
        params,
        errorMessage: `Failed to fetch ${baseEndpoint} data` 
      }),
    
    getById: (id, params = {}) => 
      apiRequest('GET', `${baseEndpoint}/${id}`, null, { 
        params,
        errorMessage: `Failed to fetch ${baseEndpoint} item` 
      }),
    
    create: (data) => 
      apiRequest('POST', baseEndpoint, data, {
        errorMessage: `Failed to create ${baseEndpoint} item`,
        successMessage: 'Item created successfully'
      }),
    
    update: (id, data) => 
      apiRequest('PUT', `${baseEndpoint}/${id}`, data, {
        errorMessage: `Failed to update ${baseEndpoint} item`,
        successMessage: 'Item updated successfully'
      }),
    
    delete: (id) => 
      apiRequest('DELETE', `${baseEndpoint}/${id}`, null, {
        errorMessage: `Failed to delete ${baseEndpoint} item`,
        successMessage: 'Item deleted successfully'
      })
  };
};

/**
 * Pre-configured API client instance
 */
export const apiClient = {
  request: apiRequest,
  getBaseUrl: getApiBaseUrl,
  createService: createApiService,
  
  // Common API endpoints
  users: createApiService('/users'),
  patients: createApiService('/patients'),
  providers: createApiService('/providers'),
  appointments: createApiService('/appointments'),
  medications: createApiService('/medications'),
  wearables: createApiService('/wearables')
};
