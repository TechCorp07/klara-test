// src/lib/api/client.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { config } from '../config';
import { TabAuthManager } from '../auth/tab-auth-utils';

interface TabAPIRequestConfig extends AxiosRequestConfig {
  skipAuthRefresh?: boolean;
  skipAuth?: boolean; 
}

interface ExtendedInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuthRefresh?: boolean;
  skipAuth?: boolean;
  metadata?: { startTime: number };
}

export interface APIResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

class TabAPIClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = config.apiBaseUrl;
    this.client = this.createAxiosInstance();
    this.setupInterceptors();
  }

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },

      withCredentials: false,
      
      validateStatus: (status) => {
        return status >= 200 && status < 500;
      },
    });
  }

  private setupInterceptors(): void {
    // Request interceptor - Add Authorization header
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const extendedConfig = config as ExtendedInternalAxiosRequestConfig;
        
        // Skip auth for specific requests (like login)
        if (extendedConfig.skipAuth) {
          return config;
        }

        // Get tab-specific JWT token
        const tabSession = TabAuthManager.getTabSession();
        
        if (tabSession?.jwtToken) {
          config.headers.Authorization = `Bearer ${tabSession.jwtToken}`;
          
          // Add tab context headers
          config.headers['X-Tab-ID'] = tabSession.tabId;
          config.headers['X-Auth-Type'] = 'tab-specific';
        }
        
        // Add request timestamp for debugging
        extendedConfig.metadata = { startTime: Date.now() };
        
        // Log outgoing requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle auth errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response timing in development
        if (process.env.NODE_ENV === 'development') {
          const extendedConfig = response.config as ExtendedInternalAxiosRequestConfig;
          if (extendedConfig.metadata) {
            const duration = Date.now() - extendedConfig.metadata.startTime;
            console.log(`✅ API Response: ${response.status} in ${duration}ms`);
          }
        }
        
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedInternalAxiosRequestConfig;
        
        // Handle authentication errors
        if (error.response?.status === 401 && !originalRequest?.skipAuthRefresh) {
          console.log('🔐 Authentication error, clearing tab session');
          
          TabAuthManager.clearTabSession();
          
          // Only redirect if we're in the browser
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          return Promise.reject(error);
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ API Error: ${error.response?.status} ${error.message}`);
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Standard HTTP methods with tab-specific auth
  async get<T = unknown>(url: string, config?: TabAPIRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = unknown>(url: string, data?: unknown, config?: TabAPIRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = unknown>(url: string, data?: unknown, config?: TabAPIRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: TabAPIRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = unknown>(url: string, config?: TabAPIRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  // Convenience method for API calls without auth (like login)
  async postWithoutAuth<T = unknown>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, { skipAuth: true } as TabAPIRequestConfig);
  }

  // Get current tab session info
  getTabSession() {
    return TabAuthManager.getTabSession();
  }

  // Check if current tab is authenticated
  isAuthenticated(): boolean {
    return TabAuthManager.isCurrentTabAuthenticated();
  }
}

// Export singleton instance
export const apiClient = new TabAPIClient();

// Export the class for testing
export { TabAPIClient };

// Default export
export default apiClient;