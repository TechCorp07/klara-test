// src/lib/api/endpoints.ts
/**
 * API Endpoints for Klararety Healthcare Platform
 * Based on actual backend documentation
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const ENDPOINTS = {
  // Authentication endpoints - /users/auth/
  AUTH: {
    LOGIN: '/users/auth/login/',
    REGISTER: '/users/auth/register/',
    LOGOUT: '/users/auth/logout/',
    
    // Email verification and phone verification
    VERIFY_EMAIL: '/users/auth/verify-email/',
    REQUEST_EMAIL_VERIFICATION: '/users/auth/request-verification/',
    REQUEST_PHONE_VERIFICATION: '/users/auth/request-phone-verification/',
    VERIFY_PHONE: '/users/auth/verify-phonenumber/',
    
    // Password management
    CHANGE_PASSWORD: '/users/auth/change-password/',
    FORGOT_PASSWORD: '/users/auth/forgot-password/',
    RESET_PASSWORD: '/users/auth/reset-password/',
    
    // Two-factor authentication
    SETUP_2FA: '/users/auth/setup-2fa/',
    CONFIRM_2FA: '/users/auth/confirm-2fa/',
    VERIFY_2FA: '/users/auth/verify-2fa/',
    DISABLE_2FA: '/users/auth/disable-2fa/',
    REQUEST_2FA_EMAIL_BACKUP: '/users/auth/request-2fa-email-backup/',
    VERIFY_2FA_EMAIL_BACKUP: '/users/auth/verify-2fa-email-backup/',
    
    // Account status
    CHECK_STATUS: '/users/auth/check-status/',
    REFRESH_TOKEN: '/users/auth/refresh/',
    REFRESH_SESSION: '/users/auth/refresh-session/',
    ACTIVE_SESSIONS: '/users/auth/sessions/',
    TERMINATE_SESSION: '/users/auth/session/terminate/',
    TERMINATE_ALL_SESSIONS: '/users/auth/session/terminate-all/',
    ME: '/users/auth/me/',
  },

  // User management endpoints - /users/
  USERS: {
    // Basic user CRUD
    LIST: '/users/users/',
    DETAIL: (id: number) => `/users/users/${id}/`,
    UPDATE: (id: number) => `/users/users/${id}/`,
    DELETE: (id: number) => `/users/users/${id}/`,
    
    // Admin user operations
    APPROVE_USER: (id: number) => `/users/users/${id}/approve/`,
    REJECT_USER: (id: number) => `/users/users/${id}/reject/`,
    PENDING_APPROVALS: '/users/users/pending-approvals/',
    USER_DETAIL: (id: number) => `/users/users/${id}/`,
    USERS: '/users/users/', // Alias for LIST

    // Profile completion endpoints
    COMPLETE_PATIENT_PROFILE: (id: number) => `/users/patient-profiles/${id}/complete/`,
    UPDATE_PATIENT_CONSENT: (id: number) => `/users/patient-profiles/${id}/update-consent/`,
    INITIATE_IDENTITY_VERIFICATION: (id: number) => `/users/patient-profiles/${id}/initiate-verification/`,
    COMPLETE_IDENTITY_VERIFICATION: (id: number) => `/users/patient-profiles/${id}/complete-verification/`,
    COMPLETE_PROVIDER_PROFILE: (id: number) => `/users/provider-profiles/${id}/complete/`,
    COMPLETE_PHARMCO_PROFILE: (id: number) => `/users/pharmco-profiles/${id}/complete/`,
    COMPLETE_CAREGIVER_PROFILE: (id: number) => `/users/caregiver-profiles/${id}/complete/`,
    COMPLETE_RESEARCHER_PROFILE: (id: number) => `/users/researcher-profiles/${id}/complete/`,
    COMPLETE_COMPLIANCE_PROFILE: (id: number) => `/users/compliance-profiles/${id}/complete/`,
  },
  
  // Patient-specific endpoints
  PATIENT: {
    // Dashboard
    DASHBOARD: '/users/patient/dashboard/',
    
    // Profile management
    PROFILE: '/users/patient/profile/',
    UPDATE_PROFILE: '/users/patient-profiles/update/',
    UPLOAD_PROFILE_PHOTO: '/users/patient/upload-photo/',
    DELETE_PROFILE_PHOTO: '/users/patient/delete-photo/',
    
    // Medications
    MEDICATIONS: '/medication/prescriptions/',
    LOG_MEDICATION: (id: number) => `/medication/prescriptions/${id}/log/`,
    MEDICATION_ANALYTICS: '/medication/prescriptions/analytics/',
    MEDICATION_REMINDERS: '/medication/prescriptions/reminders/',
    MEDICATION_INSIGHTS: '/medication/prescriptions/insights/',
    MEDICATION_INTERACTIONS: '/medication/prescriptions/interactions/',
    MEDICATION_SCHEDULE: '/medication/prescriptions/schedule/',
    
    // Health Records endpoints
    HEALTH_RECORDS: '/healthcare/medical-records/',
    HEALTH_RECORDS_SUMMARY: '/healthcare/medical-records/summary/',
    HEALTH_RECORD_DETAIL: (id: number) => `/healthcare/medical-records/${id}/`,
    DOWNLOAD_RECORD: (recordId: number) => `/healthcare/medical-records/${recordId}/download/`,
    
    // Vital signs
    VITALS: '/users/patient/vitals_list/',
    VITALS_LATEST: '/users/patient/vitals/latest/',
    CONDITIONS: '/healthcare/conditions/',
    MEDICATIONS_HEALTHCARE: '/healthcare/medications/',
    LAB_RESULTS: '/healthcare/lab-tests/',
    VITAL_SIGNS_HEALTHCARE: '/healthcare/vital-signs/',
    ALLERGIES: '/healthcare/allergies/',
    FAMILY_HISTORY_HEALTHCARE: '/healthcare/family-history/',
    IMMUNIZATIONS: '/healthcare/immunizations/',
    TREATMENTS: '/healthcare/treatments/',
    
    // Wearable devices
    WEARABLE_DEVICES: '/users/patient/wearable-devices/',
    CONNECT_DEVICE: '/users/patient/wearable-devices/connect/',
    DISCONNECT_DEVICE: (id: number) => `/users/patient/wearable-devices/${id}/disconnect/`,
    
    // Appointments
    APPOINTMENTS: '/telemedicine/appointments/',
    REQUEST_APPOINTMENT: '/telemedicine/appointments/',
    CANCEL_APPOINTMENT: (id: number) => `/telemedicine/appointments/${id}/cancel/`,
    MESSAGE_PROVIDER: '/users/patient/send_message_to_provider/',
      
    // Health alerts
    ALERTS: '/users/patient/alerts/',
    ACKNOWLEDGE_ALERT: (id: number) => `/users/patient/alerts/${id}/acknowledge/`,
    
    // Research participation
    RESEARCH_STUDIES: '/users/patient/research/available-studies/',
    EXPRESS_RESEARCH_INTEREST: (id: number) => `/users/patient/research/studies/${id}/interest/`,
    
    // FHIR Data Exchange
    FHIR_EXPORT: '/users/patient/fhir/export/',
    FHIR_IMPORT_REQUEST: '/users/patient/fhir/import-request/',
    FHIR_EXPORTS_LIST: '/users/patient/fhir/exports/',
    FHIR_EXPORT_DOWNLOAD: (exportId: string) => `/users/patient/fhir/exports/${exportId}/download/`,
    FHIR_IMPORT_STATUS: (requestId: string) => `/users/patient/fhir/imports/${requestId}/status/`,
    
    // Family History
    FAMILY_HISTORY: '/users/patient/family-history/',
    ADD_FAMILY_MEMBER: '/users/patient/family-history/add/',
    UPDATE_FAMILY_MEMBER: (memberId: number) => `/users/patient/family-history/${memberId}/`,
    DELETE_FAMILY_MEMBER: (memberId: number) => `/users/patient/family-history/${memberId}/delete/`,
    GENETIC_ANALYSIS: '/users/patient/family-history/genetic-analysis/',
    
    // Telemedicine
    TELEMEDICINE_REQUEST: '/users/patient/telemedicine/request/',
    TELEMEDICINE_SESSIONS: '/users/patient/telemedicine/sessions/',
    TELEMEDICINE_JOIN: (sessionId: number) => `/users/patient/telemedicine/sessions/${sessionId}/join/`,
    TELEMEDICINE_TECH_CHECK: '/users/patient/telemedicine/tech-check/',
    TELEMEDICINE_CANCEL: (sessionId: number) => `/users/patient/telemedicine/sessions/${sessionId}/cancel/`,

    // Community/Chat Groups
    CHAT_GROUPS: '/community/groups/',
    JOIN_CHAT_GROUP: (id: number) => `/community/groups/${id}/join/`,
    LEAVE_CHAT_GROUP: (id: number) => `/community/groups/${id}/leave/`,
    CHAT_MESSAGES: (groupId: number) => `/community/posts/?group=${groupId}`,
    //SEND_MESSAGE: (groupId: number) => `/community/posts/`,
    GROUP_MEMBERS: (groupId: number) => `/community/groups/${groupId}/members/`,
    
    // Emergency Features
    EMERGENCY_NOTIFICATION: '/users/patient/emergency/notify/',
    EMERGENCY_CONTACTS: '/users/patient/emergency/contacts/',
    UPDATE_EMERGENCY_INFO: '/users/patient/emergency/update-info/',
    EMERGENCY_MEDICAL_ID: '/users/patient/emergency/medical-id/',

    // Communication/Messaging
    MESSAGES: '/users/patient/messages/',
    SEND_MESSAGE_TO_PROVIDER: (providerId: number) => `/users/patient/messages/providers/${providerId}/send/`,
    MESSAGE_THREAD: (threadId: number) => `/users/patient/messages/threads/${threadId}/`,
    MARK_MESSAGE_READ: (messageId: number) => `/users/patient/messages/${messageId}/read/`,

    // Preferences and settings
    PATIENT_PREFERENCES: '/users/patient/preferences/',
    UPDATE_PREFERENCES: '/users/patient/preferences/update/',
    NOTIFICATION_SETTINGS: '/users/patient/notifications/settings/',
    PRIVACY_SETTINGS: '/users/patient/privacy-settings/',
    NOTIFICATION_PREFERENCES: '/users/patient/notification-preferences/',
    PREFERENCES: '/users/patient/preferences/',

    // Security
    SECURITY_SETTINGS: '/users/patient/security-settings/',
    LOGIN_HISTORY: '/users/patient/login-history/',
    DEVICE_MANAGEMENT: '/users/patient/devices/',

    // Document Management
    MEDICAL_DOCUMENTS: '/users/patient/documents/',
    UPLOAD_DOCUMENT: '/users/patient/documents/upload/',
    DOWNLOAD_DOCUMENT: (docId: number) => `/users/patient/documents/${docId}/download/`,
    DELETE_DOCUMENT: (docId: number) => `/users/patient/documents/${docId}/delete/`,

    // Care Coordination
    CARE_PLAN: '/users/patient/care-plan/',
    CARE_GOALS: '/users/patient/care-plan/goals/',
    UPDATE_CARE_GOAL: (goalId: number) => `/users/patient/care-plan/goals/${goalId}/update/`,

    // Health Metrics & Analytics  
    HEALTH_SCORE: '/users/patient/health-score/',
    HEALTH_TRENDS: '/users/patient/health-trends/',
    MEDICATION_ADHERENCE_REPORT: '/users/patient/medications/adherence-report/',
    VITALS_TRENDS: '/users/patient/vitals/trends/',

    // Rare Disease Specific
    RARE_DISEASE_REGISTRY: '/users/patient/rare-disease/registry/',
    CONDITION_MONITORING: '/users/patient/rare-disease/monitoring/',
    SYMPTOM_TRACKER: '/users/patient/rare-disease/symptoms/',
    RARE_DISEASE_RESOURCES: '/users/patient/rare-disease/resources/',
  },
  
  // Admin-specific endpoints
  ADMIN: {
    // Dashboard & Statistics
    DASHBOARD_STATS: '/users/admin/dashboard-stats/',
    DASHBOARD_OVERVIEW: '/users/admin/dashboard-overview/',
    USER_STATS: '/users/admin/user-stats/',
    
    // User Management
    USERS_LIST: '/users/users/',
    USER_DETAIL: (id: number) => `/users/users/${id}/`,
    USER_APPROVE: (id: number) => `/users/users/${id}/approve/`,
    USER_REJECT: (id: number) => `/users/users/${id}/reject/`,
    USER_LOCK: (id: number) => `/users/users/${id}/lock/`,
    USER_UNLOCK: (id: number) => `/users/users/${id}/unlock/`,
    USER_ACTIVATE: (id: number) => `/users/users/${id}/activate/`,
    USER_DEACTIVATE: (id: number) => `/users/users/${id}/deactivate/`,
    USER_RESET_PASSWORD: (id: number) => `/users/users/${id}/reset-password/`,
    USER_ACTION_LOGS: (id: number) => `/users/users/${id}/action-logs/`,
    
    // Bulk Operations
    BULK_APPROVE: '/users/admin/bulk-approve/',
    BULK_DENY: '/users/admin/bulk-deny/',
    BULK_ACTIVATE: '/users/admin/bulk-activate/',
    BULK_DEACTIVATE: '/users/admin/bulk-deactivate/',
    BULK_LOCK: '/users/admin/bulk-lock/',
    BULK_UNLOCK: '/users/admin/bulk-unlock/',
    BULK_RESET_PASSWORD: '/users/admin/bulk-reset-password/',
    
    // System Health & Monitoring
    SYSTEM_HEALTH: '/users/admin/system-health/',
    SYSTEM_MONITORING: '/users/admin/monitoring/',
    PERFORMANCE_METRICS: '/users/admin/performance-metrics/',
    
    // Security & Compliance
    SECURITY_ALERTS: '/users/admin/security-alerts/',
    AUDIT_LOGS: '/users/admin/audit-logs/',
    AUDIT_EXPORT: '/users/admin/audit-logs/export/',
    
    // Admin User Creation
    CREATE_ADMIN: '/users/admin/create-admin/',
    
    // System Settings
    SYSTEM_SETTINGS: '/users/admin/system-settings/',
    UPDATE_SETTINGS: '/users/admin/system-settings/update/',
    MAINTENANCE_MODE: '/users/admin/system-settings/maintenance/',
    
    // Reports & Analytics
    ANALYTICS_DATA: '/users/admin/analytics/',
    USER_REPORTS: '/users/admin/reports/users/',
    SECURITY_REPORTS: '/users/admin/reports/security/',
    COMPLIANCE_REPORTS: '/users/admin/reports/compliance/',
    
    // Data Export
    EXPORT_USERS: '/users/admin/export/users/',
    EXPORT_AUDIT_LOGS: '/users/admin/export/audit-logs/',
    EXPORT_COMPLIANCE: '/users/admin/export/compliance/',
    EXPORT_STATUS: (jobId: string) => `/users/admin/export/status/${jobId}/`,
  },

  // Profile endpoints by user type
  PROFILES: {
    // Patient Profiles
    PATIENT_PROFILES: '/users/patient-profiles/',
    PATIENT_PROFILE: (id: number) => `/users/patient-profiles/${id}/`,
    COMPLETE_PATIENT_PROFILE: (id: number) => `/users/patient-profiles/${id}/complete/`,
    UPDATE_PATIENT_CONSENT: (id: number) => `/users/patient-profiles/${id}/update-consent/`,
    VERIFY_PATIENT_IDENTITY: (id: number) => `/users/patient-profiles/${id}/verify-identity/`,
    INITIATE_IDENTITY_VERIFICATION: (id: number) => `/users/patient-profiles/${id}/initiate-verification/`,
    COMPLETE_IDENTITY_VERIFICATION: (id: number) => `/users/patient-profiles/${id}/complete-verification/`,
    
    // Provider Profiles
    PROVIDER_PROFILES: '/users/provider-profiles/',
    PROVIDER_PROFILE: (id: number) => `/users/provider-profiles/${id}/`,
    COMPLETE_PROVIDER_PROFILE: (id: number) => `/users/provider-profiles/${id}/complete/`,
    
    // Pharmaceutical Company Profiles
    PHARMCO_PROFILES: '/users/pharmco-profiles/',
    PHARMCO_PROFILE: (id: number) => `/users/pharmco-profiles/${id}/`,
    COMPLETE_PHARMCO_PROFILE: (id: number) => `/users/pharmco-profiles/${id}/complete/`,
    
    // Caregiver Profiles
    CAREGIVER_PROFILES: '/users/caregiver-profiles/',
    CAREGIVER_PROFILE: (id: number) => `/users/caregiver-profiles/${id}/`,
    COMPLETE_CAREGIVER_PROFILE: (id: number) => `/users/caregiver-profiles/${id}/complete/`,
    
    // Researcher Profiles
    RESEARCHER_PROFILES: '/users/researcher-profiles/',
    RESEARCHER_PROFILE: (id: number) => `/users/researcher-profiles/${id}/`,
    COMPLETE_RESEARCHER_PROFILE: (id: number) => `/users/researcher-profiles/${id}/complete/`,
    VERIFY_RESEARCHER: (id: number) => `/users/researcher-profiles/${id}/verify/`,
    
    // Compliance Profiles
    COMPLIANCE_PROFILES: '/users/compliance-profiles/',
    COMPLIANCE_PROFILE: (id: number) => `/users/compliance-profiles/${id}/`,
    COMPLETE_COMPLIANCE_PROFILE: (id: number) => `/users/compliance-profiles/${id}/complete/`,
  },

  // Caregiver request management
  CAREGIVER_REQUESTS: {
    LIST: '/users/caregiver-requests/',
    DETAIL: (id: number) => `/users/caregiver-requests/${id}/`,
    APPROVE: (id: number) => `/users/caregiver-requests/${id}/approve/`,
    DENY: (id: number) => `/users/caregiver-requests/${id}/reject/`,
    REVOKE_ACCESS: (id: number) => `/users/caregiver-requests/${id}/revoke/`,
    PATIENT_CAREGIVERS: '/users/caregiver-requests/my-caregivers/',
  },

  // Emergency access management
  EMERGENCY_ACCESS: {
    LIST: '/users/emergency-access/',
    INITIATE: '/users/emergency-access/request/',
    GRANT: (id: number) => `/users/emergency-access/${id}/grant/`,
    END: (id: number) => `/users/emergency-access/${id}/end/`,
    REVIEW: (id: number) => `/users/emergency-access/${id}/review/`,
  },

  // HIPAA document management
  HIPAA_DOCUMENTS: {
    LIST: '/users/hipaa-documents/',
    DETAIL: (id: number) => `/users/hipaa-documents/${id}/`,
    LATEST: '/users/hipaa-documents/latest/',
    SIGN: (id: number) => `/users/hipaa-documents/${id}/sign/`,
  },

  // Consent record tracking
  CONSENT_RECORDS: {
    LIST: '/users/consent-records/',
    DETAIL: (id: number) => `/users/consent-records/${id}/`,
    CREATE: '/users/consent-records/',
    UPDATE: (id: number) => `/users/consent-records/${id}/`,
  },

  // Compliance and audit
  COMPLIANCE: {
    EMERGENCY_SUMMARY: '/users/compliance/emergency-summary/',
    AUDIT_TRAIL: '/users/compliance/audit-trail/',
    STATUS: '/users/compliance/status/',
    PRIVACY_POLICY: '/users/compliance/privacy-policy/',
    TERMS_OF_SERVICE: '/users/compliance/terms-of-service/',
  },

  // Other platform APIs
  HEALTHCARE: {
    BASE: '/healthcare/',
    // Add specific healthcare endpoints as needed
  },

  TELEMEDICINE: {
    APPOINTMENTS: '/telemedicine/appointments/',
    APPOINTMENT_DETAIL: (id: number) => `/telemedicine/appointments/${id}/`,
    SCHEDULE_APPOINTMENT: '/telemedicine/appointments/',
    CANCEL_APPOINTMENT: (id: number) => `/telemedicine/appointments/${id}/cancel/`,
    RESCHEDULE_APPOINTMENT: (id: number) => `/telemedicine/appointments/${id}/reschedule/`,
    UPCOMING_APPOINTMENTS: '/telemedicine/appointments/upcoming/',
    PAST_APPOINTMENTS: '/telemedicine/appointments/past/',
    DASHBOARD: '/telemedicine/appointments/dashboard/',
  },

  MEDICATION: {
    BASE: '/medication/',
    // Add specific medication endpoints as needed
  },

  WEARABLES: {
    BASE: '/wearables/',
    // Add specific wearables endpoints as needed
  },

  FHIR: {
    BASE: '/fhir/',
    // Add specific FHIR endpoints as needed
  },

  COMMUNICATION: {
    BASE: '/communication/',
    // Add specific communication endpoints as needed
  },

  COMMUNITY: {
    BASE: '/community/',
    // Add specific community endpoints as needed
  },

  AUDIT: {
    BASE: '/audit/',
    LOGS: '/audit/logs/',
    EXPORT: '/audit/export/',
  },

  REPORTS: {
    BASE: '/reports/',
    GENERATE: '/reports/generate/',
    DOWNLOAD: (id: string) => `/reports/${id}/download/`,
  },

  // JWT Token endpoints
  TOKEN: {
    REFRESH: '/token/refresh/',
    VERIFY: '/token/verify/',
  },

  // System endpoints
  SYSTEM: {
    STATUS: '/system/status/',
    HEALTH: '/system/health/',
    VERSION: '/system/version/',
    DOCS: '/docs/',
    REDOC: '/redoc/',
  },

  // File/Media endpoints
  MEDIA: {
    UPLOAD: '/media/upload/',
    DOWNLOAD: (id: string) => `/media/${id}/`,
    DELETE: (id: string) => `/media/${id}/delete/`,
  },

  // Search endpoints
  SEARCH: {
    GLOBAL: '/search/',
    USERS: '/search/users/',
    CONTENT: '/search/content/',
  },

  NOTIFICATIONS: {
    // Base endpoints (proxy to /api/communication/notifications/)
    BASE: '/communication/notifications',
    LIST: '/communication/notifications/',
    CREATE: '/communication/notifications/',
    
    // Individual notification endpoints
    DETAIL: (id: number) => `/communication/notifications/${id}/`,
    UPDATE: (id: number) => `/communication/notifications/${id}/`,
    DELETE: (id: number) => `/communication/notifications/${id}/`,
    MARK_AS_READ: (id: number) => `/communication/notifications/${id}/mark-read/`,
    
    // Query-based endpoints (use query parameters)
    UNREAD: '/communication/notifications/?read_at__isnull=true',
    BY_TYPE: (type: string) => `/communication/notifications/?notification_type=${type}`,
    BY_PRIORITY: (priority: string) => `/communication/notifications/?priority=${priority}`,
    RECENT: (days: number = 7) => `/communication/notifications/?days=${days}`,
    
    // Wearable notifications (proxy to enhanced endpoints)
    WEARABLE_ALERTS: '/users/notifications/wearable-alerts/',
    ANALYTICS: '/users/notifications/analytics/',
    
    // Bulk operations
    MARK_ALL_READ: '/communication/notifications/mark-all-read/',
    BULK_UPDATE: '/communication/notifications/bulk-update/',
    BULK_DELETE: '/communication/notifications/bulk-delete/',
    
    // Notification preferences (patient settings)
    PREFERENCES: '/communication/notifications/preferences/',
    UPDATE_PREFERENCES: '/communication/notifications/preferences/update/',
  },

  // Community notifications (separate from main notifications)
  COMMUNITY_NOTIFICATIONS: {
    BASE: '/community/notifications',
    LIST: '/community/notifications/',
    CREATE: '/community/notifications/',
    DETAIL: (id: number) => `/community/notifications/${id}/`,
  },
} as const;

// Helper functions for building URLs
export const buildApiUrl = (endpoint: string, baseUrl: string = API_BASE): string => {
  return `${baseUrl}${endpoint}`;
};

export const buildPaginatedUrl = (
  endpoint: string, 
  page: number = 1, 
  pageSize: number = 25,
  filters: Record<string, string | number | boolean | undefined> = {}
): string => {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    ...Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => 
        value !== null && value !== undefined && value !== ''
      ).map(([key, value]) => [key, (value ?? '').toString()])
    )
  });
  
  return `${endpoint}?${params.toString()}`;
};

export const buildQueryUrl = (
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {}
): string => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    ).map(([key, value]) => [key, (value ?? '').toString()])
  );
  
  if (Object.keys(filteredParams).length === 0) {
    return endpoint;
  }
  
  const queryString = new URLSearchParams(filteredParams).toString();
  return `${endpoint}?${queryString}`;
};

// Endpoint validation
export const validateEndpoint = (endpoint: string): boolean => {
  return endpoint.startsWith('/');
};

// Check if endpoint requires authentication
export const requiresAuth = (endpoint: string): boolean => {
  const publicEndpoints = [
    ENDPOINTS.AUTH.LOGIN,
    ENDPOINTS.AUTH.REGISTER,
    ENDPOINTS.AUTH.FORGOT_PASSWORD,
    ENDPOINTS.AUTH.RESET_PASSWORD,
    ENDPOINTS.AUTH.VERIFY_EMAIL,
    ENDPOINTS.SYSTEM.STATUS,
    ENDPOINTS.SYSTEM.HEALTH,
    ENDPOINTS.COMPLIANCE.PRIVACY_POLICY,
    ENDPOINTS.COMPLIANCE.TERMS_OF_SERVICE,
    ENDPOINTS.SYSTEM.DOCS,
    ENDPOINTS.SYSTEM.REDOC,
  ];
  
  return !publicEndpoints.some(publicEndpoint => publicEndpoint === endpoint);
};

// Check if endpoint requires admin access
export const requiresAdmin = (endpoint: string): boolean => {
  return endpoint.startsWith('/users/admin/') || endpoint.includes('/admin/');
};

// Check if endpoint requires specific role
export const getRequiredRole = (endpoint: string): string | null => {
  if (endpoint.startsWith('/users/admin/')) return 'admin';
  if (endpoint.startsWith('/users/compliance/')) return 'compliance';
  if (endpoint.startsWith('/users/caregiver-')) return 'caregiver';
  if (endpoint.startsWith('/users/provider-')) return 'provider';
  if (endpoint.startsWith('/users/researcher-')) return 'researcher';
  if (endpoint.startsWith('/users/pharmco-')) return 'pharmco';
  return null;
};

// Debug info for development
export const DEBUG_INFO = {
  API_BASE,
  NODE_ENV: process.env.NODE_ENV,
  ENDPOINTS_COUNT: Object.keys(ENDPOINTS).length,
};

export default ENDPOINTS;