// src/lib/api/authenticated-client.ts
import { config } from '@/lib/config';

/**
 * Authenticated API Client that uses the proxy route for authentication
 * 
 * This client routes requests through our Next.js proxy which handles
 * reading the HttpOnly cookie and adding the Authorization header
 */
class AuthenticatedAPIClient {
  private pendingRequests = new Map<string, Promise<any>>();
  private baseUrl: string;

  constructor() {
    // Use the proxy route instead of direct backend URL
    this.baseUrl = '/api/proxy';
  }
  
  async request(url: string, options: RequestInit = {}) {
    console.log(`🔐 Authenticated request to: ${url}`);
    
    // Clean up the URL - remove leading slash if present
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    
    // Remove the API prefix if it exists (since proxy adds it)
    const proxyUrl = cleanUrl.replace(/^api\//, '');
    
    // Create full URL
    const fullUrl = `${this.baseUrl}/${proxyUrl}`;
    
    // Create a unique key for this request (method + URL)
    const requestKey = `${options.method || 'GET'}:${fullUrl}`;
    
    // If same request is already pending, return the existing promise
    if (this.pendingRequests.has(requestKey)) {
      console.log(`♻️ Reusing pending request: ${requestKey}`);
      return this.pendingRequests.get(requestKey);
    }
    
    // Configure request with proper headers
    const requestOptions: RequestInit = {
      ...options,
      credentials: 'include', // Ensure cookies are sent to our proxy
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        ...options.headers,
      }
    };
    
    // Create the request promise
    const requestPromise = fetch(fullUrl, requestOptions)
      .then(async (response) => {
        console.log(`📥 Response for ${requestKey}: ${response.status}`);
        
        // Handle non-200 responses
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}`);
          (error as any).response = response;
          
          // Try to get error details from response
          try {
            const errorData = await response.json();
            (error as any).data = errorData;
            console.error(`❌ API Error: ${JSON.stringify(errorData)}`);
          } catch {
            console.error(`❌ API Error: ${response.statusText}`);
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
      .catch((error) => {
        console.error(`❌ Request failed for ${requestKey}:`, error);
        throw error;
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

  async patch(url: string, data?: any, options: RequestInit = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(url: string, options: RequestInit = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  // Clear all pending requests (useful for logout)
  clearPendingRequests() {
    console.log('🧹 Clearing all pending authenticated requests');
    this.pendingRequests.clear();
  }
}

// Export a singleton instance
export const authenticatedClient = new AuthenticatedAPIClient();
export default AuthenticatedAPIClient;