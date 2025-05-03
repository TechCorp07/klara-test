/**
 * Environment variable configuration and validation
 */

/**
 * Required environment variables
 * @type {Array<string>}
 */
const REQUIRED_ENV_VARS = ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_WEBSOCKET_URL"]

/**
 * Validate that all required environment variables are present
 * @returns {boolean} True if all required variables are present, false otherwise
 */
export function validateRequiredEnvVars() {
  const missingVars = REQUIRED_ENV_VARS.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(", ")}`)
    return false
  }

  return true
}

/**
 * Get an environment variable with a fallback value
 * @param {string} name - The name of the environment variable
 * @param {*} fallback - The fallback value if the variable is not defined
 * @returns {string|*} The environment variable value or the fallback
 */
export function getEnvVar(name, fallback = undefined) {
  return process.env[name] !== undefined ? process.env[name] : fallback
}

/**
 * Get a boolean environment variable
 * @param {string} name - The name of the environment variable
 * @param {boolean} fallback - The fallback value if the variable is not defined
 * @returns {boolean} The boolean value of the environment variable
 */
export function getBoolEnvVar(name, fallback = false) {
  const value = process.env[name]
  if (value === undefined) {
    return fallback
  }
  return value === "true" || value === "1" || value === "yes"
}

/**
 * Get a numeric environment variable
 * @param {string} name - The name of the environment variable
 * @param {number} fallback - The fallback value if the variable is not defined or not a number
 * @returns {number} The numeric value of the environment variable
 */
export function getNumericEnvVar(name, fallback = 0) {
  const value = process.env[name]
  if (value === undefined) {
    return fallback
  }
  const parsed = Number.parseFloat(value)
  return isNaN(parsed) ? fallback : parsed
}

/**
 * Get an array environment variable (comma-separated)
 * @param {string} name - The name of the environment variable
 * @param {Array} fallback - The fallback value if the variable is not defined
 * @returns {Array<string>} The array value of the environment variable
 */
export function getArrayEnvVar(name, fallback = []) {
  const value = process.env[name]
  if (!value) {
    return fallback
  }
  return value.split(",").map((item) => item.trim())
}

/**
 * Get a JSON environment variable
 * @param {string} name - The name of the environment variable
 * @param {Object} fallback - The fallback value if the variable is not defined or not valid JSON
 * @returns {Object} The parsed JSON value of the environment variable
 */
export function getJsonEnvVar(name, fallback = {}) {
  const value = process.env[name]
  if (!value) {
    return fallback
  }
  try {
    return JSON.parse(value)
  } catch (error) {
    console.error(`Failed to parse JSON environment variable ${name}:`, error)
    return fallback
  }
}

/**
 * Get the current deployment environment
 * @returns {string} The current deployment environment
 */
export function getDeploymentEnv() {
  return getEnvVar("DEPLOYMENT_ENV", "development")
}

/**
 * Check if the current environment is production
 * @returns {boolean} True if the current environment is production
 */
export function isProduction() {
  return getDeploymentEnv() === "production"
}

/**
 * Check if the current environment is development
 * @returns {boolean} True if the current environment is development
 */
export function isDevelopment() {
  return getDeploymentEnv() === "development"
}

/**
 * Check if the current environment is staging
 * @returns {boolean} True if the current environment is staging
 */
export function isStaging() {
  return getDeploymentEnv() === "staging"
}

/**
 * Check if the current environment is test
 * @returns {boolean} True if the current environment is test
 */
export function isTest() {
  return getDeploymentEnv() === "test"
}

/**
 * Check if maintenance mode is enabled
 * @returns {boolean} True if maintenance mode is enabled
 */
export function isMaintenanceMode() {
  return getBoolEnvVar("MAINTENANCE_MODE", false)
}

/**
 * Get the API URL
 * @returns {string} The API URL
 */
export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "https://api.klararety.com/api"
}

/**
 * Get the app URL
 * @returns {string} The app URL
 */
export function getAppUrl() {
  return getEnvVar("NEXT_PUBLIC_APP_URL")
}

/**
 * Get the WebSocket URL
 * @returns {string} The WebSocket URL
 */
export function getWebsocketUrl() {
  return getEnvVar("NEXT_PUBLIC_WEBSOCKET_URL")
}

/**
 * Get the Zoom SDK key
 * @returns {string} The Zoom SDK key
 */
export function getZoomSdkKey() {
  return getEnvVar("ZOOM_SDK_KEY")
}

/**
 * Get the Withings client ID
 * @returns {string} The Withings client ID
 */
export function getWithingsClientId() {
  return getEnvVar("WITHINGS_CLIENT_ID")
}

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "auth/login",
    LOGOUT: "auth/logout",
    REGISTER: "auth/register",
    REFRESH: "auth/refresh",
    ME: "auth/me",
    FORGOT_PASSWORD: "auth/forgot-password",
    RESET_PASSWORD: "auth/reset-password",
    VERIFY_EMAIL: "auth/verify-email",
    REQUEST_VERIFICATION: "auth/request-verification",
    SETUP_2FA: "auth/setup-2fa",
    VERIFY_2FA: "auth/verify-2fa",
    DISABLE_2FA: "auth/disable-2fa",
    CONFIRM_2FA: "auth/confirm-2fa",
  },
  USERS: {
    BASE: "/users",
    BY_ID: (id) => `/users/${id}`,
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile/update",
    CHANGE_PASSWORD: "/users/change-password",
    UPDATE_CONSENT: "/users/update-consent",
  },
  HEALTHCARE: {
    BASE: "/healthcare",
    CONDITIONS: "/healthcare/conditions",
    ALLERGIES: "/healthcare/allergies",
    IMMUNIZATIONS: "/healthcare/immunizations",
    LAB_TESTS: "/healthcare/lab-tests",
    VITAL_SIGNS: "/healthcare/vital-signs",
    APPROVALS: {
      PENDING: "/healthcare/approvals/pending",
      APPROVE: (id) => `/healthcare/approvals/${id}/approve`,
      REJECT: (id) => `/healthcare/approvals/${id}/reject`,
    },
  },
  TELEMEDICINE: {
    APPOINTMENTS: {
      BASE: "/telemedicine/appointments",
      UPCOMING: "/telemedicine/appointments/upcoming",
      PROVIDER: "/telemedicine/provider/appointments",
      CANCEL: (id) => `/telemedicine/appointments/${id}/cancel`,
      RESCHEDULE: (id) => `/telemedicine/appointments/${id}/reschedule`,
      START: (id) => `/telemedicine/appointments/${id}/start`,
    },
    PROVIDERS: {
      AVAILABILITY: (id) => `/telemedicine/providers/${id}/availability`,
    },
    MESSAGES: "/telemedicine/provider/messages",
    SESSIONS: {
      END: (id) => `/telemedicine/sessions/${id}/end`,
    },
  },
  WEARABLES: {
    AVAILABLE_DEVICES: "/wearables/available-devices",
    USER_DEVICES: (userId) => `/wearables/users/${userId}/devices`,
    CONNECT_DEVICE: "/wearables/connect-device",
    DISCONNECT_DEVICE: (deviceId) => `/wearables/devices/${deviceId}/disconnect`,
    SYNC_DEVICE: (deviceId) => `/wearables/devices/${deviceId}/sync`,
    HEALTH_DATA: (userId) => `/wearables/users/${userId}/health-data`,
    ANALYZE_HEALTH_DATA: "/wearables/analyze-health-data",
  },
  COMMUNITY: {
    FORUMS: {
      BASE: "/community/forums",
      BY_ID: (id) => `/community/forums/${id}`,
    },
    TOPICS: {
      BASE: "/community/topics",
      BY_ID: (id) => `/community/topics/${id}`,
    },
    POSTS: {
      BASE: "/community/posts",
      BY_ID: (id) => `/community/posts/${id}`,
    },
    CONNECTIONS: "/community/connections",
  },
  EHR: {
    SYSTEMS: {
      BASE: "/ehr/systems",
      STATUS: (id) => `/ehr/systems/${id}/status`,
      CONFIGURE: (id) => `/ehr/systems/${id}/configure`,
      TEST: (id) => `/ehr/systems/${id}/test`,
      SYNC: (id) => `/ehr/systems/${id}/sync`,
      SYNC_HISTORY: (id) => `/ehr/systems/${id}/sync-history`,
      MAPPINGS: (id) => `/ehr/systems/${id}/mappings`,
    },
  },
  MEDICATIONS: {
    BASE: "/medications",
    BY_ID: (id) => `/medications/${id}`,
    REMINDERS: "/medications/reminders",
    ADHERENCE: "/medications/adherence",
  },
  REPORTS: {
    BASE: "/reports",
    GENERATE: "/reports/generate",
    BY_ID: (id) => `/reports/${id}`,
    DASHBOARDS: {
      BASE: "/reports/dashboards",
      BY_ID: (id) => `/reports/dashboards/${id}`,
    },
  },
  AUDIT: {
    LOGS: "/audit/logs",
    SYSTEM: {
      STATS: "/audit/system/stats",
      ALERTS: "/audit/system/alerts",
    },
    USERS: {
      RECENT: "/audit/users/recent",
    },
  },
}

export default {
  validateRequiredEnvVars,
  getEnvVar,
  getBoolEnvVar,
  getNumericEnvVar,
  getArrayEnvVar,
  getJsonEnvVar,
  getDeploymentEnv,
  isProduction,
  isDevelopment,
  isStaging,
  isTest,
  isMaintenanceMode,
  getApiUrl,
  getAppUrl,
  getWebsocketUrl,
  getZoomSdkKey,
  getWithingsClientId,
}
