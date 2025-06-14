// src/lib/api/endpoints.ts
/**
 * Centralized repository of API endpoints - ALIGNED WITH DEPLOYED BACKEND
 * These endpoints now match exactly what your deployed backend provides
 */
export const ENDPOINTS = {
  AUTH: {
    // Core authentication endpoints that match your backend documentation
    LOGIN: '/users/auth/login/',
    REGISTER: '/users/auth/register/',
    LOGOUT: '/users/auth/logout/',
    
    // Email verification endpoints
    VERIFY_EMAIL: '/users/auth/verify-email/',
    REQUEST_EMAIL_VERIFICATION: '/users/auth/request-verification/',
    
    // Password management endpoints
    FORGOT_PASSWORD: '/users/auth/forgot-password/',
    RESET_PASSWORD: '/users/auth/reset-password/',
    
    // Two-factor authentication endpoints
    SETUP_2FA: '/users/auth/setup-2fa/',
    CONFIRM_2FA: '/users/auth/confirm-2fa/',
    VERIFY_2FA: '/users/auth/verify-2fa/',
    DISABLE_2FA: '/users/auth/disable-2fa/',
    
    // Account status checking
    CHECK_STATUS: '/users/auth/check-status/',
    
    // REMOVED: REFRESH_TOKEN endpoint since your backend doesn't support token refresh
    // Your backend uses single long-lived tokens instead of the JWT access/refresh pattern
  },
  
  USERS: {
    // Current user information
    ME: '/users/auth/me/',
    
    // User management endpoints (for admins)
    USERS: '/users/users/',
    USER_DETAIL: (id: string | number) => `/users/users/${id}/`,
    APPROVE_USER: (id: string | number) => `/users/users/${id}/approve/`,
    PENDING_APPROVALS: '/users/users/pending-approvals/',
    
    // Profile endpoints organized by user type
    PATIENT_PROFILES: '/users/patient-profiles/',
    PATIENT_PROFILE: (id: string | number) => `/users/patient-profiles/${id}/`,
    COMPLETE_PATIENT_PROFILE: (id: string | number) => `/users/patient-profiles/${id}/complete/`,
    UPDATE_PATIENT_CONSENT: (id: string | number) => `/users/patient-profiles/${id}/update-consent/`,
    VERIFY_PATIENT_IDENTITY: (id: string | number) => `/users/patient-profiles/${id}/verify-identity/`,
    INITIATE_IDENTITY_VERIFICATION: (id: string | number) => `/users/patient-profiles/${id}/initiate-verification/`,
    COMPLETE_IDENTITY_VERIFICATION: (id: string | number) => `/users/patient-profiles/${id}/complete-verification/`,
    
    PROVIDER_PROFILES: '/users/provider-profiles/',
    PROVIDER_PROFILE: (id: string | number) => `/users/provider-profiles/${id}/`,
    COMPLETE_PROVIDER_PROFILE: (id: string | number) => `/users/provider-profiles/${id}/complete/`,
    
    PHARMCO_PROFILES: '/users/pharmco-profiles/',
    PHARMCO_PROFILE: (id: string | number) => `/users/pharmco-profiles/${id}/`,
    COMPLETE_PHARMCO_PROFILE: (id: string | number) => `/users/pharmco-profiles/${id}/complete/`,
    
    CAREGIVER_PROFILES: '/users/caregiver-profiles/',
    CAREGIVER_PROFILE: (id: string | number) => `/users/caregiver-profiles/${id}/`,
    COMPLETE_CAREGIVER_PROFILE: (id: string | number) => `/users/caregiver-profiles/${id}/complete/`,
    
    RESEARCHER_PROFILES: '/users/researcher-profiles/',
    RESEARCHER_PROFILE: (id: string | number) => `/users/researcher-profiles/${id}/`,
    COMPLETE_RESEARCHER_PROFILE: (id: string | number) => `/users/researcher-profiles/${id}/complete/`,
    VERIFY_RESEARCHER: (id: string | number) => `/users/researcher-profiles/${id}/verify/`,
    
    COMPLIANCE_PROFILES: '/users/compliance-profiles/',
    COMPLIANCE_PROFILE: (id: string | number) => `/users/compliance-profiles/${id}/`,
    COMPLETE_COMPLIANCE_PROFILE: (id: string | number) => `/users/compliance-profiles/${id}/complete/`,
  },
  
  // Administrative functions
  ADMIN: {
    BULK_APPROVE: '/users/admin/bulk-approve/',
    BULK_DENY: '/users/admin/bulk-deny/',
    DASHBOARD_STATS: '/users/admin/dashboard-stats/',
    CREATE_ADMIN: '/users/users/create-admin/',
  },
  
  // Caregiver request management
  CAREGIVER_REQUESTS: {
    LIST: '/users/caregiver-requests/',
    DETAIL: (id: string | number) => `/users/caregiver-requests/${id}/`,
    CREATE: '/users/caregiver-requests/',
    APPROVE: (id: string | number) => `/users/caregiver-requests/${id}/approve/`,
    DENY: (id: string | number) => `/users/caregiver-requests/${id}/deny/`,
  },
  
  // Emergency access for healthcare providers
  EMERGENCY_ACCESS: {
    LIST: '/users/emergency-access/',
    DETAIL: (id: string | number) => `/users/emergency-access/${id}/`,
    INITIATE: '/users/emergency-access/initiate/',
    END: (id: string | number) => `/users/emergency-access/${id}/end/`,
    REVIEW: (id: string | number) => `/users/emergency-access/${id}/review/`,
  },
  
  // HIPAA document management
  HIPAA_DOCUMENTS: {
    LIST: '/users/hipaa-documents/',
    DETAIL: (id: string | number) => `/users/hipaa-documents/${id}/`,
    LATEST: '/users/hipaa-documents/latest/',
    SIGN: (id: string | number) => `/users/hipaa-documents/${id}/sign/`,
  },
  
  // Consent record tracking
  CONSENT_RECORDS: {
    LIST: '/users/consent-records/',
    DETAIL: (id: string | number) => `/users/consent-records/${id}/`,
  },
  
  // Compliance and audit functions
  COMPLIANCE: {
    EMERGENCY_SUMMARY: '/users/compliance/emergency-summary/',
    AUDIT_TRAIL: '/users/compliance/audit-trail/',
  },
};

export default ENDPOINTS;
