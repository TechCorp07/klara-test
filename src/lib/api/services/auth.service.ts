// src/lib/api/services/auth.service.ts
import { jwtApiClient, extractDataFromResponse } from '../client';
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
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
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
   * User login with credentials
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await jwtApiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      const data = extractDataFromResponse(response);

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      return {
        success: true,
        token: data.token || '',
        user: data.user as User,
        message: data.message || 'Login successful',
      };

    } catch (error) {
      console.error('Login service error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Login failed'
      );
    }
  }

  /**
   * User registration
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await jwtApiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.REGISTER,
        userData
      );

      const data = extractDataFromResponse(response);

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      return {
        success: true,
        user: data.user as User,
        message: data.message || 'Registration successful',
        requiresVerification: true,
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
      const response = await jwtApiClient.get<User>(ENDPOINTS.AUTH.ME);
      const data = extractDataFromResponse(response);
      
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
      const response = await jwtApiClient.post<RefreshResponse>(
        ENDPOINTS.AUTH.REFRESH_TOKEN
      );

      const data = extractDataFromResponse(response);

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
      const response = await jwtApiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.VERIFY_EMAIL,
        { token }
      );

      const data = extractDataFromResponse(response);

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
      const response = await jwtApiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );

      const data = extractDataFromResponse(response);

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
      const response = await jwtApiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.RESET_PASSWORD,
        { token, password: newPassword }
      );

      const data = extractDataFromResponse(response);

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