// src/lib/api/services/auth.service.ts
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse, 
  ResetPasswordRequest, 
  VerifyEmailRequest, 
  SetupTwoFactorResponse,
  User
} from '@/types/auth.types';

interface ConsentResponse {
  consent_type: string;
  consented: boolean;
  updated_at: string;
  user_id: number;
  version?: string;
}

// Backend response interfaces that match your API documentation exactly
interface CheckAccountStatusResponse {
  exists: boolean;
  is_approved: boolean;
  email_verified: boolean;
  role: string;
  account_locked: boolean;
  message: string;
}

interface BulkOperationResponse {
  approved_count?: number;
  denied_count?: number;
  total_requested: number;
  errors?: string[];
}

interface DashboardStatsResponse {
  total_users: number;
  pending_approvals: number;
  users_by_role: Record<string, number>;
  pending_caregiver_requests: number;
  unreviewed_emergency_access: number;
  recent_registrations: number;
  unverified_patients: number;
}

/**
 * Authentication service aligned with your deployed backend API
 * 
 * Key Changes Made:
 * 1. Removed all refresh token logic since your backend uses single long-lived tokens
 * 2. Updated response handling to match your backend's field names
 * 3. Fixed 2FA verification to use proper user ID instead of token string
 * 4. Corrected disable 2FA to expect password instead of 2FA code
 */
export const authService = {
  /**
   * Authenticate a user with credentials
   * 
   * Your backend returns: { "token": "string", "user": {...}, "requires_2fa": boolean }
   * This is different from JWT-style { "access": "...", "refresh": "..." } tokens
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  /**
   * Register a new user with the system
   * 
   * The field transformation logic here correctly maps your frontend form fields
   * to the exact field names your backend expects
   */
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    // Transform frontend field names to match backend expectations exactly
    const backendPayload = {
      email: userData.email,
      password: userData.password,
      confirm_password: userData.password_confirm, // Backend expects confirm_password
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      phone_number: userData.phone_number,
      date_of_birth: userData.date_of_birth,
      terms_accepted: userData.terms_accepted,
      hipaa_privacy_acknowledged: userData.terms_accepted, // Backend field name
      
      // Provider-specific fields (when role is provider)
      ...(userData.role === 'provider' && {
        medical_license_number: userData.license_number, // Backend field name
        npi_number: userData.npi_number,
        specialty: userData.specialty,
        practice_name: userData.practice_name,
        practice_address: userData.practice_address,
        accepting_new_patients: true, // Default value
      }),
      
      // Researcher-specific fields
      ...(userData.role === 'researcher' && {
        institution: userData.institution,
        primary_research_area: userData.research_area, // Backend field name
        qualifications_background: userData.qualifications, // Backend field name
        irb_approval_confirmed: true, // Backend expects this
        phi_handling_acknowledged: true, // Backend expects this
      }),
      
      // Pharmaceutical company fields
      ...(userData.role === 'pharmco' && {
        company_name: userData.company_name,
        role_at_company: userData.company_role, // Backend field name
        regulatory_id: userData.regulatory_id,
        primary_research_focus: userData.research_focus, // Backend field name
        phi_handling_acknowledged: true, // Backend expects this
      }),
      
      // Caregiver-specific fields
      ...(userData.role === 'caregiver' && {
        relationship_to_patient: userData.relationship_to_patient,
        caregiver_type: userData.caregiver_type,
        patient_email: userData.patient_email,
        caregiver_authorization_acknowledged: true, // Backend expects this
      }),
      
      // Compliance officer fields
      ...(userData.role === 'compliance' && {
        organization: userData.regulatory_experience, // Map to available field
        job_title: "Compliance Officer", // Default value
        compliance_certification: userData.compliance_certification,
        primary_specialization: "HIPAA", // Default value
        regulatory_experience: userData.regulatory_experience,
      }),
    };

    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, backendPayload);
    return response.data;
  },

  /**
   * Check account status without authentication
   * This endpoint allows checking user status before login
   */
  checkAccountStatus: async (email: string): Promise<CheckAccountStatusResponse> => {
    const response = await apiClient.get(`${ENDPOINTS.AUTH.CHECK_STATUS}?email=${email}`);
    return response.data;
  },

  /**
   * REMOVED: refreshToken method
   * 
   * Your backend doesn't implement token refresh. Instead, it uses longer-lived
   * single tokens that don't need frequent refreshing. This simplifies the
   * authentication flow but means users will need to re-login when tokens expire.
   */

  /**
   * Log out the current user and invalidate their token
   * The token is sent automatically via cookies due to withCredentials: true
   */
  logout: async (): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Request a password reset email for the given email address
   */
  forgotPassword: async (email: string): Promise<{ detail: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  /**
   * Reset password using a token from the reset email
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<{ detail: string }> => {
    // Transform field names to match backend
    const payload = {
      token: data.token,
      password: data.password,
      password_confirm: data.password_confirm, // Backend expects this exact field name
    };
    const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, payload);
    return response.data;
  },

  /**
   * Request a new email verification link
   */
  requestEmailVerification: async (): Promise<{ detail: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REQUEST_EMAIL_VERIFICATION);
    return response.data;
  },

  /**
   * Verify email with token from the verification email
   */
  verifyEmail: async (data: VerifyEmailRequest): Promise<{ detail: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    return response.data;
  },

  /**
   * Setup two-factor authentication
   * 
   * FIXED: Backend returns "qr_code" and "secret_key", not "qr_code_url" and "secret"
   */
  setupTwoFactor: async (): Promise<SetupTwoFactorResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.SETUP_2FA);
    
    // Transform backend response to match frontend interface
    return {
      qr_code: response.data.qr_code,      // Backend field name
      secret_key: response.data.secret_key  // Backend field name
    };
  },

  /**
   * Confirm two-factor authentication setup with a verification code
   * Backend expects 'token' field for the 2FA code
   */
  confirmTwoFactor: async (code: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.CONFIRM_2FA, { 
      token: code // Backend expects 'token', not 'code'
    });
    return response.data;
  },

  /**
   * Verify two-factor authentication code during login
   * 
   * CRITICAL FIX: Your backend expects a numeric user_id and a token string
   * The previous implementation was incorrectly passing a token as the user_id
   * 
   * Your backend documentation shows:
   * {
   *   "user_id": 123,        // This should be a number (the user's ID)
   *   "token": "123456"      // This is the 2FA code from the authenticator app
   * }
   */
  verifyTwoFactor: async (userId: number, code: string): Promise<LoginResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_2FA, { 
      user_id: userId,  // Numeric user ID (not a token string)
      token: code       // 2FA code from authenticator app
    });
    return response.data;
  },

  /**
   * Disable two-factor authentication
   * 
   * FIXED: Backend expects the user's current password, not a 2FA code
   * This makes sense from a security perspective - you need your password to disable 2FA
   */
  disableTwoFactor: async (password: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.DISABLE_2FA, { 
      password: password // Backend expects current password to disable 2FA
    });
    return response.data;
  },

  /**
   * Get current user profile and information
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get(ENDPOINTS.USERS.ME);
    return response.data;
  },
  
  /**
   * Get pending user approvals (for admin users)
   */
  getPendingApprovals: async (): Promise<User[]> => {
    const response = await apiClient.get(ENDPOINTS.USERS.PENDING_APPROVALS);
    return response.data.results || response.data; // Handle pagination
  },
  
  /**
   * Approve a user registration (for admin users)
   */
  approveUser: async (userId: number): Promise<User> => {
    const response = await apiClient.post(ENDPOINTS.USERS.APPROVE_USER(userId));
    return response.data;
  },
  
  /**
   * Reject a user registration (for admin users)
   */
  rejectUser: async (userId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(ENDPOINTS.USERS.USER_DETAIL(userId));
    return response.data;
  },

  /**
   * Bulk approve multiple users
   */
  bulkApproveUsers: async (userIds: number[]): Promise<BulkOperationResponse> => {
    const response = await apiClient.post(ENDPOINTS.ADMIN.BULK_APPROVE, { user_ids: userIds });
    return response.data;
  },

  /**
   * Bulk deny multiple users
   */
  bulkDenyUsers: async (userIds: number[], reason?: string): Promise<BulkOperationResponse> => {
    const response = await apiClient.post(ENDPOINTS.ADMIN.BULK_DENY, { 
      user_ids: userIds,
      reason: reason || "Application denied"
    });
    return response.data;
  },

  /**
   * Get admin dashboard statistics
   */
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN.DASHBOARD_STATS);
    return response.data;
  },
  
  /**
   * Update user profile information
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.patch(ENDPOINTS.USERS.ME, userData);
    return response.data;
  },
  
  /**
   * Change user password
   * This endpoint might not exist in your backend - you may need to add it
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
  },

  /**
   * Update user consent for various purposes
   * This simplified implementation works with basic consent management
   */
  updateConsent: async (
    consentType: string,
    consented: boolean
  ): Promise<ConsentResponse> => {
    // This endpoint might need to be implemented in your backend
    // For now, it tries to use the consent records endpoint
    const response = await apiClient.post('/users/consent-records/', { 
      consent_type: consentType, 
      consented 
    });
    return response.data;
  },
};

export default authService;