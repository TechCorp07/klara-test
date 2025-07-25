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

        // ✅ Only check for session token
        const sessionToken = localStorage.getItem('session_token');
        
        if (sessionToken) {
          config.headers.Authorization = `Session ${sessionToken}`;
        }
        
        // Add request timestamp for debugging
        extendedConfig.metadata = { startTime: Date.now() };
        
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
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedInternalAxiosRequestConfig;
        
        // Handle authentication errors
        if (error.response?.status === 401 && !originalRequest?.skipAuthRefresh) {
          
          // NEW: Try session token refresh first
          const sessionToken = localStorage.getItem('session_token');
          if (sessionToken && !String(originalRequest.headers?.Authorization || '').includes('Session')) {
            try {
              const refreshResponse = await fetch('/api/users/auth/refresh-session/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_token: sessionToken })
              });
              
              if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                localStorage.setItem('session_token', data.session_token);
                
                // Retry original request with new session token
                originalRequest.headers!.Authorization = `Session ${data.session_token}`;
                return this.client(originalRequest);
              }
            } catch (refreshError) {
              console.error('Session refresh failed:', refreshError);
            }
          }
          
          // If session refresh fails or no session token, clear everything
          TabAuthManager.clearTabSession();
          localStorage.removeItem('session_token');
          
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

  async upload<T = unknown>(
    url: string, 
    file: File, 
    additionalData: Record<string, unknown> = {}, 
    onProgress?: (progress: number) => void,
    config?: TabAPIRequestConfig
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  
    return this.client.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress ? (progressEvent: unknown) => {
        const event = progressEvent as { loaded: number; total?: number };
        const progress = Math.round((event.loaded * 100) / (event.total || 1));
        onProgress(progress);
      } : undefined,
    });
  }

  async batch<T = unknown>(requests: Array<{
    method: 'get' | 'post' | 'put' | 'patch' | 'delete';
    url: string;
    data?: unknown;
    config?: TabAPIRequestConfig;
  }>): Promise<AxiosResponse<T>[]> {
    const promises = requests.map(req => {
      switch (req.method) {
        case 'get':
          return this.get<T>(req.url, req.config);
        case 'post':
          return this.post<T>(req.url, req.data, req.config);
        case 'put':
          return this.put<T>(req.url, req.data, req.config);
        case 'patch':
          return this.patch<T>(req.url, req.data, req.config);
        case 'delete':
          return this.delete<T>(req.url, req.config);
        default:
          throw new Error(`Unsupported method: ${req.method}`);
      }
    });
    
    return Promise.all(promises);
  }

  async withRetry<T = unknown>(
    requestFn: () => Promise<AxiosResponse<T>>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<AxiosResponse<T>> {
    let lastError: unknown;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on 4xx errors (except 429 - too many requests)
        if (error instanceof Error && 'response' in error) {
          const axiosError = error as AxiosError;
          if (axiosError.response && 
              axiosError.response.status >= 400 && 
              axiosError.response.status < 500 && 
              axiosError.response.status !== 429) {
            throw error;
          }
        }
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
      }
    }
    
    throw lastError;
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

export function extractData<T>(response: AxiosResponse<APIResponse<T>>): T {
  return response.data.data;
}

export function extractDirectData<T>(response: AxiosResponse<T>): T {
  return response.data;
}

export function handleApiError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError;
    const data = axiosError.response?.data as any;
    if (data?.message) {
      return data.message;
    }
    if (data?.detail) {
      return data.detail;
    }
    if (data?.errors?.length) {
      return data.errors.join(', ');
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

export const buildApiUrl = {
  patient: {
    dashboard: () => '/users/patient/dashboard/',
    medications: {
      list: () => '/users/patient/medications/',
      log: (id: number) => `/users/patient/medications/${id}/log/`,
      analytics: () => '/users/patient/medications/analytics/',
    },
    vitals: {
      list: () => '/users/patient/vitals/',
      latest: () => '/users/patient/vitals/latest/',
      record: () => '/users/patient/vitals/',
    },
    appointments: {
      list: () => '/users/patient/appointments/',
      request: () => '/users/patient/appointments/request/',
      cancel: (id: number) => `/users/patient/appointments/${id}/cancel/`,
    },
    devices: {
      list: () => '/users/patient/wearable-devices/',
      connect: () => '/users/patient/wearable-devices/connect/',
      disconnect: (id: number) => `/users/patient/wearable-devices/${id}/disconnect/`,
    },
    alerts: {
      list: () => '/users/patient/alerts/',
      acknowledge: (id: number) => `/users/patient/alerts/${id}/acknowledge/`,
    },
    research: {
      studies: () => '/users/patient/research/available-studies/',
      interest: (studyId: number) => `/users/patient/research/studies/${studyId}/interest/`,
    }
  }
};

export async function apiCall<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: unknown,
  config?: TabAPIRequestConfig
): Promise<T> {
  try {
    let response: AxiosResponse<T>;
    
    switch (method) {
      case 'get':
        response = await apiClient.get<T>(url, config);
        break;
      case 'post':
        response = await apiClient.post<T>(url, data, config);
        break;
      case 'put':
        response = await apiClient.put<T>(url, data, config);
        break;
      case 'patch':
        response = await apiClient.patch<T>(url, data, config);
        break;
      case 'delete':
        response = await apiClient.delete<T>(url, config);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    return extractDirectData(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

// Export singleton instance
export const apiClient = new TabAPIClient();

// Export the class for testing
export { TabAPIClient };

// Default export
export default apiClient;