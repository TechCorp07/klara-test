// src/lib/api/authenticated-client.ts
import { config } from '@/lib/config';

/**
 * Authenticated API Client with request deduplication and proper cookie handling
 * 
 * This client prevents duplicate simultaneous requests and ensures cookies
 * are properly sent with each request to avoid authentication race conditions.
 */
class AuthenticatedAPIClient {
  private pendingRequests = new Map<string, Promise<any>>();
  private baseUrl: string;

  constructor(baseUrl: string = config.apiBaseUrl) {
    this.baseUrl = baseUrl;
  }
  
  async request(url: string, options: RequestInit = {}) {
    // Create full URL if relative path is provided
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    // Check if same request is already pending
    const requestKey = `${options.method || 'GET'}:${fullUrl}`;
    
    if (this.pendingRequests.has(requestKey)) {
      console.log(`🔄 Request already pending, returning existing promise: ${requestKey}`);
      return this.pendingRequests.get(requestKey);
    }
    
    // Make the request with proper configuration
    const requestPromise = fetch(fullUrl, {
      ...options,
      credentials: 'include', // Ensure cookies are sent
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    }).then(async (response) => {
      // Handle the response
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        (error as any).response = response;
        throw error;
      }
      
      // Return JSON if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      return response;
    }).finally(() => {
      // Clean up when request completes
      this.pendingRequests.delete(requestKey);
    });
    
    this.pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  }

  // Convenience methods for common HTTP operations
  async get(url: string, options: RequestInit = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url: string, data?: any, options: RequestInit = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(url: string, data?: any, options: RequestInit = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(url: string, options: RequestInit = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// Export a singleton instance
export const authenticatedClient = new AuthenticatedAPIClient();
export default AuthenticatedAPIClient;