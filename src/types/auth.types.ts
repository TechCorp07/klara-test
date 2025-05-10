// src/types/auth.types.ts
export type UserRole = 'patient' | 'provider' | 'pharmco' | 'caregiver' | 'researcher' | 'admin' | 'superadmin' | 'compliance';

export interface User {
  date_joined: any;
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
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  requires_two_factor?: boolean;
  temporary_token?: string;
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
  // For provider
  license_number?: string;
  specialty?: string;
  npi_number?: string;
  practice_name?: string;
  practice_address?: string;
  // For researcher
  institution?: string;
  research_area?: string;
  qualifications?: string;
  // For pharmaceutical company
  company_name?: string;
  company_role?: string;
  regulatory_id?: string;
  // For caregiver
  relationship_to_patient?: string;
  caregiver_type?: string;
  patient_email?: string;
  // For compliance
  compliance_certification?: string;
  regulatory_experience?: string;
}

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
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  password_confirm: string;
}

export interface VerifyEmailRequest {
  token: string;
  email?: string;
}

export interface SetupTwoFactorResponse {
  secret: string;
  qr_code_url: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  verifyTwoFactor: (token: string, code: string) => Promise<LoginResponse>;
  setupTwoFactor: () => Promise<SetupTwoFactorResponse>;
  confirmTwoFactor: (code: string) => Promise<{ success: boolean; message: string }>;
  disableTwoFactor: (code: string) => Promise<{ success: boolean; message: string }>;
  requestPasswordReset: (email: string) => Promise<{ detail: string }>;
  resetPassword: (data: ResetPasswordRequest) => Promise<{ detail: string }>;
  requestEmailVerification: () => Promise<{ detail: string }>;
  verifyEmail: (data: VerifyEmailRequest) => Promise<{ detail: string }>;
  updateConsent: (consentType: string, consented: boolean) => Promise<any>;
}

// Error interfaces
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  error: ApiError;
}

// Common form state types
export interface FormState {
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
}

// HIPAA consent types
export interface ConsentUpdate {
  consent_type: string;
  consented: boolean;
}

// Profile types for different roles
export interface PatientProfile {
  id: number;
  user: number;
  medical_history?: string;
  allergies?: string[];
  primary_provider?: number;
  insurance_provider?: string;
  insurance_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface ProviderProfile {
  id: number;
  user: number;
  license_number: string;
  specialty: string;
  npi_number: string;
  practice_name: string;
  practice_address: string;
  accepting_new_patients?: boolean;
  board_certifications?: string[];
}

export interface PharmcoProfile {
  id: number;
  user: number;
  company_name: string;
  company_role: string;
  regulatory_id: string;
  research_focus?: string[];
}

export interface CaregiverProfile {
  id: number;
  user: number;
  relationship_to_patient: string;
  caregiver_type: string;
  patients?: number[];
}

export interface ResearcherProfile {
  id: number;
  user: number;
  institution: string;
  research_area: string;
  qualifications: string;
  publications?: string[];
}

export interface ComplianceProfile {
  id: number;
  user: number;
  compliance_certification: string;
  regulatory_experience: string;
  specialization_areas?: string[];
}