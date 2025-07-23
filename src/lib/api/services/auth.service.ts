// src/lib/api/services/auth.service.ts
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { 
  LoginResponse, 
  LoginCredentials,
  RegisterRequest, 
  RegisterResponse,
  User,
} from '@/types/auth.types';

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

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store both JWT and session token
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      
      // NEW: Store session token for ongoing authentication
      if (data.session_token) {
        localStorage.setItem('session_token', data.session_token);
      }

      return {
        token: data.access_token || data.token || '',
        access_token: data.access_token,
        session_token: data.session_token,
        user: data.user as User,
        message: data.message || 'Login successful',
        requires_2fa: false,
        session: data.session,
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
  
      const response = await apiClient.post<{
        session_token: string;
        expires_in: number;
        token_type: string;
      }>(
        ENDPOINTS.AUTH.REFRESH_SESSION,
        { session_token: sessionToken },
        { skipAuth: true }
      );
  
      // Store new session token
      localStorage.setItem('session_token', response.data.session_token);
  
      return {
        success: true,
        token: response.data.session_token,
        expires_in: response.data.expires_in,
      };
  
    } catch (error) {
      console.error('Session refresh error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Session refresh failed'
      );
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

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
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
      console.log('🚪 AuthService: Starting logout...');
      
      // Call the frontend logout API (this will handle both frontend and backend logout)
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('✅ AuthService: Logout successful:', data.message);
      } else {
        console.warn('⚠️ AuthService: Logout API returned non-success, but continuing');
      }
  
    } catch (error) {
      // Log error but don't throw - logout should always succeed on client side
      console.error('❌ AuthService: Logout error:', error);
      console.log('✅ AuthService: Logout completed despite API error');
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
   * Refresh JWT token
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await apiClient.post<RefreshResponse>(
        ENDPOINTS.AUTH.REFRESH_TOKEN
      );

      const data = response.data;

      if (!data.success || !data.token) {
        throw new Error('Token refresh failed');
      }

      return data.token;

    } catch (error) {
      console.error('Token refresh service error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Token refresh failed'
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
        success: data.success,
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
        success: data.success,
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
        success: data.success,
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