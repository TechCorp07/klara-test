// src/lib/api/services/auth.service.ts
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { validateLoginResponse, validateUserResponse } from '@/lib/api/validation';
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

// Type for API error responses
interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
}

// Backend payload type for registration
interface BackendRegistrationPayload {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  role: string;
  terms_accepted: boolean;
  hipaa_privacy_acknowledged: boolean;
  phone_number?: string;
  date_of_birth?: string;
  
  // Provider fields
  medical_license_number?: string;
  npi_number?: string;
  specialty?: string;
  practice_name?: string;
  practice_address?: string;
  accepting_new_patients?: boolean;
  
  // Researcher fields
  institution?: string;
  primary_research_area?: string;
  qualifications_background?: string;
  irb_approval_confirmed?: boolean;
  phi_handling_acknowledged?: boolean;
  
  // Pharmco fields
  company_name?: string;
  role_at_company?: string;
  regulatory_id?: string;
  primary_research_focus?: string;
  
  // Caregiver fields
  relationship_to_patient?: string;
  caregiver_type?: string;
  patient_email?: string;
  caregiver_authorization_acknowledged?: boolean;
  
  // Compliance fields
  organization?: string;
  job_title?: string;
  compliance_certification?: string;
  primary_specialization?: string;
  regulatory_experience?: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (!validateLoginResponse(response.data)) {
      throw new Error('Invalid login response format from server');
    }
    
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    // Transform frontend field names to match backend API exactly
    const backendPayload: BackendRegistrationPayload = {
      email: userData.email,
      password: userData.password,
      confirm_password: userData.password_confirm,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      terms_accepted: userData.terms_accepted,
      hipaa_privacy_acknowledged: userData.hipaa_privacy_acknowledged,
    };

    // Add optional common fields
    if (userData.phone_number) {
      backendPayload.phone_number = userData.phone_number;
    }
    if (userData.date_of_birth) {
      backendPayload.date_of_birth = userData.date_of_birth;
    }

    if (userData.role === 'provider') {
      backendPayload.medical_license_number = userData.license_number; 
      backendPayload.npi_number = userData.npi_number;
      backendPayload.specialty = userData.specialty;
      backendPayload.practice_name = userData.practice_name;
      backendPayload.practice_address = userData.practice_address;
      backendPayload.accepting_new_patients = true;
    }
    
    if (userData.role === 'researcher') {
      backendPayload.institution = userData.institution;
      backendPayload.primary_research_area = userData.research_area; 
      backendPayload.qualifications_background = userData.qualifications;
      backendPayload.irb_approval_confirmed = true;
      backendPayload.phi_handling_acknowledged = true;
    }
    
    if (userData.role === 'pharmco') {
      backendPayload.company_name = userData.company_name;
      backendPayload.role_at_company = userData.company_role; 
      backendPayload.regulatory_id = userData.regulatory_id;
      backendPayload.primary_research_focus = userData.research_focus;
      backendPayload.phi_handling_acknowledged = true;
    }
    
    if (userData.role === 'caregiver') {
      backendPayload.relationship_to_patient = userData.relationship_to_patient;
      backendPayload.caregiver_type = userData.caregiver_type;
      backendPayload.patient_email = userData.patient_email;
      backendPayload.caregiver_authorization_acknowledged = true;
    }
    
    if (userData.role === 'compliance') {
      backendPayload.organization = userData.organization; 
      backendPayload.job_title = userData.job_title;
      backendPayload.compliance_certification = userData.compliance_certification;
      backendPayload.primary_specialization = userData.specialization_areas; 
      backendPayload.regulatory_experience = userData.regulatory_experience;
    }

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
   * Logout - backend uses single token system
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

  resetPassword: async (data: ResetPasswordRequest): Promise<{ detail: string }> => {
    const payload = {
      token: data.token,
      password: data.password,
      password_confirm: data.password_confirm, // CRITICAL FIX: Backend expects this exact field name
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

  setupTwoFactor: async (): Promise<SetupTwoFactorResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.SETUP_2FA);
    
    // Transform backend response to match frontend interface
    return {
      qr_code: response.data.qr_code,      // Backend field name
      secret_key: response.data.secret_key  // Backend field name
    };
  },

  confirmTwoFactor: async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.CONFIRM_2FA, { 
        token: code // CRITICAL FIX: Backend expects 'token', not 'code'
      });
      return {
        success: true,
        message: response.data.detail || "Two-factor authentication enabled successfully"
      };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.response?.data?.detail || "Failed to enable two-factor authentication"
      };
    }
  },

  verifyTwoFactor: async (userId: number, code: string): Promise<LoginResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_2FA, { 
      user_id: userId,  // CRITICAL FIX: Numeric user ID
      token: code       // CRITICAL FIX: 2FA code from authenticator app
    });
    return response.data;
  },

  disableTwoFactor: async (password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.DISABLE_2FA, { 
        password: password
      });
      return {
        success: true,
        message: response.data.detail || "Two-factor authentication disabled successfully"
      };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.response?.data?.detail || "Failed to disable two-factor authentication"
      };
    }
  },

  /**
   * Get current user information
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get(ENDPOINTS.USERS.ME);
    
    if (!validateUserResponse(response.data)) {
      throw new Error('Invalid user data format from server');
    }
    
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
   * Change password 
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