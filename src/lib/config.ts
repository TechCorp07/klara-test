// src/lib/config.ts
interface AppConfig {
  // Application Identity
  appName: string;
  appVersion: string;
  
  // API Configuration
  apiBaseUrl: string;
  
  // Tab-specific authentication (NO COOKIES)
  tabAuthEnabled: boolean;
  tabSessionTimeout: number; // milliseconds
  maxConcurrentTabs: number;
  
  // Session Configuration
  sessionTimeoutMinutes: number;
  tokenRefreshThresholdMinutes: number;
  
  // Password Configuration
  passwordMinLength: number;
  passwordRequiresUppercase: boolean;
  passwordRequiresNumber: boolean;
  passwordRequiresSpecialChar: boolean;

  // Security Configuration
  enablePermissionDebugging: boolean;
  
  // External Links
  termsUrl: string;
  privacyUrl: string;
  hipaaNoticeUrl: string;
  supportUrl: string;
  supportEmail: string;

  // Feature Flags
  features: {
    enableTokenRefresh: boolean;
    enablePermissionCaching: boolean;
    enableSecurityLogging: boolean;
    enableTabIsolation: boolean;
  };
}

/**
 * Environment-based configuration for tab-specific authentication
 */
function createConfig(): AppConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    // Application Identity
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'Klararety Healthcare Platform',
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    
    // API Configuration
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    
    // Password Configuration
    passwordMinLength: 12,
    passwordRequiresUppercase: true,
    passwordRequiresNumber: true,
    passwordRequiresSpecialChar: true,

    // Tab-specific authentication ONLY
    tabAuthEnabled: true,
    tabSessionTimeout: parseInt(process.env.NEXT_PUBLIC_TAB_SESSION_TIMEOUT || '1800000'), // 30 minutes
    maxConcurrentTabs: parseInt(process.env.NEXT_PUBLIC_MAX_TABS || '10'),
    
    // Session Configuration
    sessionTimeoutMinutes: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '30'),
    tokenRefreshThresholdMinutes: 5,
    
    // Security Configuration
    enablePermissionDebugging: isDevelopment,
    
    // External Links
    termsUrl: process.env.NEXT_PUBLIC_TERMS_URL || '/terms-of-service',
    privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL || '/privacy-policy',
    hipaaNoticeUrl: process.env.NEXT_PUBLIC_HIPAA_URL || '/hipaa-notice',
    supportUrl: process.env.NEXT_PUBLIC_SUPPORT_URL || '/support',
    supportEmail: 'support@example.com',
    
    // Feature Flags
    features: {
      enableTokenRefresh: true,
      enablePermissionCaching: false, // Keep disabled to prevent race conditions
      enableSecurityLogging: isDevelopment,
      enableTabIsolation: true, // Always enabled
    },
  };
}

/**
 * Export the configuration instance
 */
export const config = createConfig();

/**
 * Configuration validation for tab-specific auth
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate required fields
  if (!config.appName) {
    errors.push('App name is required');
  }
  
  if (!config.apiBaseUrl) {
    errors.push('API base URL is required');
  }
  
  // Validate tab-specific auth configuration
  if (!config.tabAuthEnabled) {
    errors.push('Tab authentication must be enabled');
  }
  
  if (config.tabSessionTimeout < 60000) { // Minimum 1 minute
    errors.push('Tab session timeout must be at least 60000ms (1 minute)');
  }
  
  if (config.maxConcurrentTabs < 1 || config.maxConcurrentTabs > 50) {
    errors.push('Max concurrent tabs must be between 1 and 50');
  }
  
  // Validate reasonable values
  if (config.sessionTimeoutMinutes < 1 || config.sessionTimeoutMinutes > 480) {
    errors.push('Session timeout must be between 1 and 480 minutes');
  }
  
  if (config.tokenRefreshThresholdMinutes < 1 || config.tokenRefreshThresholdMinutes > 30) {
    errors.push('Token refresh threshold must be between 1 and 30 minutes');
  }
  
  // Validate URL formats
  try {
    new URL(config.apiBaseUrl);
  } catch {
    errors.push('API base URL must be a valid URL');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Configuration utilities for tab-specific auth
 */
export const configUtils = {
  /**
   * Get full API URL for a given endpoint
   */
  getApiUrl: (endpoint: string): string => {
    return `${config.apiBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  },
  
  /**
   * Check if the application is running in development mode
   */
  isDevelopment: (): boolean => {
    return process.env.NODE_ENV === 'development';
  },
  
  /**
   * Check if the application is running in production mode
   */
  isProduction: (): boolean => {
    return process.env.NODE_ENV === 'production';
  },
  
  /**
   * Get session timeout in milliseconds
   */
  getSessionTimeoutMs: (): number => {
    return config.sessionTimeoutMinutes * 60 * 1000;
  },
  
  /**
   * Get token refresh threshold in milliseconds
   */
  getRefreshThresholdMs: (): number => {
    return config.tokenRefreshThresholdMinutes * 60 * 1000;
  },
  
  /**
   * Get tab session timeout in milliseconds
   */
  getTabSessionTimeoutMs: (): number => {
    return config.tabSessionTimeout;
  },
  
  /**
   * Check if tab-specific authentication is enabled (always true now)
   */
  isTabAuthEnabled: (): boolean => {
    return config.tabAuthEnabled;
  },
  
  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled: (feature: keyof AppConfig['features']): boolean => {
    return config.features[feature];
  },
  
  /**
   * Get authentication mode (always 'tab' now)
   */
  getAuthMode: (): 'tab' => {
    return 'tab';
  },
};

// Export types for use throughout the application
export type { AppConfig };

// Default export
export default config;