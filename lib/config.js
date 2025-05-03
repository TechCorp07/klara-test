/**
 * Configuration constants for the Klararety Healthcare Platform
 */

// Base URLs for different environments
export const BASE_URLS = {
  API: process.env.NEXT_PUBLIC_API_URL || "https://api.klararety.com/api",
  APP: process.env.NEXT_PUBLIC_APP_URL || "https://klararety.com",
  WEBSOCKET: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "wss://api.klararety.com/ws",
}

// API endpoints organized by service
export const API_ENDPOINTS = {
  // Users and Authentication
  USERS: {
    LOGIN: "auth/login",
    LOGOUT: "auth/logout",
    REGISTER: "auth/register",
    CURRENT_USER: "auth/me",
    USERS: "users/users/",
    USER: (id) => `users/users/${id}/`,
    APPROVE_USER: (id) => `users/users/${id}/approve/`,
    FORGOT_PASSWORD: "auth/forgot-password",
    RESET_PASSWORD: "auth/reset-password",
    VERIFY_EMAIL: "auth/verify-email",
    REQUEST_EMAIL_VERIFICATION: "auth/request-verification",
    SETUP_2FA: "auth/setup-2fa",
    CONFIRM_2FA: "auth/confirm-2fa",
    VERIFY_2FA: "auth/verify-2fa",
    DISABLE_2FA: "auth/disable-2fa",
    UPDATE_CONSENT: "auth/update-consent",
    PENDING_APPROVALS: "users/pending-approvals/",
    PATIENT_PROFILES: "users/patient-profiles/",
    PATIENT_PROFILE: (id) => `users/patient-profiles/${id}/`,
    PROVIDER_PROFILES: "users/provider-profiles/",
    PROVIDER_PROFILE: (id) => `users/provider-profiles/${id}/`,
    PATIENT_CONDITIONS: "users/patient-conditions/",
    CONSENT_LOGS: "users/consent-logs/",
  },

  // Token management
  TOKEN: {
    REFRESH: "token/refresh/",
  },

  // Healthcare
  HEALTHCARE: {
    MEDICAL_RECORDS: "/healthcare/medical-records/",
    MEDICAL_RECORD: (id) => `/healthcare/medical-records/${id}/`,
    CONDITIONS: "/healthcare/conditions/",
    CONDITION: (id) => `/healthcare/conditions/${id}/`,
    CONDITION_FLARES: "/healthcare/condition-flares/",
    SYMPTOMS: "/healthcare/symptoms/",
    ALLERGIES: "/healthcare/allergies/",
    MEDICATIONS: "/healthcare/medications/",
    MEDICATION_INTAKES: "/healthcare/medication-intakes/",
    IMMUNIZATIONS: "/healthcare/immunizations/",
    LAB_TESTS: "/healthcare/lab-tests/",
    LAB_RESULTS: "/healthcare/lab-results/",
    VITAL_SIGNS: "/healthcare/vital-signs/",
    TREATMENTS: "/healthcare/treatments/",
    FAMILY_HISTORY: "/healthcare/family-history/",
    HEALTH_DATA_CONSENTS: "/healthcare/health-data-consents/",
    AUDIT_LOGS: "/healthcare/audit-logs/",
    EHR_INTEGRATIONS: "/healthcare/ehr-integrations/",
    WEARABLE_INTEGRATIONS: "/healthcare/wearable-integrations/",
    RARE_CONDITIONS: "/healthcare/rare-conditions/",
    REFERRAL_NETWORK: "/healthcare/referral-network/",
  },

  // Telemedicine
  TELEMEDICINE: {
    APPOINTMENTS: "/telemedicine/appointments/",
    APPOINTMENT: (id) => `/telemedicine/appointments/${id}/`,
    CONSULTATIONS: "/telemedicine/consultations/",
    CONSULTATION: (id) => `/telemedicine/consultations/${id}/`,
    PRESCRIPTIONS: "/telemedicine/prescriptions/",
    AVAILABILITY: "/telemedicine/availability/",
    WAITING_ROOMS: "/telemedicine/waiting-rooms/",
    WAITING_ROOM_PATIENTS: "/telemedicine/waiting-room-patients/",
    CONSULTATION_NOTES: "/telemedicine/consultation-notes/",
  },

  // Medication
  MEDICATION: {
    MEDICATIONS: "/medication/medications/",
    MEDICATION: (id) => `/medication/medications/${id}/`,
    ADHERENCE: "/medication/adherence/",
    REMINDERS: "/medication/reminders/",
    INTERACTIONS: "/medication/interactions/",
    SIDE_EFFECTS: "/medication/side-effects/",
  },

  // Wearables
  WEARABLES: {
    INTEGRATIONS: "/wearables/integrations/",
    INTEGRATION: (id) => `/wearables/integrations/${id}/`,
    MEASUREMENTS: "/wearables/measurements/",
    CONNECT: "/wearables/connect/",
    CALLBACK: "/wearables/callback/",
    SYNC: "/wearables/sync/",
    MOBILE: {
      APPLE_HEALTH_SYNC: "/wearables/mobile/apple_health/sync/",
      SAMSUNG_HEALTH_SYNC: "/wearables/mobile/samsung_health/sync/",
    },
    AVAILABLE_DEVICES: "/wearables/available-devices/",
    USER_DEVICES: (userId) => `/wearables/user-devices/${userId}/`,
    CONNECT_DEVICE: "/wearables/connect-device/",
    DISCONNECT_DEVICE: (deviceId) => `/wearables/disconnect-device/${deviceId}/`,
    SYNC_DEVICE: (deviceId) => `/wearables/sync-device/${deviceId}/`,
    HEALTH_DATA: (userId) => `/wearables/health-data/${userId}/`,
    ANALYZE_HEALTH_DATA: "/wearables/analyze-health-data/",
  },

  // FHIR
  FHIR: {
    PATIENT: "/fhir/Patient/",
    PRACTITIONER: "/fhir/Practitioner/",
    ORGANIZATION: "/fhir/Organization/",
    OBSERVATION: "/fhir/Observation/",
    CONDITION: "/fhir/Condition/",
    MEDICATION_STATEMENT: "/fhir/MedicationStatement/",
    COMMUNICATION: "/fhir/Communication/",
    ENCOUNTER: "/fhir/Encounter/",
  },

  // Communication
  COMMUNICATION: {
    CONVERSATIONS: {
      BASE: "/communication/conversations/",
      CONVERSATION: (id) => `/communication/conversations/${id}/`,
      MESSAGES: (conversationId) => `/communication/conversations/${conversationId}/messages/`,
    },
    MESSAGES: {
      BASE: "/communication/messages/",
      MESSAGE: (id) => `/communication/messages/${id}/`,
    },
    NOTIFICATIONS: "/communication/notifications/",
    COMMUNITY: {
      FORUMS: "/communication/community/forums/",
      FORUM: (id) => `/communication/community/forums/${id}/`,
      THREADS: "/communication/community/threads/",
      THREAD: (id) => `/communication/community/threads/${id}/`,
      POSTS: (threadId) => `/communication/community/threads/${threadId}/posts/`,
      POST: (id) => `/communication/community/posts/${id}/`,
      MODERATION: {
        QUEUE: "/communication/community/moderation/queue/",
        APPROVE: (itemId) => `/communication/community/moderation/items/${itemId}/approve/`,
        REJECT: (itemId) => `/communication/community/moderation/items/${itemId}/reject/`,
      },
    },
  },

  // Community
  COMMUNITY: {
    GROUPS: "/community/groups/",
    GROUP: (id) => `/community/groups/${id}/`,
    MEMBERSHIPS: "/community/memberships/",
    POSTS: "/community/posts/",
    COMMENTS: "/community/comments/",
    EVENTS: "/community/events/",
    RESOURCES: "/community/resources/",
    NOTIFICATIONS: "/community/notifications/",
    ACCESSIBILITY: "/community/accessibility/",
  },

  // Audit
  AUDIT: {
    EVENTS: "/audit/events/",
    EVENTS_SUMMARY: "/audit/events/summary/",
    PHI_ACCESS: "/audit/phi-access/",
    PHI_ACCESS_SUMMARY: "/audit/phi-access/summary/",
    SECURITY: "/audit/security/",
    SECURITY_SUMMARY: "/audit/security/summary/",
    RESOLVE_SECURITY_INCIDENT: (id) => `/audit/security/${id}/resolve/`,
    REPORTS: "/audit/reports/",
    GENERATE_REPORT: "/audit/reports/generate/",
    EXPORTS: "/audit/exports/",
    EXPORT: (id) => `/audit/exports/${id}/`,
    COMPLIANCE_METRICS: "/audit/compliance/metrics/",
    RISK_ASSESSMENT: "/audit/compliance/risk-assessment/",
    DATA_SHARING: "/audit/compliance/data-sharing/",
    MINIMUM_NECESSARY: "/audit/compliance/minimum-necessary/",
    PATIENT_ACCESS: (patientId) => `/audit/compliance/patient-access/${patientId}/`,
    SYSTEM_STATS: "/audit/system-stats",
    LOGS: "/audit/logs",
    LOG: (logId) => `/audit/logs/${logId}`,
    COMPLIANCE_REPORT: "/audit/compliance-report",
  },

  // Security
  SECURITY: {
    SCANS: "/security/scans/",
    SCAN: (id) => `/security/scans/${id}/`,
    VULNERABILITY_ASSESSMENT: "/security/vulnerability-assessment/",
    VULNERABILITY_ASSESSMENT_DETAIL: (id) => `/security/vulnerability-assessment/${id}/`,
    AUTOMATION: {
      SCHEDULED_SCAN: "/security/automation/scheduled-scan/",
      CI_SCAN: "/security/automation/ci-scan/",
      PRE_DEPLOYMENT_SCAN: "/security/automation/pre-deployment-scan/",
    },
    VULNERABILITIES: "/security/vulnerabilities",
    VULNERABILITY_DETAILS: (id) => `/security/vulnerabilities/${id}`,
    METRICS: "/security/metrics",
    UPDATE_VULNERABILITY_STATUS: (id) => `/security/vulnerabilities/${id}/status`,
    CREATE_REMEDIATION_PLAN: (vulnerabilityId) => `/security/vulnerabilities/${vulnerabilityId}/remediation`,
    COMPLIANCE: "/security/compliance",
    COMPLIANCE_STATUS: (standard) => `/security/compliance/${standard}`,
  },

  // Reports
  REPORTS: {
    REPORT_CONFIGURATIONS: "/reports/report-configurations/",
    REPORTS: "/reports/reports/",
    DASHBOARDS: "/reports/dashboards/",
    DASHBOARD_WIDGETS: "/reports/dashboard-widgets/",
    ANALYTICS_METRICS: "/reports/analytics-metrics/",
    SCHEDULE_LOGS: "/reports/schedule-logs/",
    DATA_EXPORTS: "/reports/data-exports/",
    ANALYTICS: "/reports/analytics/",
    AI_ANALYSIS: "/reports/ai-analysis/",
  },
}

// Application routes
export const APP_ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
    REQUEST_VERIFICATION: "/auth/request-verification",
  },
  DASHBOARD: {
    BASE: "/dashboard",
    PATIENT: "/dashboard/patient",
    PROVIDER: "/dashboard/provider",
    ADMIN: "/dashboard/admin",
    COMPLIANCE: "/dashboard/compliance",
    CAREGIVER: "/dashboard/caregiver",
    PHARMCO: "/dashboard/pharmco",
    RESEARCHER: "/dashboard/researcher",
    SUPERADMIN: "/dashboard/superadmin",
  },
  APPOINTMENTS: "/appointments",
  MEDICAL_RECORDS: "/medical-records",
  MEDICATIONS: "/medications",
  MESSAGES: "/messages",
  HEALTH_TRACKING: "/health-tracking",
  COMMUNITY: {
    BASE: "/community",
    TOPICS: "/community/topics",
    MODERATION: "/community/moderation",
  },
  SETTINGS: "/settings",
  EHR: {
    PATIENT_VIEWER: "/ehr/patient-viewer",
    FHIR_EXPLORER: "/ehr/fhir-explorer",
  },
  TELEMEDICINE: "/telemedicine",
  MAINTENANCE: "/maintenance",
}

// Session timeout in minutes
export const SESSION_TIMEOUT_MINUTES = 30

// HIPAA compliance mode
export const HIPAA_COMPLIANCE_MODE = process.env.HIPAA_COMPLIANCE_MODE === "true"

// API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.klararety.com"

// App URL
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://klararety.com"

// WebSocket URL
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "wss://ws.klararety.com"

// Deployment environment
export const DEPLOYMENT_ENV = process.env.DEPLOYMENT_ENV || "development"

// Environment-specific configuration
export const ENV_CONFIG = {
  IS_PRODUCTION: process.env.DEPLOYMENT_ENV === "production",
  IS_DEVELOPMENT: process.env.DEPLOYMENT_ENV === "development",
  IS_STAGING: process.env.DEPLOYMENT_ENV === "staging",
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === "true",
}

// Feature flags
export const FEATURES = {
  ENABLE_TELEMEDICINE: true,
  ENABLE_WEARABLES: true,
  ENABLE_COMMUNITY: true,
  ENABLE_FHIR: true,
  ENABLE_AI_ANALYSIS: true,
}

export default {
  BASE_URLS,
  API_ENDPOINTS,
  ENV_CONFIG,
  FEATURES,
}
