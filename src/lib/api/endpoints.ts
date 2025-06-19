// src/lib/api/endpoints.ts
/**
 * Environment-aware API endpoints
 * Automatically adjusts for local vs production environment differences
 */

// Determine the correct API prefix based on environment
const getApiPrefix = (): string => {
  const baseUrl = process.env.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
  
  // If base URL already includes /api/, don't add it again
  if (baseUrl.includes('/api/')) {
    return '';
  }
  
  // If we're in development/local, likely need the /api/ prefix
  if (process.env.NODE_ENV === 'development' || baseUrl.includes('localhost')) {
    return '/api';
  }
  
  // Default to no prefix for production
  return '';
};

const API_PREFIX = getApiPrefix();

/**
 * Helper function to build endpoint URLs
 */
const buildEndpoint = (path: string): string => {
  return `${API_PREFIX}${path}`;
};

export const ENDPOINTS = {
  AUTH: {
    // Core authentication endpoints
    LOGIN: buildEndpoint('/users/auth/login/'),
    REGISTER: buildEndpoint('/users/auth/register/'),
    LOGOUT: buildEndpoint('/users/auth/logout/'),
    
    // Email verification endpoints
    VERIFY_EMAIL: buildEndpoint('/users/auth/verify-email/'),
    REQUEST_EMAIL_VERIFICATION: buildEndpoint('/users/auth/request-verification/'),
    
    // Password management endpoints
    FORGOT_PASSWORD: buildEndpoint('/users/auth/forgot-password/'),
    RESET_PASSWORD: buildEndpoint('/users/auth/reset-password/'),
    
    // Two-factor authentication endpoints
    SETUP_2FA: buildEndpoint('/users/auth/setup-2fa/'),
    CONFIRM_2FA: buildEndpoint('/users/auth/confirm-2fa/'),
    VERIFY_2FA: buildEndpoint('/users/auth/verify-2fa/'),
    DISABLE_2FA: buildEndpoint('/users/auth/disable-2fa/'),
    
    // Account status checking
    CHECK_STATUS: buildEndpoint('/users/auth/check-status/'),
  },
  
  USERS: {
    // Current user information
    ME: buildEndpoint('/users/auth/me/'),
    
    // User management endpoints (for admins)
    USERS: buildEndpoint('/users/users/'),
    USER_DETAIL: (id: string | number) => buildEndpoint(`/users/users/${id}/`),
    APPROVE_USER: (id: string | number) => buildEndpoint(`/users/users/${id}/approve/`),
    PENDING_APPROVALS: buildEndpoint('/users/users/pending-approvals/'),
    
    // Profile endpoints organized by user type
    PATIENT_PROFILES: buildEndpoint('/users/patient-profiles/'),
    PATIENT_PROFILE: (id: string | number) => buildEndpoint(`/users/patient-profiles/${id}/`),
    COMPLETE_PATIENT_PROFILE: (id: string | number) => buildEndpoint(`/users/patient-profiles/${id}/complete/`),
    UPDATE_PATIENT_CONSENT: (id: string | number) => buildEndpoint(`/users/patient-profiles/${id}/update-consent/`),
    VERIFY_PATIENT_IDENTITY: (id: string | number) => buildEndpoint(`/users/patient-profiles/${id}/verify-identity/`),
    INITIATE_IDENTITY_VERIFICATION: (id: string | number) => buildEndpoint(`/users/patient-profiles/${id}/initiate-verification/`),
    COMPLETE_IDENTITY_VERIFICATION: (id: string | number) => buildEndpoint(`/users/patient-profiles/${id}/complete-verification/`),
    
    PROVIDER_PROFILES: buildEndpoint('/users/provider-profiles/'),
    PROVIDER_PROFILE: (id: string | number) => buildEndpoint(`/users/provider-profiles/${id}/`),
    COMPLETE_PROVIDER_PROFILE: (id: string | number) => buildEndpoint(`/users/provider-profiles/${id}/complete/`),
    
    PHARMCO_PROFILES: buildEndpoint('/users/pharmco-profiles/'),
    PHARMCO_PROFILE: (id: string | number) => buildEndpoint(`/users/pharmco-profiles/${id}/`),
    COMPLETE_PHARMCO_PROFILE: (id: string | number) => buildEndpoint(`/users/pharmco-profiles/${id}/complete/`),
    
    CAREGIVER_PROFILES: buildEndpoint('/users/caregiver-profiles/'),
    CAREGIVER_PROFILE: (id: string | number) => buildEndpoint(`/users/caregiver-profiles/${id}/`),
    COMPLETE_CAREGIVER_PROFILE: (id: string | number) => buildEndpoint(`/users/caregiver-profiles/${id}/complete/`),
    
    RESEARCHER_PROFILES: buildEndpoint('/users/researcher-profiles/'),
    RESEARCHER_PROFILE: (id: string | number) => buildEndpoint(`/users/researcher-profiles/${id}/`),
    COMPLETE_RESEARCHER_PROFILE: (id: string | number) => buildEndpoint(`/users/researcher-profiles/${id}/complete/`),
    VERIFY_RESEARCHER: (id: string | number) => buildEndpoint(`/users/researcher-profiles/${id}/verify/`),
    
    COMPLIANCE_PROFILES: buildEndpoint('/users/compliance-profiles/'),
    COMPLIANCE_PROFILE: (id: string | number) => buildEndpoint(`/users/compliance-profiles/${id}/`),
    COMPLETE_COMPLIANCE_PROFILE: (id: string | number) => buildEndpoint(`/users/compliance-profiles/${id}/complete/`),
  },
  
  // Administrative functions
  ADMIN: {
    BULK_APPROVE: buildEndpoint('/users/admin/bulk-approve/'),
    BULK_DENY: buildEndpoint('/users/admin/bulk-deny/'),
    DASHBOARD_STATS: buildEndpoint('/users/admin/dashboard-stats/'),
    CREATE_ADMIN: buildEndpoint('/users/users/create-admin/'),
  },
  
  // Caregiver request management
  CAREGIVER_REQUESTS: {
    LIST: buildEndpoint('/users/caregiver-requests/'),
    DETAIL: (id: string | number) => buildEndpoint(`/users/caregiver-requests/${id}/`),
    CREATE: buildEndpoint('/users/caregiver-requests/'),
    APPROVE: (id: string | number) => buildEndpoint(`/users/caregiver-requests/${id}/approve/`),
    DENY: (id: string | number) => buildEndpoint(`/users/caregiver-requests/${id}/deny/`),
  },
  
  // Emergency access for healthcare providers
  EMERGENCY_ACCESS: {
    LIST: buildEndpoint('/users/emergency-access/'),
    DETAIL: (id: string | number) => buildEndpoint(`/users/emergency-access/${id}/`),
    INITIATE: buildEndpoint('/users/emergency-access/initiate/'),
    END: (id: string | number) => buildEndpoint(`/users/emergency-access/${id}/end/`),
    REVIEW: (id: string | number) => buildEndpoint(`/users/emergency-access/${id}/review/`),
  },
  
  // HIPAA document management
  HIPAA_DOCUMENTS: {
    LIST: buildEndpoint('/users/hipaa-documents/'),
    DETAIL: (id: string | number) => buildEndpoint(`/users/hipaa-documents/${id}/`),
    LATEST: buildEndpoint('/users/hipaa-documents/latest/'),
    SIGN: (id: string | number) => buildEndpoint(`/users/hipaa-documents/${id}/sign/`),
  },
  
  // Consent record tracking
  CONSENT_RECORDS: {
    LIST: buildEndpoint('/users/consent-records/'),
    DETAIL: (id: string | number) => buildEndpoint(`/users/consent-records/${id}/`),
  },
  
  // Compliance and audit functions
  COMPLIANCE: {
    EMERGENCY_SUMMARY: buildEndpoint('/users/compliance/emergency-summary/'),
    AUDIT_TRAIL: buildEndpoint('/users/compliance/audit-trail/'),
  },

  // Additional API endpoints based on your Django urls.py structure
  HEALTHCARE: {
    BASE: buildEndpoint('/healthcare/'),
  },

  TELEMEDICINE: {
    BASE: buildEndpoint('/telemedicine/'),
  },

  COMMUNICATION: {
    BASE: buildEndpoint('/communication/'),
  },

  WEARABLES: {
    BASE: buildEndpoint('/wearables/'),
  },

  MEDICATION: {
    BASE: buildEndpoint('/medication/'),
  },

  AUDIT: {
    BASE: buildEndpoint('/audit/'),
  },

  COMMUNITY: {
    BASE: buildEndpoint('/community/'),
  },

  FHIR: {
    BASE: buildEndpoint('/fhir/'),
  },

  REPORTS: {
    BASE: buildEndpoint('/reports/'),
  },

  // API Documentation endpoints
  DOCS: {
    SWAGGER: buildEndpoint('/docs/'),
    REDOC: buildEndpoint('/redoc/'),
  },
};

// Export the prefix for debugging
export const DEBUG_INFO = {
  API_PREFIX,
  BASE_URL: process.env.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'not set',
  NODE_ENV: process.env.NODE_ENV,
};

export default ENDPOINTS;