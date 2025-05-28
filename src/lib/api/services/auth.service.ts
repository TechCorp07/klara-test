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

// Backend response interfaces matching your deployed API exactly
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

interface ConsentResponse {
  consent_type: string;
  consented: boolean;
  updated_at: string;
  user_id: number;
  version?: string;
}

/**
 * COMPREHENSIVE FIX: Authentication service aligned with your deployed backend
 * 
 * Key Changes Made:
 * 1. Removed all refresh token logic (your backend doesn't support it)
 * 2. Fixed field name mappings to match backend expectations exactly
 * 3. Corrected 2FA implementation to use proper user_id parameter
 * 4. Updated error handling to match backend response format
 * 5. Fixed registration field transformations
 */
export const authService = {
  /**
   * FIXED: Login now properly handles your backend's single-token response
   * Backend returns: { "token": "string", "user": {...}, "requires_2fa": boolean }
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  /**
   * MAJOR FIX: Registration field mapping corrected for backend compatibility
   * Your frontend form fields are now properly transformed to match backend expectations
   */
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    // Transform frontend field names to match backend API exactly
    const backendPayload = {
      email: userData.email,
      password: userData.password,
      confirm_password: userData.password_confirm, // FIXED: Backend expects confirm_password
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      phone_number: userData.phone_number,
      date_of_birth: userData.date_of_birth,
      terms_accepted: userData.terms_accepted,
      hipaa_privacy_acknowledged: userData.terms_accepted, // FIXED: Backend field name
      
      // Provider-specific fields - FIXED: Field name mappings
      ...(userData.role === 'provider' && {
        medical_license_number: userData.license_number, // FIXED: Backend expects this field name
        npi_number: userData.npi_number,
        specialty: userData.specialty,
        practice_name: userData.practice_name,
        practice_address: userData.practice_address,
        accepting_new_patients: true,
      }),
      
      // Researcher-specific fields - FIXED: Field mappings
      ...(userData.role === 'researcher' && {
        institution: userData.institution,
        primary_research_area: userData.research_area, // FIXED: Backend field name
        qualifications_background: userData.qualifications, // FIXED: Backend field name
        irb_approval_confirmed: true,
        phi_handling_acknowledged: true,
      }),
      
      // Pharmaceutical company fields - FIXED: Field mappings
      ...(userData.role === 'pharmco' && {
        company_name: userData.company_name,
        role_at_company: userData.company_role, // FIXED: Backend field name
        regulatory_id: userData.regulatory_id,
        primary_research_focus: userData.research_focus, // FIXED: Backend field name
        phi_handling_acknowledged: true,
      }),
      
      // Caregiver-specific fields - FIXED: Field mappings
      ...(userData.role === 'caregiver' && {
        relationship_to_patient: userData.relationship_to_patient,
        caregiver_type: userData.caregiver_type,
        patient_email: userData.patient_email,
        caregiver_authorization_acknowledged: true,
      }),
      
      // Compliance officer fields - FIXED: Field mappings
      ...(userData.role === 'compliance' && {
        organization: userData.regulatory_experience || "Healthcare Organization",
        job_title: "Compliance Officer",
        compliance_certification: userData.compliance_certification,
        primary_specialization: "HIPAA",
        regulatory_experience: userData.regulatory_experience,
      }),
    };

    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, backendPayload);
    return response.data;
  },

  /**
   * Check account status - aligns with backend endpoint
   */
  checkAccountStatus: async (email: string): Promise<CheckAccountStatusResponse> => {
    const response = await apiClient.get(`${ENDPOINTS.AUTH.CHECK_STATUS}?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  /**
   * SIMPLIFIED: Logout - backend uses single token, no refresh needed
   */
  logout: async (): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Password reset request - aligns with backend
   */
  forgotPassword: async (email: string): Promise<{ detail: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  /**
   * FIXED: Password reset with proper field names
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<{ detail: string }> => {
    const payload = {
      token: data.token,
      password: data.password,
      password_confirm: data.password_confirm, // FIXED: Backend expects this exact field name
    };
    const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, payload);
    return response.data;
  },

  /**
   * Email verification request
   */
  requestEmailVerification: async (): Promise<{ detail: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REQUEST_EMAIL_VERIFICATION);
    return response.data;
  },

  /**
   * Email verification with token
   */
  verifyEmail: async (data: VerifyEmailRequest): Promise<{ detail: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    return response.data;
  },

  /**
   * MAJOR FIX: Two-factor authentication setup
   * Backend returns "qr_code" and "secret_key", not "qr_code_url" and "secret"
   */
  setupTwoFactor: async (): Promise<SetupTwoFactorResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.SETUP_2FA);
    
    // Transform backend response to match frontend interface
    return {
      qr_code: response.data.qr_code,      // FIXED: Backend field name
      secret_key: response.data.secret_key  // FIXED: Backend field name
    };
  },

  /**
   * FIXED: Confirm 2FA setup - backend expects 'token' field for the code
   */
  confirmTwoFactor: async (code: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.CONFIRM_2FA, { 
      token: code // FIXED: Backend expects 'token', not 'code'
    });
    return response.data;
  },

  /**
   * CRITICAL FIX: 2FA verification during login
   * Your backend expects: { "user_id": 123, "token": "123456" }
   * Previous implementation was passing wrong parameter types
   */
  verifyTwoFactor: async (userId: number, code: string): Promise<LoginResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_2FA, { 
      user_id: userId,  // FIXED: Numeric user ID (not a token string)
      token: code       // FIXED: 2FA code from authenticator app
    });
    return response.data;
  },

  /**
   * MAJOR FIX: Disable 2FA - backend expects password, not 2FA code
   */
  disableTwoFactor: async (password: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.DISABLE_2FA, { 
      password: password // FIXED: Backend expects current password to disable 2FA
    });
    return response.data;
  },

  /**
   * Get current user information
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get(ENDPOINTS.USERS.ME);
    return response.data;
  },
  
  /**
   * Admin functions - get pending approvals
   */
  getPendingApprovals: async (): Promise<User[]> => {
    const response = await apiClient.get(ENDPOINTS.USERS.PENDING_APPROVALS);
    // Handle both paginated and direct array responses
    return response.data.results || response.data;
  },
  
  /**
   * Approve user registration
   */
  approveUser: async (userId: number): Promise<User> => {
    const response = await apiClient.post(ENDPOINTS.USERS.APPROVE_USER(userId));
    return response.data;
  },
  
  /**
   * Reject user registration  
   */
  rejectUser: async (userId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(ENDPOINTS.USERS.USER_DETAIL(userId));
    return response.data;
  },

  /**
   * Bulk operations for admin
   */
  bulkApproveUsers: async (userIds: number[]): Promise<BulkOperationResponse> => {
    const response = await apiClient.post(ENDPOINTS.ADMIN.BULK_APPROVE, { user_ids: userIds });
    return response.data;
  },

  bulkDenyUsers: async (userIds: number[], reason?: string): Promise<BulkOperationResponse> => {
    const response = await apiClient.post(ENDPOINTS.ADMIN.BULK_DENY, { 
      user_ids: userIds,
      reason: reason || "Application denied"
    });
    return response.data;
  },

  /**
   * Get dashboard statistics for admin
   */
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN.DASHBOARD_STATS);
    return response.data;
  },
  
  /**
   * Update user profile
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.patch(ENDPOINTS.USERS.ME, userData);
    return response.data;
  },
  
  /**
   * Change password - you may need to implement this endpoint in your backend
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string,
    newPasswordConfirm: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`${ENDPOINTS.USERS.ME}/change-password/`, {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm
    });
    return response.data;
  },

  /**
   * Update user consent preferences
   */
  updateConsent: async (
    consentType: string,
    consented: boolean
  ): Promise<ConsentResponse> => {
    const response = await apiClient.post(ENDPOINTS.CONSENT_RECORDS.LIST, { 
      consent_type: consentType, 
      consented 
    });
    return response.data;
  },
};

export default authService;