// src/lib/api/services/auth.service.ts
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { config } from '@/lib/config';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse, 
  ResetPasswordRequest, 
  VerifyEmailRequest, 
  SetupTwoFactorResponse, 
  TokenRefreshRequest, 
  TokenRefreshResponse,
  ConsentUpdate,
  User
} from '@/types/auth.types';

/**
 * Authentication service that provides methods for interacting with the authentication API
 * This includes login, registration, password reset, email verification,
 * two-factor authentication, and user management functionality.
 */
export const authService = {
  /**
   * Authenticate a user with credentials
   * @param credentials User credentials (username/email and password)
   * @returns LoginResponse containing tokens and user data, or 2FA information
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  /**
   * Register a new user with the system
   * @param userData User registration data including personal information and role-specific details
   * @returns RegisterResponse with the created user information
   */
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  /**
   * Refresh the access token using refresh token
   * @returns TokenRefreshResponse with a new access token
   */
  refreshToken: async (): Promise<TokenRefreshResponse> => {
    // Refresh token is sent automatically as an HttpOnly cookie
    const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN);
    return response.data;
  },

  /**
   * Log out the current user and invalidate their tokens
   */
  logout: async (): Promise<void> => {
    // Call API endpoint to clear server-side session data
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Request a password reset email for the given email address
   * @param email User's email address
   * @returns Response message
   */
  forgotPassword: async (email: string): Promise<{ detail: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  /**
   * Reset password using a token from the reset email
   * @param data Reset password data including token and new password
   * @returns Response message
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<{ detail: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return response.data;
  },

  /**
   * Request a new email verification link
   * @returns Response message
   */
  requestEmailVerification: async (): Promise<{ detail: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REQUEST_EMAIL_VERIFICATION);
    return response.data;
  },

  /**
   * Verify email with token from the verification email
   * @param data Email verification data including token and optionally email
   * @returns Response message
   */
  verifyEmail: async (data: VerifyEmailRequest): Promise<{ detail: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    return response.data;
  },

  /**
   * Setup two-factor authentication
   * @returns SetupTwoFactorResponse with secret key and QR code
   */
  setupTwoFactor: async (): Promise<SetupTwoFactorResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.SETUP_2FA);
    return response.data;
  },

  /**
   * Confirm two-factor authentication setup with a verification code
   * @param code Verification code from authenticator app
   * @returns Success message
   */
  confirmTwoFactor: async (code: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.CONFIRM_2FA, { code });
    return response.data;
  },

  /**
   * Verify two-factor authentication code during login
   * @param token Temporary token from login response
   * @param code Verification code from authenticator app
   * @returns LoginResponse with tokens and user data
   */
  verifyTwoFactor: async (token: string, code: string): Promise<LoginResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_2FA, { token, code });
    return response.data;
  },

  /**
   * Disable two-factor authentication
   * @param code Verification code from authenticator app
   * @returns Success message
   */
  disableTwoFactor: async (code: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.DISABLE_2FA, { code });
    return response.data;
  },

  /**
   * Update user consent for various purposes (HIPAA, research, data sharing, etc.)
   * @param consentType Type of consent to update
   * @param consented Whether consent is granted or revoked
   * @returns Updated consent information
   */
  updateConsent: async (consentType: string, consented: boolean): Promise<any> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.UPDATE_CONSENT, { 
      consent_type: consentType, 
      consented 
    });
    return response.data;
  },

  /**
   * Get current user profile and information
   * @returns User data for the currently authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get(ENDPOINTS.USERS.ME);
    return response.data;
  },
  
  /**
   * Get pending user approvals (for admin users)
   * @returns List of users pending approval
   */
  getPendingApprovals: async (): Promise<User[]> => {
    const response = await apiClient.get(ENDPOINTS.USERS.PENDING_APPROVALS);
    return response.data;
  },
  
  /**
   * Approve a user registration (for admin users)
   * @param userId ID of the user to approve
   * @returns Updated user data
   */
  approveUser: async (userId: number): Promise<User> => {
    const response = await apiClient.post(ENDPOINTS.USERS.APPROVE_USER(userId));
    return response.data;
  },
  
  /**
   * Reject a user registration (for admin users)
   * @param userId ID of the user to reject
   * @returns Success message
   */
  rejectUser: async (userId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`${ENDPOINTS.USERS.APPROVE_USER(userId)}/reject`);
    return response.data;
  },
  
  /**
   * Update user profile information
   * @param userData Updated user data
   * @returns Updated user information
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.patch(ENDPOINTS.USERS.ME, userData);
    return response.data;
  },
  
  /**
   * Change user password
   * @param currentPassword Current password for verification
   * @param newPassword New password
   * @param newPasswordConfirm Confirmation of new password
   * @returns Success message
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string,
    newPasswordConfirm: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`${ENDPOINTS.USERS.ME}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm
    });
    return response.data;
  }
};

export default authService;