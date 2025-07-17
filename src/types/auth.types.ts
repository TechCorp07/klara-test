// src/types/auth.types.ts

export type UserRole = 'patient' | 'provider' | 'pharmco' | 'caregiver' | 'researcher' | 'admin' | 'superadmin' | 'compliance';

export type EmergencyAccessReason = 'LIFE_THREATENING' | 'URGENT_CARE' | 'PATIENT_UNABLE' | 'IMMINENT_DANGER' | 'OTHER';

export type CaregiverRelationship = 'PARENT' | 'SPOUSE' | 'CHILD' | 'SIBLING' | 'GRANDPARENT' | 'GRANDCHILD' | 'FRIEND' | 'PROFESSIONAL_CAREGIVER' | 'LEGAL_GUARDIAN' | 'HEALTHCARE_PROXY' | 'OTHER_FAMILY' | 'OTHER';

export interface AdminPermissions {
  // Core admin permissions
  has_admin_access: boolean;
  has_user_management_access: boolean;
  has_system_settings_access: boolean;
  has_audit_access: boolean;
  has_compliance_access: boolean;
  has_export_access: boolean;
  has_dashboard_access: boolean;
  has_compliance_reports_access: boolean;
  has_approval_permissions: boolean;
  
  // Healthcare permissions
  has_patient_data_access: boolean;
  has_medical_records_access: boolean;
  can_manage_appointments: boolean;
  can_access_telemedicine: boolean;
  can_manage_medications: boolean;
  can_view_research_data: boolean;
  can_access_clinical_trials: boolean;
  
  // User permissions
  can_view_own_data: boolean;
  can_edit_own_profile: boolean;
  
  // Role info
  user_role: string;
  is_superadmin: boolean;
  
  // Optional profile-specific fields
  identity_verified?: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  is_approved: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  email_verified: boolean;
  two_factor_enabled: boolean;
  date_joined: string;
  last_login?: string;
  phone_number?: string;
  date_of_birth?: string;
  profile_image?: string;
  phone_verified: boolean;

  // ADD PERMISSIONS TO USER TYPE
  permissions?: AdminPermissions;

  // Role-specific profiles
  patient_profile?: PatientProfile;
  provider_profile?: ProviderProfile;
  pharmco_profile?: PharmcoProfile;
  caregiver_profile?: CaregiverProfile;
  researcher_profile?: ResearcherProfile;
  compliance_profile?: ComplianceProfile;

  // Additional fields
  days_until_verification_required?: number;
  pending_caregiver_requests?: CaregiverRequest[];
  profile?: string | null; 
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refresh_token?: string;
  user: User;
  requires_2fa: boolean;
  session?: {
    id: string;
    expires_at: string;
    created_at: string;
  };
  permissions?: Record<string, boolean>;
  tab_id?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
  tabId?: string;
}

export interface RefreshTokenResponse {
  token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  tab_id?: string;
}

export interface TabLogoutRequest {
  tabId?: string;
  logout_type?: 'tab_specific' | 'global';
}

export interface LogoutResponse {
  success: boolean;
  message: string;
  tab_id?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone_number?: string;
  date_of_birth?: string;
  
  // Provider-specific fields
  medical_license_number?: string;      // Maps to medical_license_number in backend
  specialty?: string;
  npi_number?: string;
  practice_name?: string;
  practice_address?: string;
  accepting_new_patients?: boolean;
  
  // Researcher-specific fields
  institution?: string;
  primary_research_area?: string;
  qualifications_background?: string;
  irb_approval_confirmed?: boolean;

  // Pharmaceutical company fields
  company_name?: string;
  company_role?: string;
  regulatory_id?: string;
  primary_research_focus?: string;      
  
  // Caregiver-specific fields
  relationship_to_patient?: string;
  caregiver_type?: string;
  patient_email?: string;
  
  // Compliance officer fields
  compliance_certification?: string;
  regulatory_experience?: string;
  organization?: string;
  job_title?: string;
  specialization_areas?: string;

    // Consent fields
    terms_accepted: boolean;
    hipaa_privacy_acknowledged: boolean;
    data_sharing_consent?: boolean;
    caregiver_authorization_acknowledged?: boolean;
    phi_handling_acknowledged?: boolean;
}

export interface RegisterResponse {
  user: User;
  message: string;
  requires_approval: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  password_confirm: string; 
}

/**
 * Email verification request
 */
export interface VerifyEmailRequest {
  token: string;
  email?: string;
}

export interface SetupTwoFactorResponse {
  qr_code: string;    
  secret_key: string; 
}

/**
 * FIXED: Consent update response interface
 */
export interface ConsentUpdateResponse {
  consent_type: string;
  consented: boolean;
  updated_at: string;
  user_id: number;
  version?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  verifyTwoFactor: (userId: string, code: string) => Promise<LoginResponse>; // FIXED: userId parameter
  setupTwoFactor: () => Promise<SetupTwoFactorResponse>;
  confirmTwoFactor: (code: string) => Promise<{ success: boolean; message: string }>;
  disableTwoFactor: (password: string) => Promise<{ success: boolean; message: string }>; // FIXED: password parameter
  requestPasswordReset: (email: string) => Promise<{ detail: string }>;
  resetPassword: (data: ResetPasswordRequest) => Promise<{ detail: string }>;
  requestEmailVerification: () => Promise<{ detail: string }>;
  verifyEmail: (data: VerifyEmailRequest) => Promise<{ detail: string }>;

  //Identity verification methods
  initiateIdentityVerification: (method: string) => Promise<{ detail: string; method: string }>;
  completeIdentityVerification: (method: string) => Promise<{ detail: string; verified_at: string }>;
  // Profile completion methods for all roles
  completePatientProfile: (profileData: Partial<PatientProfile>) => Promise<PatientProfile>;
  updatePatientConsent: (consents: {
    medication_adherence_monitoring_consent: boolean;
    vitals_monitoring_consent: boolean;
    research_participation_consent: boolean;
  }) => Promise<PatientProfile>;

  completeProviderProfile: (profileData: Partial<ProviderProfile>) => Promise<ProviderProfile>;
  completePharmcoProfile: (profileData: Partial<PharmcoProfile>) => Promise<PharmcoProfile>;
  completeCaregiverProfile: (profileData: Partial<CaregiverProfile>) => Promise<CaregiverProfile>;
  completeResearcherProfile: (profileData: Partial<ResearcherProfile>) => Promise<ResearcherProfile>;
  completeComplianceProfile: (profileData: Partial<ComplianceProfile>) => Promise<ComplianceProfile>;
  
  // Caregiver request management
  getCaregiverRequests: (params?: { status?: string; ordering?: string }) => Promise<CaregiverRequest[]>;
  approveCaregiverRequest: (requestId: number) => Promise<{ detail: string }>;
  denyCaregiverRequest: (requestId: number, reason?: string) => Promise<{ detail: string }>;
  getCaregiverRequestDetails: (requestId: number) => Promise<CaregiverRequest>;

  // HIPAA document management
  getHipaaDocuments: (filters?: { document_type?: string; active?: boolean }) => Promise<HipaaDocument[]>;
  getHipaaDocumentDetails: (documentId: number) => Promise<HipaaDocument>;
  getLatestHipaaDocuments: () => Promise<HipaaDocument[]>;
  signHipaaDocument: (documentId: number) => Promise<{ detail: string; consent_id: number; signed_at: string }>;
  
  // Consent record management
  getConsentRecords: (filters?: { consent_type?: string; consented?: boolean }) => Promise<ConsentRecord[]>;
  getConsentAuditTrail: (days?: number) => Promise<{
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
  }>;
  
  // Emergency access (for providers/compliance)
  initiateEmergencyAccess: (data: {
    patient_identifier: string;
    reason: string;
    detailed_reason: string;
  }) => Promise<{ detail: string; access_id: number; expires_in: string }>;
  endEmergencyAccess: (accessId: number, phiSummary: string) => Promise<{ detail: string }>;
  getEmergencyAccessRecords: (filters?: {
    reason?: string;
    reviewed?: boolean;
    requester?: number;
    ordering?: string;
  }) => Promise<EmergencyAccessRecord[]>;
  reviewEmergencyAccess: (accessId: number, reviewData: { notes: string; justified: boolean }) => Promise<{ detail: string }>;
  getEmergencyAccessSummary: () => Promise<{
    total_requests: number;
    pending_review: number;
    recent_requests: number;
    justified_access: number;
    unjustified_access: number;
    by_reason: Record<string, number>;
    active_sessions: number;
  }>;
  
  // Admin dashboard stats
  getDashboardStats: () => Promise<{
    total_users: number;
    pending_approvals: number;
    users_by_role: Record<string, number>;
    pending_caregiver_requests: number;
    unreviewed_emergency_access: number;
    recent_registrations: number;
    unverified_patients: number;
  }>;

  // Legacy consent update method (for backward compatibility)
  updateConsent: (consentType: string, consented: boolean) => Promise<ConsentUpdateResponse>;
}

export interface ApiError {
  detail?: string;
  field_errors?: Record<string, string[]>; // FIXED: Backend uses field_errors
  error?: {
    message?: string;
    details?: Record<string, string[]>;
  };
}

export interface ApiErrorResponse {
  error: ApiError;
  detail?: string;
  field_errors?: Record<string, string[]>;
}

/**
 * Common forms state interface
 */
export interface FormState {
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
}

/**
 * HIPAA consent types
 */
export interface ConsentUpdate {
  consent_type: string;
  consented: boolean;
}

/**
 * FIXED: Profile interfaces matching backend profile endpoints
 * These align with your backend's separate profile models for each role
 */
export interface PatientProfile {
  id: number;
  user: User;
  // Encrypted fields - values returned as decrypted strings
  medical_id?: string;
  blood_type?: string;
  allergies?: string;
  primary_condition?: string;
  condition_diagnosis_date?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  
  // Consent preferences with timestamps
  medication_adherence_monitoring_consent: boolean;
  medication_adherence_consent_date?: string;
  vitals_monitoring_consent: boolean;
  vitals_monitoring_consent_date?: string;
  research_participation_consent: boolean;
  research_consent_date?: string;
  
  // Identity verification (30-day requirement)
  identity_verified: boolean;
  identity_verification_date?: string;
  identity_verification_method?: string;
  verification_deadline_notified: boolean;
  first_login_date?: string;
  days_until_verification_required?: number;
}

export interface ProviderProfile {
  id: number;
  user: number;
  medical_license_number: string; // FIXED: Backend field name
  npi_number: string;
  specialty: string;
  practice_name: string;
  practice_address: string;
  accepting_new_patients?: boolean;
  years_of_experience?: number;
  rare_condition_specialties?: string;
  telemedicine_available?: boolean;
}

export interface PharmcoProfile {
  id: number;
  user: number;
  company_name: string;
  role_at_company: string; // FIXED: Backend field name
  regulatory_id: string;
  primary_research_focus: string; // FIXED: Backend field name
  company_address?: string;
  monitored_medications?: string;
}

export interface CaregiverProfile {
  id: number;
  user: number;
  relationship_to_patient: string;
  caregiver_type: string;
  authorization_documentation?: boolean;
  notes?: string;
}

export interface ResearcherProfile {
  id: number;
  user: number;
  institution: string;
  primary_research_area: string; // FIXED: Backend field name
  qualifications_background: string; // FIXED: Backend field name
  is_verified?: boolean;
  active_studies?: string;
}

export interface ComplianceProfile {
  id: number;
  user: number;
  organization: string;
  job_title: string;
  compliance_certification: string;
  primary_specialization: string; // FIXED: Backend field name
  regulatory_experience: string;
  certification_number?: string;
  certification_expiry?: string;
}

/**
 * ADDED: Additional interfaces for backend functionality
 */
// Caregiver Request Types
export interface CaregiverRequest {
  id: number;
  caregiver: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  patient: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  relationship: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED';
  requested_at: string;
  responded_at?: string;
  response_notes?: string;
  patient_notified: boolean;
  reminder_sent: boolean;
}

// Emergency Access Types
export interface EmergencyAccessRecord {
  id: number;
  requester: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  patient_identifier: string; // Encrypted in backend
  reason: 'LIFE_THREATENING' | 'URGENT_CARE' | 'PATIENT_UNABLE' | 'IMMINENT_DANGER' | 'OTHER';
  detailed_reason: string;
  requested_at: string;
  access_ended_at?: string;
  duration: string;
  is_active: boolean;
  reviewed: boolean;
  access_justified?: boolean;
  review_notes?: string;
  notifications_sent: boolean;
}

// HIPAA Document Types
export interface HipaaDocument {
  id: number;
  title: string;
  document_type: 'PRIVACY_NOTICE' | 'TERMS_OF_SERVICE' | 'PATIENT_RIGHTS' | 
                 'DATA_USE' | 'CAREGIVER_AGREEMENT' | 'RESEARCH_CONSENT';
  document_type_display: string;
  version: string;
  content: string; // Markdown or HTML
  effective_date: string;
  expiration_date?: string;
  active: boolean;
  created_at: string;
  created_by: {
    id: number;
    email: string;
  };
  checksum: string; // SHA-256 for integrity
  is_signed_by_user: boolean;
}

// Consent Record Types
export interface ConsentRecord {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  consent_type: 'TERMS_OF_SERVICE' | 'PRIVACY_NOTICE' | 'MEDICATION_MONITORING' | 
                'VITALS_MONITORING' | 'RESEARCH_PARTICIPATION' | 'DATA_SHARING' | 
                'CAREGIVER_ACCESS' | 'PHI_HANDLING' | 'IDENTITY_VERIFICATION';
  consent_type_display: string;
  consented: boolean;
  signature_timestamp: string;
  signature_ip?: string;
  signature_user_agent?: string;
  document_version?: string;
  document_checksum?: string;
  revoked: boolean;
  revoked_at?: string;
  revocation_reason?: string;
}

// Two Factor Device Types
export interface TwoFactorDevice {
  id: number;
  user: number;
  confirmed: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface ConsentAuditTrailResponse {
  summary: {
    total_records: number;
    by_type: Record<string, number>;
    by_user_role: Record<string, number>;
    revoked_count: number;
  };
  records: ConsentRecord[];          // already imported
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

export interface EmergencyAccessFilters {
  reason?: string;
  reviewed?: boolean;
  requester?: number;
  ordering?: string;
}

// Dashboard Stats Type (for admin)
export interface DashboardStatsResponse {
  total_users: number;
  pending_approvals: number;
  users_by_role: {
    patient: number;
    provider: number;
    caregiver: number;
    pharmco: number;
    researcher: number;
    compliance: number;
    admin: number;
  };
  pending_caregiver_requests: number;
  unreviewed_emergency_access: number;
  recent_registrations: number;
  unverified_patients: number;
}

// Emergency Access Summary (for compliance)
export interface EmergencyAccessSummary {
  total_requests: number;
  pending_review: number;
  recent_requests: number;
  justified_access: number;
  unjustified_access: number;
  by_reason: Record<string, number>;
  active_sessions: number;
}
