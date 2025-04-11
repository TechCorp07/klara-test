// Core dependencies
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

// --------------------------------------------------
// Constants & helpers
// --------------------------------------------------
const ACCESS_TOKEN_MAX_AGE = Number.parseInt(process.env.ACCESS_TOKEN_MAX_AGE || '900', 10); // 15 min
const REFRESH_TOKEN_MAX_AGE = Number.parseInt(process.env.REFRESH_TOKEN_MAX_AGE || '604800', 10); // 7 days

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user';
const isBrowser = () => typeof window !== 'undefined';

const buildParams = (obj = {}) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) p.append(k, v);
  });
  return p;
};

// --------------------------------------------------
// Local‑storage helpers
// --------------------------------------------------
export const getAccessToken = () => (isBrowser() ? localStorage.getItem(ACCESS_TOKEN_KEY) : null);
export const getRefreshToken = () => (isBrowser() ? localStorage.getItem(REFRESH_TOKEN_KEY) : null);
export const getUser        = () => {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USER_DATA_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setTokens = (access, refresh = null) => {
  if (!isBrowser()) return;
  if (access)   localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh)  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  if (window.authTimeout) clearTimeout(window.authTimeout);
  window.authTimeout = setTimeout(refreshAccessToken, ACCESS_TOKEN_MAX_AGE * 1000 - 60_000);
};

export const setUser = (data) => {
  if (isBrowser() && data) localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
};

export const clearAuth = () => {
  if (!isBrowser()) return;
  [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY].forEach(localStorage.removeItem.bind(localStorage));
  if (window.authTimeout) clearTimeout(window.authTimeout);
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    return exp < Date.now() / 1000;
  } catch (err) {
    console.error('Token decode error', err);
    return true;
  }
};

export const isAuthenticated = () => !!(getAccessToken() && getRefreshToken() && getUser());
export const hasRole    = (role)        => getUser()?.role === role;
export const hasAnyRole = (roles = [])  => roles.includes(getUser()?.role);

// --------------------------------------------------
// Axios instance & interceptors
// --------------------------------------------------
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.klararety.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const refreshAccessToken = async () => {
  try {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error('No refresh token');

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) throw new Error('Refresh failed');
    const { access } = await res.json();
    setTokens(access); // keep existing refresh token
    return access;
  } catch (err) {
    console.error(err);
    logout();
    return null;
  }
};

api.interceptors.request.use(async (config) => {
  let token = getAccessToken();
  if (token && isTokenExpired(token)) token = await refreshAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const { response } = error;
    if (!response) return Promise.reject(error);

    if (response.status === 401 && !error.config?.skipAuthRefresh) {
      clearAuth();
      toast.error('Your session has expired. Please log in again.');
      if (isBrowser() && !window.location.pathname.includes('/login')) window.location.href = '/login';
    }

    if (response.status >= 500) toast.error('A server error occurred. Please try again later.');

    const msg = response.data?.message || response.data?.detail || 'An error occurred';
    if (response.data?.details) {
      const detail = Object.entries(response.data.details)
        .map(([f, errs]) => `${f}: ${errs.join(', ')}`)
        .join('; ');
      toast.error(`${msg}: ${detail}`);
    } else {
      toast.error(msg);
    }

    return Promise.reject(error);
  }
);

// --------------------------------------------------
// AUTH MODULE
// --------------------------------------------------
export const auth = {
  login: async (credentials) => {
    const { data } = await api.post('/users/login/', credentials);
    if (data.two_factor_required) return data;
    setTokens(data.access, data.refresh);
    setUser(data.user);
    return data;
  },
  verify2FA: async (token, code) => {
    const { data } = await api.post('/users/verify-2fa/', { token, code });
    if (data.access) { setTokens(data.access, data.refresh); setUser(data.user); }
    return data;
  },
  register:        (d) => api.post('/users/users/', d).then((r) => r.data),
  logout:          async () => { try { await api.post('/users/logout/'); } catch (_) {} clearAuth(); if (isBrowser() && !window.location.pathname.includes('/login')) window.location.href = '/login'; },
  getMe:           () => api.get('/users/me/').then((r) => { setUser(r.data); return r.data; }),
  updateMe:        (d) => api.patch('/users/me/', d).then((r) => { setUser(r.data); return r.data; }),
  setup2FA:        () => api.post('/users/setup-2fa/').then((r) => r.data),
  confirm2FA:      (code) => api.post('/users/confirm-2fa/', { code }).then((r) => r.data),
  disable2FA:      (code) => api.post('/users/disable-2fa/', { code }).then((r) => r.data),
  updateConsent:   (type, consented) => api.post('/users/update-consent/', { consent_type: type, consented }).then((r) => r.data),
  refreshToken:    async () => { const refresh = getRefreshToken(); if (!refresh) throw new Error('No refresh token'); const { data } = await axios.post(`${API_URL}/token/refresh/`, { refresh }, { skipAuthRefresh: true }); setTokens(data.access, refresh); return data.access; },
};

// --------------------------------------------------
// WEARABLES MODULE (legacy + new paths)
// --------------------------------------------------
export const wearables = {
  // Withings (legacy/new)
  getWithingsProfile: async () => {
    try { return (await api.get('/health-devices/withings/profile/')).data; }
    catch (e) {
      if (e.response?.status === 404) return null;
      return (await api.get('/wearables/withings/profile/')).data;
    }
  },
  connectWithings: async () => {
    try { return (await api.get('/health-devices/withings/connect/')).data; }
    catch { return (await api.get('/wearables/connect/')).data; }
  },
  fetchWithingsData: async (start, end) => {
    const p = new URLSearchParams();
    if (start) p.append('start_date', start);
    if (end)   p.append('end_date', end);
    try { return (await api.get(`/health-devices/withings/fetch-data/?${p}`)).data; }
    catch { return (await api.get(`/wearables/withings/fetch-data/?${p}`)).data; }
  },
  disconnectWithings: async () => {
    try { return (await api.post('/health-devices/withings/disconnect/')).data; }
    catch { return (await api.post('/wearables/disconnect/')).data; }
  },

  // Generic health‑device helpers
  getDevices:          ()                => api.get('/health-devices/').then((r) => r.data),
  getDevice:           (id)              => api.get(`/health-devices/${id}/`).then((r) => r.data),
  registerDevice:      (d)               => api.post('/health-devices/', d).then((r) => r.data),
  updateDevice:        (id, d)           => api.patch(`/health-devices/${id}/`, d).then((r) => r.data),
  deleteDevice:        (id)              => api.delete(`/health-devices/${id}/`).then((r) => r.data),
  getDeviceStatus:     (id)              => api.get(`/health-devices/${id}/status/`).then((r) => r.data),
  syncDevice:          (id)              => api.post(`/health-devices/${id}/sync/`).then((r) => r.data),

  // Measurements
  getMeasurements:     (opts = {})       => {
    const p = new URLSearchParams();
    Object.entries(opts).forEach(([k, v]) => { if (v !== undefined && v !== null) p.append(k, v); });
    return api.get(`/health-devices/measurements/?${p}`).then((r) => r.data).catch(() => api.get(`/wearables/measurements/?${p}`).then((r) => r.data));
  },
  getMeasurementsByType: (type, opts = {}) => wearables.getMeasurements({ ...opts, type }),

  // Integrations / analytics / mobile sync
  getIntegrations:     () => api.get('/health-devices/integrations/').then((r) => r.data).catch(() => api.get('/wearables/integrations/').then((r) => r.data)),
  getIntegrationConfig:(provider) => api.get(`/health-devices/integrations/${provider}/config/`).then((r) => r.data).catch(() => api.get(`/wearables/integrations/${provider}/config/`).then((r) => r.data)),
  getHealthSummary:    (start, end) => {
    const p = new URLSearchParams(); if (start) p.append('start_date', start); if (end) p.append('end_date', end);
    return api.get(`/health-devices/summary/?${p}`).then((r) => r.data);
  },
  getTrends:           (type, opts = {}) => {
    const p = new URLSearchParams({ type, ...opts });
    return api.get(`/health-devices/trends/?${p}`).then((r) => r.data);
  },
  syncAppleHealth:     (m) => api.post('/wearables/mobile/apple_health/sync/', { measurements: m }).then((r) => r.data).catch(() => api.post('/health-devices/mobile/apple_health/sync/', { measurements: m }).then((r) => r.data)),
  syncSamsungHealth:   (m) => api.post('/wearables/mobile/samsung_health/sync/', { measurements: m }).then((r) => r.data).catch(() => api.post('/health-devices/mobile/samsung_health/sync/', { measurements: m }).then((r) => r.data)),
  getInsights:         () => api.get('/health-devices/insights/').then((r) => r.data).catch(() => api.get('/wearables/insights/').then((r) => r.data)),
  getRecommendations:  () => api.get('/health-devices/recommendations/').then((r) => r.data).catch(() => api.get('/wearables/recommendations/').then((r) => r.data)),
};

// --------------------------------------------------
// Healthcare (clinical) endpoints
// --------------------------------------------------
export const healthcare = {
  // Medical records
  getMedicalRecord:  (id)       => api.get(`/healthcare/medical-records/${id}/`).then((r) => r.data),
  getMedicalRecords: (f = {})   => api.get(`/healthcare/medical-records/?${buildParams(f)}`).then((r) => r.data),
  createMedicalRecord: (d)      => api.post('/healthcare/medical-records/', d).then((r) => r.data),
  updateMedicalRecord: (id, d)  => api.put(`/healthcare/medical-records/${id}/`, d).then((r) => r.data),
  deleteMedicalRecord: (id)     => api.delete(`/healthcare/medical-records/${id}/`).then((r) => r.data),

  // Conditions / Allergies / Immunizations / Labs / Vital‑signs / Rare‑conditions
  getConditions:     (f = {})   => api.get(`/healthcare/conditions/?${buildParams(f)}`).then((r) => r.data),
  getCondition:      (id)       => api.get(`/healthcare/conditions/${id}/`).then((r) => r.data),
  createCondition:   (d)        => api.post('/healthcare/conditions/', d).then((r) => r.data),
  updateCondition:   (id, d)    => api.put(`/healthcare/conditions/${id}/`, d).then((r) => r.data),
  deleteCondition:   (id)       => api.delete(`/healthcare/conditions/${id}/`).then((r) => r.data),

  getAllergies:      (f = {})   => api.get(`/healthcare/allergies/?${buildParams(f)}`).then((r) => r.data),
  getImmunizations:  (f = {})   => api.get(`/healthcare/immunizations/?${buildParams(f)}`).then((r) => r.data),

  getLabTests:       (f = {})   => api.get(`/healthcare/lab-tests/?${buildParams(f)}`).then((r) => r.data),
  getLabTest:        (id)       => api.get(`/healthcare/lab-tests/${id}/`).then((r) => r.data),
  getLabResults:     (f = {})   => api.get(`/healthcare/lab-results/?${buildParams(f)}`).then((r) => r.data),

  getVitalSigns:     (f = {})   => api.get(`/healthcare/vital-signs/?${buildParams(f)}`).then((r) => r.data),

  getRareConditions: (f = {})   => api.get(`/healthcare/rare-conditions/?${buildParams(f)}`).then((r) => r.data),
  getRareCondition:  (id)       => api.get(`/healthcare/rare-conditions/${id}/`).then((r) => r.data),
};

// --------------------------------------------------
// Medication / prescription endpoints
// --------------------------------------------------
export const medication = {
  getMedication:       (id)       => api.get(`/healthcare/medications/${id}/`).then((r) => r.data),
  getMedications:      (mrId, o = {}) => {
    const p = buildParams({ ...o, medical_record: mrId });
    return api.get(`/healthcare/medications/?${p}`).then((r) => r.data);
  },
  createMedication:    (d)        => api.post('/healthcare/medications/', d).then((r) => r.data),
  updateMedication:    (id, d)    => api.patch(`/healthcare/medications/${id}/`, d).then((r) => r.data),
  deleteMedication:    (id)       => api.delete(`/healthcare/medications/${id}/`).then((r) => r.data),

  // Prescriptions
  getPrescriptions:    (o = {})   => api.get(`/prescriptions/?${buildParams(o)}`).then((r) => r.data),
  getPrescription:     (id)       => api.get(`/prescriptions/${id}/`).then((r) => r.data),
  createPrescription:  (d)        => api.post('/prescriptions/', d).then((r) => r.data),
  updatePrescription:  (id, d)    => api.patch(`/prescriptions/${id}/`, d).then((r) => r.data),

  // Medication intake / reminders
  getMedicationIntakes:   (f = {}) => api.get(`/medication/intakes/?${buildParams(f)}`).then((r) => r.data),
  createMedicationIntake: (d)      => api.post('/medication/intakes/', d).then((r) => r.data),
  updateMedicationIntake: (id, d)  => api.patch(`/medication/intakes/${id}/`, d).then((r) => r.data),

  getMedicationReminders:  (f = {}) => api.get(`/medication/reminders/?${buildParams(f)}`).then((r) => r.data),
  createMedicationReminder: (d)      => api.post('/medication/reminders/', d).then((r) => r.data),
  updateMedicationReminder: (id, d)  => api.patch(`/medication/reminders/${id}/`, d).then((r) => r.data),
  deleteMedicationReminder: (id)     => api.delete(`/medication/reminders/${id}/`).then((r) => r.data),
};

// --------------------------------------------------
// Communication / community endpoints
// --------------------------------------------------
export const communication = {
  // Conversations & messages
  getConversations:         ()                => api.get('/communication/conversations/').then((r) => r.data),
  getConversation:          (id)              => api.get(`/communication/conversations/${id}/`).then((r) => r.data),
  createConversation:       (d)               => api.post('/communication/conversations/', d).then((r) => r.data),
  markConversationAsRead:   (id)              => api.post(`/communication/conversations/${id}/mark_read/`).then((r) => r.data),
  getMessages:              (convId)          => api.get(`/communication/conversations/${convId}/messages/`).then((r) => r.data),
  sendMessage:              (d)               => api.post('/communication/messages/', d).then((r) => r.data),

  // Notifications
  getNotifications:         (o = {})          => api.get(`/communication/notifications/?${buildParams(o)}`).then((r) => r.data),
  getUnreadNotifications:   ()                => api.get('/communication/notifications/unread/').then((r) => r.data),
  markNotificationAsRead:   (id)              => api.post(`/communication/notifications/${id}/mark_read/`).then((r) => r.data),
  markAllNotificationsAsRead:()               => api.post('/communication/notifications/mark_all_read/').then((r) => r.data),
  deleteNotification:       (id)              => api.delete(`/communication/notifications/${id}/`).then((r) => r.data),
  getNotificationSettings:  ()                => api.get('/communication/settings/').then((r) => r.data),
  updateNotificationSettings:(d)              => api.patch('/communication/settings/', d).then((r) => r.data),

  // Community posts / comments / groups / events / resources
  getCommunityPosts:        (o = {})          => api.get(`/community/posts/?${buildParams(o)}`).then((r) => r.data),
  getCommunityPost:         (id)              => api.get(`/community/posts/${id}/`).then((r) => r.data),
  createCommunityPost:      (d)               => api.post('/community/posts/', d).then((r) => r.data),
  updateCommunityPost:      (id, d)           => api.patch(`/community/posts/${id}/`, d).then((r) => r.data),
  deleteCommunityPost:      (id)              => api.delete(`/community/posts/${id}/`).then((r) => r.data),

  getComments:              (postId)          => api.get(`/community/posts/${postId}/comments/`).then((r) => r.data),
  createComment:            (d)               => api.post('/community/comments/', d).then((r) => r.data),
  updateComment:            (id, d)           => api.patch(`/community/comments/${id}/`, d).then((r) => r.data),
  deleteComment:            (id)              => api.delete(`/community/comments/${id}/`).then((r) => r.data),

  getCommunityGroups:       ()                => api.get('/community/groups/').then((r) => r.data),
  joinCommunityGroup:       (id)              => api.post(`/community/groups/${id}/join/`).then((r) => r.data),
  leaveCommunityGroup:      (id)              => api.post(`/community/groups/${id}/leave/`).then((r) => r.data),

  getCommunityEvents:       (o = {})          => api.get(`/community/events/?${buildParams(o)}`).then((r) => r.data),
  respondToEvent:           (id, status)      => api.post(`/community/events/${id}/rsvp/`, { status }).then((r) => r.data),

  getCommunityResources:    (o = {})          => api.get(`/community/resources/?${buildParams(o)}`).then((r) => r.data),
};

// --------------------------------------------------
// Reports / dashboards / analytics endpoints
// --------------------------------------------------
export const reports = {
  // Report configurations
  getReportConfigurations: (f = {}) => api.get(`/reports/report-configurations/?${buildParams(f)}`).then((r) => r.data),
  getReportConfiguration:  (id)      => api.get(`/reports/report-configurations/${id}/`).then((r) => r.data),
  createReportConfiguration:(d)       => api.post('/reports/report-configurations/', d).then((r) => r.data),
  updateReportConfiguration:(id, d)   => api.put(`/reports/report-configurations/${id}/`, d).then((r) => r.data),
  deleteReportConfiguration:(id)      => api.delete(`/reports/report-configurations/${id}/`).then((r) => r.data),

  // Reports & dashboards
  getReports:              (f = {}) => api.get(`/reports/reports/?${buildParams(f)}`).then((r) => r.data),
  getReport:               (id)      => api.get(`/reports/reports/${id}/`).then((r) => r.data),
  getDashboards:           (f = {}) => api.get(`/reports/dashboards/?${buildParams(f)}`).then((r) => r.data),
  getDashboard:            (id)      => api.get(`/reports/dashboards/${id}/`).then((r) => r.data),
  getDashboardWidgets:     (dashId)  => api.get(`/reports/dashboard-widgets/?dashboard=${dashId}`).then((r) => r.data),

  // Analytics / exports / AI analysis
  getAnalyticsMetrics:     (f = {}) => api.get(`/reports/analytics-metrics/?${buildParams(f)}`).then((r) => r.data),
  createDataExport:        (d)       => api.post('/reports/data-exports/', d).then((r) => r.data),
  getDataExport:           (id)      => api.get(`/reports/data-exports/${id}/`).then((r) => r.data),
  requestAIAnalysis:       (d)       => api.post('/reports/ai-analysis/', d).then((r) => r.data),
  getAIAnalysis:           (id)      => api.get(`/reports/ai-analysis/${id}/`).then((r) => r.data),
};

// --------------------------------------------------
// Audit / compliance endpoints (admin)
// --------------------------------------------------
export const audit = {
  // Events
  getAuditEvents:      (f = {}) => api.get(`/audit/events/?${buildParams(f)}`).then((r) => r.data),
  getAuditEvent:       (id)      => api.get(`/audit/events/${id}/`).then((r) => r.data),
  exportAuditEvents:   (f = {}) => api.post(`/audit/events/export/?${buildParams(f)}`).then((r) => r.data),
  logAuditEvent:       (d)       => api.post('/audit/events/', d).then((r) => r.data),
  getEventSummary:     (t = 'last_30_days') => api.get(`/audit/events/summary/?timeframe=${t}`).then((r) => r.data),
  getUserActivity:     (userId, f = {}) => audit.getAuditEvents({ ...f, user: userId }),
  getResourceActivity: (type, id, f = {}) => audit.getAuditEvents({ ...f, resource_type: type, resource_id: id }),

  // PHI access
  getPHIAccessLogs:    (f = {}) => api.get(`/audit/phi-access/?${buildParams(f)}`).then((r) => r.data),

  // Security incidents
  getSecurityIncidents:(f = {}) => api.get(`/audit/security/?${buildParams(f)}`).then((r) => r.data),
  logSecurityIncident: (d)       => api.post('/audit/security/', d).then((r) => r.data),
  resolveSecurityIncident:(id, res) => api.post(`/audit/security/${id}/resolve/`, { resolution: res }).then((r) => r.data),

  // Compliance reports / metrics
  getComplianceReports:(f = {}) => api.get(`/audit/reports/?${buildParams(f)}`).then((r) => r.data),
  getComplianceReport: (id)      => api.get(`/audit/reports/${id}/`).then((r) => r.data),
  generateComplianceReport: (type, range) => api.post('/audit/reports/generate/', { report_type: type, date_range: range }).then((r) => r.data),
  getDashboardMetrics: ()       => api.get('/audit/reports/dashboard/').then((r) => r.data),
  getComplianceMetrics:()       => api.get('/audit/compliance/metrics/').then((r) => r.data),
  getPatientAccessHistory:(patientId, o = {}) => api.get(`/audit/compliance/patient-access/${patientId}/?${buildParams(o)}`).then((r) => r.data),
};

// --------------------------------------------------
// SECURITY MODULE
// --------------------------------------------------
export const security = {
  getSecurityStatus:    () => api.get('/security/status/').then((r) => r.data).catch((e) => (e.response?.status === 404 ? { two_factor_enabled: false } : Promise.reject(e))),
  getRecentActivity:    (limit = 10) => api.get('/security/activity/', { params: { limit } }).then((r) => r.data),
  getActivityHistory:   (o = {}) => api.get(`/security/activity/`, { params: o }).then((r) => r.data),
  getActiveSessions:    () => api.get('/security/sessions/').then((r) => r.data),
  terminateSession:     (id) => api.delete(`/security/sessions/${id}/`).then((r) => r.data),
  terminateAllSessions: () => api.delete('/security/sessions/all/').then((r) => r.data),
  getTwoFactorStatus:   () => api.get('/security/2fa/status/').then((r) => r.data).catch((e) => (e.response?.status === 404 ? { enabled: false } : Promise.reject(e))),
  getApiKeys:           () => api.get('/security/api-keys/').then((r) => r.data),
  createApiKey:         (name, expiresIn) => api.post('/security/api-keys/', { name, expires_in: expiresIn }).then((r) => r.data),
  revokeApiKey:         (id) => api.delete(`/security/api-keys/${id}/`).then((r) => r.data),
};

// --------------------------------------------------
// TELEMEDICINE MODULE
// --------------------------------------------------
export const telemedicine = {
  // Appointments
  getAppointments:        (o = {}) => api.get(`/appointments/?${buildParams(o)}`).then((r) => r.data),
  getUpcomingAppointments:() => api.get('/appointments/upcoming/').then((r) => r.data),
  getPastAppointments:    (o = {}) => telemedicine.getAppointments({ ...o, status: 'completed,cancelled,no_show' }),
  getAppointment:         (id) => api.get(`/appointments/${id}/`).then((r) => r.data),
  createAppointment:      (d) => api.post('/appointments/', d).then((r) => r.data),
  createTelehealthAppointment:(d) => api.post('/appointments/telehealth/', d).then((r) => r.data),
  updateAppointment:      (id, d) => api.patch(`/appointments/${id}/`, d).then((r) => r.data),
  cancelAppointment:      (id, reason) => api.post(`/appointments/${id}/cancel/`, { reason }).then((r) => r.data),
  // Telehealth session join info
  getJoinInfo:            (appointmentId) => api.get(`/appointments/${appointmentId}/join/`).then((r) => r.data),
  // Consultations
  getConsultations:       (o = {}) => api.get(`/consultations/?${buildParams(o)}`).then((r) => r.data),
  getConsultation:        (id) => api.get(`/consultations/${id}/`).then((r) => r.data),
  getConsultationsByAppointment:(appointmentId) => telemedicine.getConsultations({ appointment: appointmentId }),
  startConsultation:      (id) => api.post(`/consultations/${id}/start/`).then((r) => r.data),
  endConsultation:        (id, notes) => api.post(`/consultations/${id}/end/`, { notes }).then((r) => r.data),
  // Clinical notes
  getClinicalNotes:       (consultationId) => api.get(`/consultations/${consultationId}/clinical-notes/`).then((r) => r.data),
  createClinicalNote:     (consultationId, d) => api.post(`/consultations/${consultationId}/clinical-notes/`, d).then((r) => r.data),
  updateClinicalNote:     (noteId, d) => api.patch(`/clinical-notes/${noteId}/`, d).then((r) => r.data),
  // Provider availability
  getAvailableProviders:  (o = {}) => api.get(`/providers/available/?${buildParams(o)}`).then((r) => r.data),
  getProviderAvailability:(providerId, start, end) => api.get(`/providers/${providerId}/availability/?${buildParams({ start_date: start, end_date: end })}`).then((r) => r.data),
  getProviderSchedule:    (providerId, date) => api.get(`/providers/${providerId}/schedule/?${buildParams({ date })}`).then((r) => r.data),
  // Referrals
  getReferrals:           (o = {}) => api.get(`/referrals/?${buildParams(o)}`).then((r) => r.data),
  createReferral:         (d) => api.post('/referrals/', d).then((r) => r.data),
  updateReferral:         (id, d) => api.patch(`/referrals/${id}/`, d).then((r) => r.data),
};

// --------------------------------------------------
// FHIR endpoints (SMART‑on‑FHIR proxy)
// --------------------------------------------------
export const fhir = {
  // Generic helpers
  getResource:  (t, id)   => api.get(`/fhir/${t}/${id}/`).then((r) => r.data),
  search:       (t, p={}) => api.get(`/fhir/${t}/?${buildParams(p)}`).then((r) => r.data),
  create:       (t, d)    => api.post(`/fhir/${t}/`, d).then((r) => r.data),
  update:       (t, id,d) => api.patch(`/fhir/${t}/${id}/`, d).then((r) => r.data),

  // Convenience wrappers for common resources
  getPatients:       (f = {}) => fhir.search('Patient', f),
  getPatient:        (id)     => fhir.getResource('Patient', id),
  createPatient:     (d)      => fhir.create('Patient', d),
  updatePatient:     (id, d)  => fhir.update('Patient', id, d),

  getPractitioners:  (f = {}) => fhir.search('Practitioner', f),
  getPractitioner:   (id)     => fhir.getResource('Practitioner', id),

  getObservations:   (f = {}) => fhir.search('Observation', f),
  getObservation:    (id)     => fhir.getResource('Observation', id),

  getConditions:     (f = {}) => fhir.search('Condition', f),
  getCondition:      (id)     => fhir.getResource('Condition', id),

  getMedicationStatements:(f={}) => fhir.search('MedicationStatement', f),
  getMedicationStatement:  (id)  => fhir.getResource('MedicationStatement', id),

  getCommunications: (f = {}) => fhir.search('Communication', f),
  getCommunication:  (id)     => fhir.getResource('Communication', id),

  getEncounters:     (f = {}) => fhir.search('Encounter', f),
  getEncounter:      (id)     => fhir.getResource('Encounter', id),
};

export default api;
