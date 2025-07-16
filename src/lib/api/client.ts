// src/lib/api/jwt-client.ts
/**
 * JWT API Client - Race Condition Free Implementation
 * 
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { config } from '../config';

interface JWTRequestConfig extends AxiosRequestConfig {
  skipAuthRefresh?: boolean; // Skip automatic auth refresh for this request
}

export interface APIResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

class JWTAPIClient {
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
      withCredentials: true, // Critical: Always send HttpOnly cookies
      
      // Remove complex validation logic that was causing race conditions
      validateStatus: (status) => {
        // Accept any status code - we'll handle errors explicitly
        return status >= 200 && status < 500;
      },
    });
  }

  private setupInterceptors(): void {
    // Request interceptor - minimal processing
    this.client.interceptors.request.use(
      (config) => {
        // Add request timestamp for debugging
        (config as InternalAxiosRequestConfig & { metadata: { startTime: number } }).metadata = { startTime: Date.now() };
        
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

    // Response interceptor - simplified error handling
    this.client.interceptors.response.use(
      (response) => {
        // Log response timing in development
        if (process.env.NODE_ENV === 'development' && (response.config as InternalAxiosRequestConfig & { metadata?: { startTime: number } }).metadata) {
          const duration = Date.now() - (response.config as InternalAxiosRequestConfig & { metadata: { startTime: number } }).metadata.startTime;
          console.log(`✅ API Response: ${response.status} (${duration}ms)`);
        }
        
        return response;
      },
      (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  private async handleResponseError(error: AxiosError): Promise<never> {
    const { response, config } = error;
    
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${response?.status} ${config?.method?.toUpperCase()} ${config?.url}`);
    }

    // Handle authentication errors simply
    if (response?.status === 401) {
      // Don't try to refresh tokens or validate - just redirect to login
      // The JWT middleware will handle the redirect appropriately
      console.log('🔒 Authentication required - redirecting to login');
      
      // Clear any cached state and redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error('Authentication required'));
    }

    // Handle authorization errors
    if (response?.status === 403) {
      console.log('🚫 Access forbidden');
      
      // Don't redirect automatically - let the component handle this
      return Promise.reject(new Error('Access forbidden'));
    }

    // Handle server errors
    if (response?.status && response.status >= 500) {
      console.error('🔥 Server error:', response.status);
      return Promise.reject(new Error('Server error - please try again later'));
    }

    // Return the original error for other cases
    return Promise.reject(error);
  }

  async get<T = unknown>(url: string, config?: JWTRequestConfig): Promise<APIResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async post<T = unknown>(
    url: string, 
    data?: unknown, 
    config?: JWTRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Generic PUT request method
   */
  async put<T = unknown>(
    url: string, 
    data?: unknown, 
    config?: JWTRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Generic PATCH request method
   */
  async patch<T = unknown>(
    url: string, 
    data?: unknown, 
    config?: JWTRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Generic DELETE request method
   */
  async delete<T = unknown>(url: string, config?: JWTRequestConfig): Promise<APIResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  private formatResponse<T>(response: AxiosResponse<T>): APIResponse<T> {
    return {
      data: response.data,
      success: response.status >= 200 && response.status < 300,
      message: response.statusText,
    };
  }

  private formatError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     error.message || 
                     'An error occurred';
      
      return new Error(message);
    }
    
    return error instanceof Error ? error : new Error('Unknown error');
  }

  get axiosInstance(): AxiosInstance {
    return this.client;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', { skipAuthRefresh: true });
      return true;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

export const jwtApiClient = new JWTAPIClient();

export function extractDataFromResponse<T>(response: APIResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || 'API request failed');
  }
  return response.data;
}

export const api = {
  // Authentication endpoints
  auth: {
    login: (credentials: { email: string; password: string }) => 
      jwtApiClient.post<{ token: string; user: unknown }>('/users/auth/login/', credentials),
    
    register: (userData: unknown) => 
      jwtApiClient.post<{ user: unknown; message: string }>('/users/auth/register/', userData),
    
    logout: () => 
      jwtApiClient.post<{ message: string }>('/users/auth/logout/'),
    
    getCurrentUser: () => 
      jwtApiClient.get<unknown>('/users/auth/me/'),
    
    refresh: () => 
      jwtApiClient.post<{ token: string }>('/users/auth/refresh/'),
  },

  // User management endpoints
  users: {
    list: (params?: unknown) => 
      jwtApiClient.get<unknown>('/users/users/', { params }),
    
    get: (id: number) => 
      jwtApiClient.get<unknown>(`/users/users/${id}/`),
    
    update: (id: number, data: unknown) => 
      jwtApiClient.patch<unknown>(`/users/users/${id}/`, data),
    
    delete: (id: number) => 
      jwtApiClient.delete<void>(`/users/users/${id}/`),
  },

  // Admin endpoints
  admin: {
    getDashboardStats: () => 
      jwtApiClient.get<unknown>('/admin/dashboard-stats/'),
    
    getPendingApprovals: () => 
      jwtApiClient.get<unknown>('/users/users/pending-approvals/'),
    
    approveUser: (id: number) => 
      jwtApiClient.post<unknown>(`/users/users/${id}/approve/`),
    
    rejectUser: (id: number) => 
      jwtApiClient.post<unknown>(`/users/users/${id}/reject/`),
  },
};

export default jwtApiClient;