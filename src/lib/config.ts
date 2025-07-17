// src/lib/config.ts
interface AppConfig {
  // Application Identity
  appName: string;
  appVersion: string;
  
  // API Configuration
  apiBaseUrl: string;
  

  authCookieName?: string; 
  refreshCookieName?: string; 
  secureCookies: boolean;
  cookieDomain?: string;
  
  // New tab-specific authentication
  tabAuthEnabled: boolean;
  tabSessionTimeout: number; // milliseconds
  maxConcurrentTabs?: number;
  
  // Session Configuration
  sessionTimeoutMinutes: number;
  tokenRefreshThresholdMinutes: number;
  
  // Security Configuration
  enablePermissionDebugging: boolean;
  
  // External Links
  termsUrl: string;
  privacyUrl: string;
  hipaaNoticeUrl: string;
  supportUrl: string;
  
  // Feature Flags
  features: {
    enableTokenRefresh: boolean;
    enablePermissionCaching: boolean;
    enableSecurityLogging: boolean;
    enableTabIsolation: boolean;
  };
}

/**
 * Environment-based configuration
 */
function createConfig(): AppConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    // Application Identity
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'Klararety Healthcare Platform',
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    
    // API Configuration
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    
    // Authentication Configuration
    secureCookies: isProduction,
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    
    tabAuthEnabled: true,
    tabSessionTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
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
    
    // Feature Flags
    features: {
      enableTokenRefresh: true,
      enablePermissionCaching: false, 
      enableSecurityLogging: isDevelopment,
      enableTabIsolation: true, 
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
  if (config.tabAuthEnabled) {
    if (!config.tabSessionTimeout || config.tabSessionTimeout < 60000) { // Minimum 1 minute
      errors.push('Tab session timeout must be at least 60000ms (1 minute)');
    }
    
    if (config.maxConcurrentTabs && (config.maxConcurrentTabs < 1 || config.maxConcurrentTabs > 50)) {
      errors.push('Max concurrent tabs must be between 1 and 50');
    }
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
   * Check if tab-specific authentication is enabled
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
   * Check if we're in transition mode (both cookie and tab auth supported)
   */
  isTransitionMode: (): boolean => {
    return config.tabAuthEnabled && !!(config.authCookieName || config.refreshCookieName);
  },
  
  /**
   * Get authentication mode
   */
  getAuthMode: (): 'cookie' | 'tab' | 'hybrid' => {
    if (config.tabAuthEnabled && !config.authCookieName) {
      return 'tab';
    }
    if (!config.tabAuthEnabled && config.authCookieName) {
      return 'cookie';
    }
    return 'hybrid';
  },
};

export type { AppConfig };

export default config;