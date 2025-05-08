// src/lib/api/endpoints.ts
import { config } from '@/lib/config';
/**
 * Centralized repository of API endpoints
 * This makes it easier to update endpoint paths in one place
 * and helps maintain consistency across the application
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/users/login/',
    REGISTER: '/users/users/',
    REFRESH_TOKEN: '/token/refresh/',
    LOGOUT: '/users/logout/',
    VERIFY_EMAIL: '/users/verify-email/',
    REQUEST_EMAIL_VERIFICATION: '/users/request-email-verification/',
    FORGOT_PASSWORD: '/users/forgot-password/',
    RESET_PASSWORD: '/users/reset-password/',
    SETUP_2FA: '/users/setup-2fa/',
    CONFIRM_2FA: '/users/confirm-2fa/',
    VERIFY_2FA: '/users/verify-2fa/',
    DISABLE_2FA: '/users/disable-2fa/',
    UPDATE_CONSENT: '/users/update-consent/',
  },
  USERS: {
    ME: '/users/me/',
    USERS: '/users/users/',
    USER_DETAIL: (id: string | number) => `/users/users/${id}/`,
    APPROVE_USER: (id: string | number) => `/users/users/${id}/approve/`,
    PENDING_APPROVALS: '/users/pending-approvals/',
    PATIENT_PROFILE: (id: string | number) => `/users/patient-profiles/${id}/`,
    PROVIDER_PROFILE: (id: string | number) => `/users/provider-profiles/${id}/`,
    PHARMCO_PROFILE: (id: string | number) => `/users/pharmco-profiles/${id}/`,
    CAREGIVER_PROFILE: (id: string | number) => `/users/caregiver-profiles/${id}/`,
    RESEARCHER_PROFILE: (id: string | number) => `/users/researcher-profiles/${id}/`,
    COMPLIANCE_PROFILE: (id: string | number) => `/users/compliance-profiles/${id}/`,
  },
  HEALTHCARE: {
    APPOINTMENTS: '/healthcare/appointments/',
    APPOINTMENT_DETAIL: (id: string | number) => `/healthcare/appointments/${id}/`,
    MEDICAL_RECORDS: '/healthcare/medical-records/',
    MEDICAL_RECORD_DETAIL: (id: string | number) => `/healthcare/medical-records/${id}/`,
    PRESCRIPTIONS: '/healthcare/prescriptions/',
    PRESCRIPTION_DETAIL: (id: string | number) => `/healthcare/prescriptions/${id}/`,
    LAB_RESULTS: '/healthcare/lab-results/',
    LAB_RESULT_DETAIL: (id: string | number) => `/healthcare/lab-results/${id}/`,
  },
  TELEMEDICINE: {
    SESSIONS: '/telemedicine/sessions/',
    SESSION_DETAIL: (id: string | number) => `/telemedicine/sessions/${id}/`,
    AVAILABILITY: '/telemedicine/availability/',
    INITIATE_SESSION: '/telemedicine/initiate-session/',
  },
  MESSAGING: {
    THREADS: '/messaging/threads/',
    THREAD_DETAIL: (id: string | number) => `/messaging/threads/${id}/`,
    MESSAGES: (threadId: string | number) => `/messaging/threads/${threadId}/messages/`,
    SEND_MESSAGE: (threadId: string | number) => `/messaging/threads/${threadId}/messages/`,
  },
  NOTIFICATIONS: {
    LIST: '/notifications/',
    MARK_READ: (id: string | number) => `/notifications/${id}/read/`,
    PREFERENCES: '/notifications/preferences/',
  },
  CONSENTS: {
    LIST: '/consents/',
    DETAIL: (id: string | number) => `/consents/${id}/`,
    UPDATE: (id: string | number) => `/consents/${id}/update/`,
  }
};

export default ENDPOINTS;