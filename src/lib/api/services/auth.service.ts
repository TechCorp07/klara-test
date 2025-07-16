// src/lib/api/services/jwt-auth.service.ts
/**
 * JWT Authentication Service - Simplified Implementation
 * 
 */

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
 * 
 * These interfaces define the expected responses from authentication endpoints.
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
 * 
 * This service provides authentication methods that work seamlessly with
 * JWT tokens stored in HttpOnly cookies, eliminating the complex token
 * management that was causing race conditions.
 */
class JWTAuthService {
  /**
   * User login with credentials
   * 
   * This method authenticates users and relies on the backend to set
   * HttpOnly cookies. No client-side token storage is needed.
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

      // Return the response - cookies are automatically set by the backend
      return {
        success: true,
        token: data.token || '', // Token for immediate use if needed
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
   * 
   * This method handles user registration through the backend API.
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
        requiresVerification: true, // Most registrations require email verification
      };

    } catch (error) {
      console.error('Registration service error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Registration failed'
      );
    }
  }

  /**
   * User logout
   * 
   * This method logs out the user and clears HttpOnly cookies via the backend.
   */
  async logout(): Promise<void> {
    try {
      const response = await jwtApiClient.post<LogoutResponse>(
        ENDPOINTS.AUTH.LOGOUT
      );

      const data = extractDataFromResponse(response);

      if (!data.success) {
        console.warn('Logout API returned non-success, but continuing with client cleanup');
      }

      // Cookies are cleared by the backend, no client-side cleanup needed
      console.log('Logout completed successfully');

    } catch (error) {
      // Log error but don't throw - logout should always succeed on client side
      console.error('Logout service error:', error);
      console.log('Logout completed despite API error');
    }
  }

  /**
   * Get current user information
   * 
   * This method retrieves current user data using the JWT token in cookies.
   * The backend validates the JWT and returns user information.
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
   * 
   * This method refreshes the JWT token before it expires to maintain
   * seamless authentication without requiring user re-login.
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

      // Return the new token - cookies are automatically updated by backend
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
   * 
   * This method handles email verification for new user accounts.
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
   * 
   * This method initiates the password reset process.
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
        message: data.message || 'Password reset requested',
      };

    } catch (error) {
      console.error('Password reset request service error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Password reset request failed'
      );
    }
  }

  /**
   * Reset password with token
   * 
   * This method completes the password reset process using a reset token.
   */
  async resetPassword(
    token: string, 
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await jwtApiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.RESET_PASSWORD,
        { token, password: newPassword }
      );

      const data = extractDataFromResponse(response);

      return {
        success: data.success,
        message: data.message || 'Password reset successfully',
      };

    } catch (error) {
      console.error('Password reset service error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Password reset failed'
      );
    }
  }

  /**
   * Setup two-factor authentication
   * 
   * This method initiates 2FA setup for a user account.
   */
  async setupTwoFactor(): Promise<{ qr_code: string; secret: string }> {
    try {
      const response = await jwtApiClient.post<{ qr_code: string; secret: string }>(
        ENDPOINTS.AUTH.SETUP_2FA
      );

      return extractDataFromResponse(response);

    } catch (error) {
      console.error('2FA setup service error:', error);
      throw new Error(
        error instanceof Error ? error.message : '2FA setup failed'
      );
    }
  }

  /**
   * Verify two-factor authentication code
   * 
   * This method verifies a 2FA code during the authentication process.
   */
  async verifyTwoFactor(userId: number, code: string): Promise<LoginResponse> {
    try {
      const response = await jwtApiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.VERIFY_2FA,
        { user_id: userId, code }
      );

      const data = extractDataFromResponse(response);

      if (!data.success) {
        throw new Error(data.message || '2FA verification failed');
      }

      return {
        success: true,
        token: data.token || '',
        user: data.user as User,
        message: data.message || '2FA verification successful',
      };

    } catch (error) {
      console.error('2FA verification service error:', error);
      throw new Error(
        error instanceof Error ? error.message : '2FA verification failed'
      );
    }
  }

  /**
   * Check account status
   * 
   * This method checks the status of a user account (useful for registration flow).
   */
  async checkAccountStatus(email: string): Promise<{
    exists: boolean;
    is_approved: boolean;
    email_verified: boolean;
    role: string;
    message: string;
  }> {
    try {
      const response = await jwtApiClient.post<{
        exists: boolean;
        is_approved: boolean;
        email_verified: boolean;
        role: string;
        message: string;
      }>(
        ENDPOINTS.AUTH.CHECK_STATUS,
        { email }
      );

      return extractDataFromResponse(response);

    } catch (error) {
      console.error('Account status check service error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Account status check failed'
      );
    }
  }

  /**
   * Health check method
   * 
   * This method verifies that the authentication service is responding correctly.
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try to access a lightweight endpoint
      await jwtApiClient.get('/health');
      return true;
    } catch (error) {
      console.error('Auth service health check failed:', error);
      return false;
    }
  }
}

/**
 * Create and export the JWT authentication service instance
 * 
 * This singleton pattern ensures consistent configuration throughout your application.
 */
export const jwtAuthService = new JWTAuthService();

/**
 * Backward compatibility exports
 * 
 * These exports maintain compatibility with existing code while transitioning
 * to the new JWT authentication service.
 */
export const authService = jwtAuthService; // Alias for backward compatibility

// Export the main service as default
export default jwtAuthService;