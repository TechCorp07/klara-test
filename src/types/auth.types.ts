// src/types/auth.types.ts

export type UserRole = 'patient' | 'provider' | 'pharmco' | 'caregiver' | 'researcher' | 'admin' | 'superadmin' | 'compliance';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  email_verified: boolean;
  two_factor_enabled?: boolean;
  profile_image?: string;
  is_approved?: boolean;
  date_of_birth?: string;
  phone_number?: string;
  date_joined: string;
  // Additional fields that might be returned by backend
  is_active?: boolean;
  last_login?: string;
}

/**
 * Login request - matches backend expectations
 */
export interface LoginRequest {
  username: string; // Backend expects 'username' field for email
  password: string;
}

export interface LoginResponse {
  token: string;  
  user: User;
  requires_2fa?: boolean;  
  verification_warning?: {
    message: string;
    type: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone_number?: string;
  date_of_birth?: string;
  terms_accepted: boolean;
  hipaa_privacy_acknowledged: boolean;
  
  // Provider-specific fields
  license_number?: string;      // Maps to medical_license_number in backend
  specialty?: string;
  npi_number?: string;
  practice_name?: string;
  practice_address?: string;
  
  // Researcher-specific fields
  institution?: string;
  research_area?: string;       // Maps to primary_research_area in backend
  qualifications?: string;      // Maps to qualifications_background in backend
  
  // Pharmaceutical company fields
  company_name?: string;
  company_role?: string;        // Maps to role_at_company in backend
  regulatory_id?: string;
  research_focus?: string;      // Maps to primary_research_focus in backend
  
  // Caregiver-specific fields
  relationship_to_patient?: string;
  caregiver_type?: string;
  patient_email?: string;
  
  // Compliance officer fields
  compliance_certification?: string;
  regulatory_experience?: string;
}

/**
 * FIXED: Registration response matching backend format
 */
export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  is_approved: boolean;
  email_verified: boolean;
  date_joined: string;
  message?: string; // Backend may include success message
}

/**
 * FIXED: Password reset request matching backend expectations
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
  password_confirm: string; // FIXED: Backend expects this exact field name
}

/**
 * Email verification request
 */
export interface VerifyEmailRequest {
  token: string;
  email?: string;
}

/**
 * MAJOR FIX: Two-factor authentication setup response
 * Backend returns "qr_code" and "secret_key", not "qr_code_url" and "secret"
 */
export interface SetupTwoFactorResponse {
  qr_code: string;    // FIXED: Backend returns "qr_code" (base64 image data)
  secret_key: string; // FIXED: Backend returns "secret_key" (manual entry code)
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

/**
 * CRITICAL FIX: AuthContextType interface updated for single-token system
 * Key changes:
 * - verifyTwoFactor now takes userId (number) instead of token (string)
 * - disableTwoFactor now takes password instead of 2FA code
 * - Removed refresh token methods
 */
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
  updateConsent: (consentType: string, consented: boolean) => Promise<ConsentUpdateResponse>;
}

/**
 * FIXED: Error interfaces matching backend response format
 * Your backend returns { "detail": "error message" } or { "field_errors": {...} }
 */
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
  user: number;
  medical_id?: string;
  blood_type?: string;
  allergies?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  primary_condition?: string;
  condition_diagnosis_date?: string;
  identity_verified?: boolean;
  // Consent fields
  medication_adherence_monitoring_consent?: boolean;
  vitals_monitoring_consent?: boolean;
  research_participation_consent?: boolean;
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
export interface CaregiverRequest {
  id: number;
  caregiver: number;
  patient_email: string;
  relationship: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED';
  requested_at: string;
  processed_at?: string;
}

export interface EmergencyAccessRecord {
  id: number;
  requester: number;
  patient_identifier: string;
  reason: 'LIFE_THREATENING' | 'URGENT_CARE' | 'PATIENT_UNABLE' | 'IMMINENT_DANGER' | 'OTHER';
  detailed_reason: string;
  requested_at: string;
  ended_at?: string;
  phi_accessed?: string;
  reviewed?: boolean;
  justified?: boolean;
  notes?: string;
}

export interface HipaaDocument {
  id: number;
  title: string;
  document_type: 'PRIVACY_NOTICE' | 'AUTHORIZATION' | 'CONSENT' | 'OTHER';
  version: string;
  content: string;
  effective_date: string;
  active: boolean;
  created_at: string;
}

export interface ConsentRecord {
  id: number;
  user: number;
  document: number;
  consent_type: string;
  consented: boolean;
  signature_timestamp: string;
  revoked?: boolean;
  revoked_at?: string;
}