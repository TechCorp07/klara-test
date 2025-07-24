// src/lib/api/services/auth.service.ts
import { TabAuthManager } from '@/lib/auth/tab-auth-utils';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { 
  LoginResponse, 
  LoginCredentials,
  RegisterRequest, 
  RegisterResponse,
  User,
} from '@/types/auth.types';
import config from '@/lib/config';

/**
 * Authentication response interfaces
 */
interface AuthResponse {
  token?: string;
  access_token?: string;
  session_token?: string;
  user?: User;
  message?: string;
  session?: any;
  refresh_token?: string;
  success?: boolean;
  detail?: string; 
}

interface RefreshResponse {
  success: boolean;
  token?: string;
  expires_in?: number;
}

interface LogoutResponse {
  success: boolean;
  message?: string;
}

/**
 * JWT Authentication Service Class
 */
class JWTAuthService {
  /**
   * User login with credentials - Updated for session tokens
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.LOGIN,
        credentials
      );
  
      const data = response.data;
  
      // Check for errors without relying on success property
      if (!data.token && !data.access_token) {
        throw new Error(data.message || data.detail || 'Login failed');
      }
  
      // Store session token if provided
      if (data.session_token) {
        localStorage.setItem('session_token', data.session_token);
      }
  
      return {
        token: data.access_token || data.token || '',
        access_token: data.access_token,
        session_token: data.session_token,
        user: data.user as User,
        requires_2fa: false,
        session: data.session,
        message: data.message,
      };
  
    } catch (error) {
      console.error('Login service error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Login failed'
      );
    }
  }

  /**
   * Refresh session token - NEW SESSION METHOD
   */
  async refreshSession(): Promise<{ success: boolean; token: string; expires_in: number }> {
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      if (!sessionToken) {
        throw new Error('No session token available');
      }
  
      const response = await fetch(`${config.apiBaseUrl}/users/auth/refresh-session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Session ${sessionToken}`,
        },
        body: JSON.stringify({ session_token: sessionToken }),
      });
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('session_token', data.session_token);
        
        return {
          success: true,
          token: data.session_token,
          expires_in: data.expires_in,
        };
      } else {
        throw new Error('Session refresh failed');
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      throw error;
    }
  }

  /**
   * User registration
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.REGISTER,
        userData
      );

      const data = response.data;

      if (!data.user) {
        throw new Error(data.message || data.detail || 'Registration failed');
      }

      return {
        user: data.user as User,
        message: data.message || 'Registration successful',
        requires_approval: true,
      };

    } catch (error) {
      console.error('Registration service error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Registration failed'
      );
    }
  }

  /**
   * User logout - Updated for proper session termination
   */
  async logout(): Promise<void> {
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      if (sessionToken) {
        await fetch(`${config.apiBaseUrl}/users/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Session ${sessionToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ✅ Clean up all tokens
      localStorage.removeItem('session_token');
      TabAuthManager.clearTabSession();
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>(ENDPOINTS.AUTH.ME);
      const data = response.data;
      
      return data;

    } catch (error) {
      console.error('Get current user service error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get user information'
      );
    }
  }
  
  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.VERIFY_EMAIL,
        { token }
      );

      const data = response.data;

      return {
        success: true,
        message: data.message || 'Email verification processed',
      };

    } catch (error) {
      console.error('Email verification service error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Email verification failed'
      );
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );

      const data = response.data;

      return {
        success: true,
        message: data.message || 'Password reset email sent',
      };

    } catch (error) {
      console.error('Password reset request error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Password reset request failed'
      );
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.RESET_PASSWORD,
        { token, password: newPassword }
      );

      const data = response.data;

      return {
        success: true,
        message: data.message || 'Password reset successful',
      };

    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Password reset failed'
      );
    }
  }
}

/**
 * Export singleton instance
 */
export const jwtAuthService = new JWTAuthService();

export default jwtAuthService;
export const authService = jwtAuthService; // Alias for backward compatibility