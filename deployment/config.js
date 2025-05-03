/**
 * Deployment configuration for the Klararety Healthcare Platform
 */

const environments = {
  development: {
    name: "Development",
    apiUrl: "http://localhost:3000/api",
    appUrl: "http://localhost:3000",
    websocketUrl: "ws://localhost:3001",
    features: {
      telemedicine: true,
      wearables: true,
      aiRecommendations: true,
      community: true,
    },
    logging: {
      level: "debug",
      enableConsole: true,
      enableRemote: false,
    },
    security: {
      sessionTimeout: 30, // minutes
      rateLimiting: {
        enabled: false,
      },
      hipaaCompliance: {
        strictMode: false,
      },
    },
  },

  staging: {
    name: "Staging",
    apiUrl: "https://staging-api.klararety.com",
    appUrl: "https://staging.klararety.com",
    websocketUrl: "wss://staging-ws.klararety.com",
    features: {
      telemedicine: true,
      wearables: true,
      aiRecommendations: true,
      community: true,
    },
    logging: {
      level: "info",
      enableConsole: true,
      enableRemote: true,
    },
    security: {
      sessionTimeout: 15, // minutes
      rateLimiting: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60000, // 1 minute
      },
      hipaaCompliance: {
        strictMode: true,
      },
    },
  },

  production: {
    name: "Production",
    apiUrl: "https://api.klararety.com",
    appUrl: "https://klararety.com",
    websocketUrl: "wss://ws.klararety.com",
    features: {
      telemedicine: true,
      wearables: true,
      aiRecommendations: true,
      community: true,
    },
    logging: {
      level: "warn",
      enableConsole: false,
      enableRemote: true,
    },
    security: {
      sessionTimeout: 15, // minutes
      rateLimiting: {
        enabled: true,
        maxRequests: 60,
        windowMs: 60000, // 1 minute
      },
      hipaaCompliance: {
        strictMode: true,
      },
    },
  },
}

/**
 * Get the current environment configuration
 * @returns {Object} The environment configuration
 */
export function getEnvironmentConfig() {
  const env = process.env.DEPLOYMENT_ENV || "development"
  return environments[env] || environments.development
}

/**
 * Get the base API URL
 * @returns {string} The base API URL
 */
export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || getEnvironmentConfig().apiUrl
}

/**
 * Get the base application URL
 * @returns {string} The base application URL
 */
export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || getEnvironmentConfig().appUrl
}

/**
 * Get the WebSocket URL
 * @returns {string} The WebSocket URL
 */
export function getWebsocketUrl() {
  return process.env.NEXT_PUBLIC_WEBSOCKET_URL || getEnvironmentConfig().websocketUrl
}

/**
 * Check if a feature is enabled
 * @param {string} featureName - The name of the feature to check
 * @returns {boolean} True if the feature is enabled, false otherwise
 */
export function isFeatureEnabled(featureName) {
  const envConfig = getEnvironmentConfig()
  const envFeature = process.env[`FEATURE_${featureName.toUpperCase()}`]

  // Environment variable takes precedence if defined
  if (envFeature !== undefined) {
    return envFeature === "true"
  }

  // Fall back to configuration
  return envConfig.features && envConfig.features[featureName] === true
}

/**
 * Get the logging configuration
 * @returns {Object} The logging configuration
 */
export function getLoggingConfig() {
  return getEnvironmentConfig().logging
}

/**
 * Get the security configuration
 * @returns {Object} The security configuration
 */
export function getSecurityConfig() {
  return getEnvironmentConfig().security
}

/**
 * Check if the application is in maintenance mode
 * @returns {boolean} True if in maintenance mode, false otherwise
 */
export function isMaintenanceMode() {
  return process.env.MAINTENANCE_MODE === "true"
}

/**
 * Get the deployment environment name
 * @returns {string} The environment name
 */
export function getEnvironmentName() {
  return getEnvironmentConfig().name
}

/**
 * Get the session timeout in minutes
 * @returns {number} The session timeout in minutes
 */
export function getSessionTimeout() {
  return getSecurityConfig().sessionTimeout
}

/**
 * Get the rate limiting configuration
 * @returns {Object} The rate limiting configuration
 */
export function getRateLimitingConfig() {
  return getSecurityConfig().rateLimiting
}

/**
 * Check if HIPAA strict compliance mode is enabled
 * @returns {boolean} True if strict mode is enabled, false otherwise
 */
export function isHipaaStrictMode() {
  const envValue = process.env.HIPAA_COMPLIANCE_MODE
  if (envValue !== undefined) {
    return envValue === "true"
  }
  return getSecurityConfig().hipaaCompliance.strictMode
}

/**
 * Get the configuration for a specific integration
 * @param {string} integrationName - The name of the integration
 * @returns {Object} The integration configuration
 */
export function getIntegrationConfig(integrationName) {
  switch (integrationName.toLowerCase()) {
    case "zoom":
      return {
        sdkKey: process.env.ZOOM_SDK_KEY,
        sdkSecret: process.env.ZOOM_SDK_SECRET,
      }
    case "withings":
      return {
        clientId: process.env.WITHINGS_CLIENT_ID,
        clientSecret: process.env.WITHINGS_CLIENT_SECRET,
      }
    case "fitbit":
      return {
        clientId: process.env.FITBIT_CLIENT_ID,
        clientSecret: process.env.FITBIT_CLIENT_SECRET,
      }
    case "garmin":
      return {
        consumerKey: process.env.GARMIN_CONSUMER_KEY,
        consumerSecret: process.env.GARMIN_CONSUMER_SECRET,
      }
    case "applehealth":
      return {
        teamId: process.env.APPLE_HEALTH_TEAM_ID,
        keyId: process.env.APPLE_HEALTH_KEY_ID,
      }
    default:
      return {}
  }
}

/**
 * Get all available integrations
 * @returns {Array<string>} List of available integrations
 */
export function getAvailableIntegrations() {
  return ["zoom", "withings", "fitbit", "garmin", "applehealth"]
}

/**
 * Check if an integration is configured
 * @param {string} integrationName - The name of the integration
 * @returns {boolean} True if the integration is configured, false otherwise
 */
export function isIntegrationConfigured(integrationName) {
  const config = getIntegrationConfig(integrationName)
  return Object.values(config).every((value) => value !== undefined && value !== "")
}

export default {
  getEnvironmentConfig,
  getApiUrl,
  getAppUrl,
  getWebsocketUrl,
  isFeatureEnabled,
  getLoggingConfig,
  getSecurityConfig,
  isMaintenanceMode,
  getEnvironmentName,
  getSessionTimeout,
  getRateLimitingConfig,
  isHipaaStrictMode,
  getIntegrationConfig,
  getAvailableIntegrations,
  isIntegrationConfigured,
}
