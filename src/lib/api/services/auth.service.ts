// src/lib/api/services/auth.service.ts
import apiClient, { extractDataFromResponse } from '../client';
import { AxiosError } from 'axios';
import { ENDPOINTS } from '../endpoints';
import type { 
  LoginResponse, 
  LoginCredentials,
  RegisterRequest, 
  RegisterResponse, 
  ResetPasswordRequest, 
  VerifyEmailRequest, 
  SetupTwoFactorResponse,
  User,
  PatientProfile,
  ProviderProfile,
  CaregiverRequest,
  EmergencyAccessRecord,
  HipaaDocument,
  ConsentRecord,
  PharmcoProfile,
  ResearcherProfile,
  CaregiverProfile,
  ComplianceProfile
} from '@/types/auth.types';

import type { 
  UserFilters, 
  PaginatedUsersResponse, 
  AdminUserCreateData 
} from '@/types/admin.types';
import { authenticatedClient } from '../authenticated-client';
import { validateLoginResponse, validateUserResponse } from '../validation';


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

// NEW: Permission-related interfaces
interface UserPermissions {
  has_dashboard_access: boolean;
  has_approval_permissions: boolean;
  user_role: string;
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

/**
 * Makes resilient API requests with automatic retry logic for authentication timing issues
 */
const makeResilientRequest = async (requestFn: () => Promise<any>, maxRetries = 2) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      // Check if this is an authentication error that might be a timing issue
      if (error.response?.status === 401 && attempt < maxRetries) {
        // Wait briefly and retry - might be a timing issue
        await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
        continue;
      }
      // If it's not a retryable error, or we've exhausted retries, throw the error
      throw error;
    }
  }
};

export const authService = {
  // Helper method to get stored token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return makeResilientRequest(async () => {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
      
      if (!validateLoginResponse(response.data)) {
        throw new Error('Invalid login response format');
      }
      
      return response.data as LoginResponse;
    });
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
   * Profile Completion Methods
   */
  completePatientProfile: async (profileId: number, profileData: {
    medical_id?: string;
    blood_type?: string;
    allergies?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    primary_condition?: string;
    condition_diagnosis_date?: string;
  }): Promise<PatientProfile> => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.USERS.COMPLETE_PATIENT_PROFILE(profileId), 
        profileData
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      throw new Error(apiError.response?.data?.detail || 'Failed to complete patient profile');
    }
  },

  updatePatientConsent: async (profileId: number, consents: {
    medication_adherence_monitoring_consent: boolean;
    vitals_monitoring_consent: boolean;
    research_participation_consent: boolean;
  }): Promise<PatientProfile> => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.USERS.UPDATE_PATIENT_CONSENT(profileId),
        consents
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      throw new Error(apiError.response?.data?.detail || 'Failed to update patient consent');
    }
  },
  
  /**
   * Identity Verification Methods
   */
  initiateIdentityVerification: async (
    profileId: number, 
    method: 'E_SIGNATURE' | 'PROVIDER_VERIFICATION' | 'DOCUMENT_UPLOAD' | 'VIDEO_VERIFICATION'
  ): Promise<{ detail: string; method: string }> => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.USERS.INITIATE_IDENTITY_VERIFICATION(profileId),
        { method }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      throw new Error(apiError.response?.data?.detail || 'Failed to initiate identity verification');
    }
  },

  completeIdentityVerification: async (
    profileId: number,
    method: string
  ): Promise<{ detail: string; verified_at: string }> => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.USERS.COMPLETE_IDENTITY_VERIFICATION(profileId),
        { method }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      throw new Error(apiError.response?.data?.detail || 'Failed to complete identity verification');
    }
  },
  
  // Provider Profile Completion
  completeProviderProfile: async (profileId: number, profileData: {
    years_of_experience?: number;
    rare_condition_specialties?: string;
    telemedicine_available?: boolean;
  }): Promise<ProviderProfile> => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.USERS.COMPLETE_PROVIDER_PROFILE(profileId),
        profileData
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      throw new Error(apiError.response?.data?.detail || 'Failed to complete provider profile');
    }
  },
  
  completePharmcoProfile: async (profileId: number, profileData: {
    company_address?: string;
    monitored_medications?: string;
  }): Promise<PharmcoProfile> => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.USERS.COMPLETE_PHARMCO_PROFILE(profileId),
        profileData
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      throw new Error(apiError.response?.data?.detail || 'Failed to complete pharmco profile');
    }
  },
  
  completeCaregiverProfile: async (profileId: number, profileData: {
    authorization_documentation?: boolean;
    notes?: string;
  }): Promise<CaregiverProfile> => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.USERS.COMPLETE_CAREGIVER_PROFILE(profileId),
        profileData
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      throw new Error(apiError.response?.data?.detail || 'Failed to complete caregiver profile');
    }
  },

  completeResearcherProfile: async (profileId: number, profileData: {
    active_studies?: string;
  }): Promise<ResearcherProfile> => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.USERS.COMPLETE_RESEARCHER_PROFILE(profileId),
        profileData
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      throw new Error(apiError.response?.data?.detail || 'Failed to complete researcher profile');
    }
  },
  
  completeComplianceProfile: async (profileId: number, profileData: {
    certification_number?: string;
    certification_expiry?: string;
  }): Promise<ComplianceProfile> => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.USERS.COMPLETE_COMPLIANCE_PROFILE(profileId),
        profileData
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      throw new Error(apiError.response?.data?.detail || 'Failed to complete compliance profile');
    }
  },
  
  /**
   * Caregiver Request Management
   */
  getCaregiverRequests: async (params?: {
    status?: 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED';
    ordering?: string;
  }): Promise<CaregiverRequest[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      
      const response = await apiClient.get(
        `${ENDPOINTS.CAREGIVER_REQUESTS.LIST}?${queryParams}`
      );
      return extractDataFromResponse(response.data);
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      throw new Error(apiError.response?.data?.detail || 'Failed to fetch caregiver requests');
    }
  },

  approveCaregiverRequest: async (requestId: number): Promise<{ detail: string }> => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.CAREGIVER_REQUESTS.APPROVE(requestId)
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('Only the patient can approve this request');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to approve caregiver request');
    }
  },

  denyCaregiverRequest: async (requestId: number, reason?: string): Promise<{ detail: string }> => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.CAREGIVER_REQUESTS.DENY(requestId),
        { reason }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('Only the patient can deny this request');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to deny caregiver request');
    }
  },

  getCaregiverRequestDetails: async (requestId: number): Promise<CaregiverRequest> => {
    try {
      const response = await apiClient.get(ENDPOINTS.CAREGIVER_REQUESTS.DETAIL(requestId));
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 404) {
        throw new Error('Caregiver request not found');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to fetch caregiver request details');
    }
  },

  /**
   * Emergency Access System
   */
  initiateEmergencyAccess: async (emergencyData: {
    patient_identifier: string;
    reason: 'LIFE_THREATENING' | 'URGENT_CARE' | 'PATIENT_UNABLE' | 'IMMINENT_DANGER' | 'OTHER';
    detailed_reason: string;
  }): Promise<{ detail: string; access_id: number; expires_in: string }> => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.EMERGENCY_ACCESS.INITIATE,
        emergencyData
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('Only authorized personnel can initiate emergency access');
      }
      if (apiError.response?.status === 400) {
        throw new Error(apiError.response?.data?.detail || 'Too many recent requests or invalid reason');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to initiate emergency access');
    }
  },

  endEmergencyAccess: async (accessId: number, phiSummary: string): Promise<{ detail: string }> => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.EMERGENCY_ACCESS.END(accessId),
        { phi_accessed: phiSummary }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('Only the requester can end access');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to end emergency access');
    }
  },

  getEmergencyAccessRecords: async (filters?: {
    reason?: string;
    reviewed?: boolean;
    requester?: number;
    ordering?: string;
  }): Promise<EmergencyAccessRecord[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.reason) queryParams.append('reason', filters.reason);
      if (filters?.reviewed !== undefined) queryParams.append('reviewed', filters.reviewed.toString());
      if (filters?.requester) queryParams.append('requester', filters.requester.toString());
      if (filters?.ordering) queryParams.append('ordering', filters.ordering);
      
      const response = await apiClient.get(
        `${ENDPOINTS.EMERGENCY_ACCESS.LIST}?${queryParams}`
      );
      return extractDataFromResponse(response.data);
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('You do not have permission to view emergency access records');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to fetch emergency access records');
    }
  },

  reviewEmergencyAccess: async (
    accessId: number,
    reviewData: { notes: string; justified: boolean }
  ): Promise<{ detail: string }> => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.EMERGENCY_ACCESS.REVIEW(accessId),
        reviewData
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('Only compliance officers can review emergency access');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to review emergency access');
    }
  },

  getEmergencyAccessSummary: async (): Promise<{
    total_requests: number;
    pending_review: number;
    recent_requests: number;
    justified_access: number;
    unjustified_access: number;
    by_reason: Record<string, number>;
    active_sessions: number;
  }> => {
    try {
      const response = await apiClient.get(ENDPOINTS.COMPLIANCE.EMERGENCY_SUMMARY);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('Only compliance officers and admins can access emergency access summary');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to fetch emergency access summary');
    }
  },

  /**
   * HIPAA Document Management
   */
  getHipaaDocuments: async (filters?: {
    document_type?: string;
    active?: boolean;
    ordering?: string;
  }): Promise<HipaaDocument[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.document_type) queryParams.append('document_type', filters.document_type);
      if (filters?.active !== undefined) queryParams.append('active', filters.active.toString());
      if (filters?.ordering) queryParams.append('ordering', filters.ordering);
      
      const response = await apiClient.get(
        `${ENDPOINTS.HIPAA_DOCUMENTS.LIST}?${queryParams}`
      );
      return extractDataFromResponse(response.data);
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      throw new Error(apiError.response?.data?.detail || 'Failed to fetch HIPAA documents');
    }
  },

  getHipaaDocumentDetails: async (documentId: number): Promise<HipaaDocument> => {
    try {
      const response = await apiClient.get(ENDPOINTS.HIPAA_DOCUMENTS.DETAIL(documentId));
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 404) {
        throw new Error('HIPAA document not found');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to fetch HIPAA document details');
    }
  },

  getLatestHipaaDocuments: async (): Promise<HipaaDocument[]> => {
    try {
      const response = await apiClient.get(ENDPOINTS.HIPAA_DOCUMENTS.LATEST);
      return extractDataFromResponse(response.data);
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      throw new Error(apiError.response?.data?.detail || 'Failed to fetch latest HIPAA documents');
    }
  },

  signHipaaDocument: async (documentId: number): Promise<{
    detail: string;
    consent_id: number;
    signed_at: string;
  }> => {
    try {
      const response = await apiClient.post(ENDPOINTS.HIPAA_DOCUMENTS.SIGN(documentId));
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 400) {
        throw new Error(apiError.response?.data?.detail || 'You have already signed this document');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to sign document');
    }
  },

  /**
   * Consent Record Management
   */
  getConsentRecords: async (filters?: {
    consent_type?: string;
    consented?: boolean;
    revoked?: boolean;
    ordering?: string;
  }): Promise<ConsentRecord[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.consent_type) queryParams.append('consent_type', filters.consent_type);
      if (filters?.consented !== undefined) queryParams.append('consented', filters.consented.toString());
      if (filters?.revoked !== undefined) queryParams.append('revoked', filters.revoked.toString());
      if (filters?.ordering) queryParams.append('ordering', filters.ordering);
      
      const response = await apiClient.get(
        `${ENDPOINTS.CONSENT_RECORDS.LIST}?${queryParams}`
      );
      return extractDataFromResponse(response.data);
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('You do not have permission to view consent records');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to fetch consent records');
    }
  },

  getConsentAuditTrail: async (days?: number): Promise<{
    summary: {
      total_records: number;
      by_type: Record<string, number>;
      by_user_role: Record<string, number>;
      revoked_count: number;
    };
    records: ConsentRecord[];
    pagination: {
      count: number;
      next: string | null;
      previous: string | null;
    };
  }> => {
    try {
      const queryParams = days ? `?days=${days}` : '';
      const response = await apiClient.get(
        `${ENDPOINTS.COMPLIANCE.AUDIT_TRAIL}${queryParams}`
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('Only compliance officers and admins can access audit trails');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to fetch consent audit trail');
    }
  },

  /**
   * Check account status - aligns with backend endpoint
   */
  checkAccountStatus: async (email: string): Promise<CheckAccountStatusResponse> => {
    const response = await apiClient.get(`${ENDPOINTS.AUTH.CHECK_STATUS}?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  /**
   * NEW: Check approval permissions for current user
   */
  checkApprovalPermissions: async (): Promise<UserPermissions> => {
    try {
      const response = await apiClient.get('/approvals/permissions/');
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.detail || 'Failed to check permissions');
    }
  },

  getUserPermissions: async (): Promise<UserPermissions> => {
    return makeResilientRequest(async () => {
      const response = await authenticatedClient.get('/users/auth/me/permissions/');
      return response.data || response;
    });
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

  requestPhoneVerification: async (phoneNumber: string): Promise<{ detail: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REQUEST_PHONE_VERIFICATION, { phone_number: phoneNumber });
    return response.data;
  },

  verifyPhoneNumber: async (data: { phone_number: string; otp: string }): Promise<{ detail: string }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_PHONE, data);
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
    return makeResilientRequest(async () => {
      const response = await authenticatedClient.get('/users/auth/me/');
      return validateUserResponse(response) ? response : response.data || response;
    });
  },

  /**
   * MODIFIED: Admin functions - get pending approvals with permission handling
   */
  getPendingApprovals: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get(ENDPOINTS.USERS.PENDING_APPROVALS);
      // Handle both paginated and direct array responses
      return response.data.results || response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('You do not have permission to access this resource');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to fetch pending approvals');
    }
  },
  
  /**
   * MODIFIED: Approve user registration with permission handling
   */
  approveUser: async (userId: number): Promise<User> => {
    try {
      const response = await apiClient.post(ENDPOINTS.USERS.APPROVE_USER(userId));
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('You do not have permission to approve users');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to approve user');
    }
  },
  
  /**
   * MODIFIED: Reject user registration with permission handling
   */
  rejectUser: async (userId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(ENDPOINTS.USERS.USER_DETAIL(userId));
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('You do not have permission to reject users');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to reject user');
    }
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
   * Get all users with filtering and pagination - matches GET /users/
   */
  getUsers: async (params?: UserFilters): Promise<PaginatedUsersResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.role) queryParams.append('role', params.role);
      if (params?.is_approved !== undefined) queryParams.append('is_approved', params.is_approved.toString());
      if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
      if (params?.is_locked !== undefined) queryParams.append('is_locked', params.is_locked.toString());
      if (params?.verification_status) queryParams.append('verification_status', params.verification_status);
      if (params?.date_joined_after) queryParams.append('date_joined_after', params.date_joined_after);
      if (params?.date_joined_before) queryParams.append('date_joined_before', params.date_joined_before);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
            
      const response = await apiClient.get(`${ENDPOINTS.USERS.LIST}?${queryParams}`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('You do not have permission to access user list');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to fetch users');
    }
  },

  /**
   * Get specific user details - matches GET /users/{id}/
   */
  getUserDetails: async (userId: number): Promise<User> => {
    try {
      const response = await apiClient.get(ENDPOINTS.USERS.DETAIL(userId));
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('You do not have permission to view this user');
      }
      if (apiError.response?.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to fetch user details');
    }
  },

  /**
   * Update user information - matches PUT/PATCH /users/{id}/
   */
  updateUser: async (userId: number, userData: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.patch(ENDPOINTS.USERS.UPDATE(userId), userData);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('You do not have permission to modify this user');
      }
      if (apiError.response?.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to update user');
    }
  },

  /**
   * Create admin user - matches POST /users/create-admin/
   */
  createAdminUser: async (adminData: AdminUserCreateData): Promise<User> => {
    try {
      const response = await apiClient.post(ENDPOINTS.ADMIN.CREATE_ADMIN, adminData);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as AxiosError<{ detail?: string }>;
      if (apiError.response?.status === 403) {
        throw new Error('Only superusers can create admin accounts');
      }
      throw new Error(apiError.response?.data?.detail || 'Failed to create admin user');
    }
  },

  /**
   * Get dashboard statistics for admin
   */
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN.DASHBOARD_STATS);
    return response.data;
  },
  
    /**
   * Get user statistics for admin dashboard
   */
    getUserStats: async (): Promise<{
      total_users: number;
      users_by_role: Record<string, number>;
      recent_registrations: number;
      pending_approvals: number;
      locked_accounts: number;
      users_requiring_verification: number;
      new_users_last_7_days: number;
      active_users_today: number;
      inactive_users: number;
    }> => {

      const response = await apiClient.get(ENDPOINTS.ADMIN.USER_STATS);
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
    const response = await apiClient.post(ENDPOINTS.USERS.CHANGE_PASSWORD, {
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