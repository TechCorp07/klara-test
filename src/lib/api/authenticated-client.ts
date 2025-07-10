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
    
    // Create a unique key for this request (method + URL)
    const requestKey = `${options.method || 'GET'}:${fullUrl}`;
    
    // If same request is already pending, return the existing promise
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }
    
    // Configure request with proper headers and credentials
    const requestOptions: RequestInit = {
      ...options,
      credentials: 'include', // Ensure cookies are sent
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection
        'Cache-Control': 'no-cache, no-store, must-revalidate', // HIPAA compliance
        'Pragma': 'no-cache',
        ...options.headers,
      }
    };
    
    // Create the request promise
    const requestPromise = fetch(fullUrl, requestOptions)
      .then(async (response) => {
        // Handle non-200 responses
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}`);
          (error as any).response = response;
          
          // Try to get error details from response
          try {
            const errorData = await response.json();
            (error as any).data = errorData;
          } catch {
            // If response is not JSON, ignore
          }
          
          throw error;
        }
        
        // Return JSON if response has content
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json();
        }
        
        return response;
      })
      .finally(() => {
        // Clean up when request completes (success or failure)
        this.pendingRequests.delete(requestKey);
      });
    
    // Store the promise to prevent duplicates
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

  // Clear all pending requests (useful for logout)
  clearPendingRequests() {
    this.pendingRequests.clear();
  }
}

// Export a singleton instance
export const authenticatedClient = new AuthenticatedAPIClient();
export default AuthenticatedAPIClient;