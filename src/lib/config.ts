// src/lib/config.ts
interface AppConfig {
  // Application Identity
  appName: string;
  appVersion: string;
  
  // API Configuration
  apiBaseUrl: string;
  
  // JWT Authentication Configuration
  authCookieName: string;
  refreshCookieName: string;
  secureCookies: boolean;
  cookieDomain?: string;
  
  // Session Configuration
  sessionTimeoutMinutes: number;
  tokenRefreshThresholdMinutes: number;
  
  // Security Configuration
  enablePermissionDebugging: boolean;
  
  // External Links
  termsUrl: string;
  privacyUrl: string;
  supportUrl: string;
  
  // Feature Flags
  features: {
    enableTokenRefresh: boolean;
    enablePermissionCaching: boolean;
    enableSecurityLogging: boolean;
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
    
    // JWT Authentication Configuration
    authCookieName: 'jwt_access_token', // Matches backend JWT_COOKIE_NAME
    refreshCookieName: 'jwt_refresh_token',
    secureCookies: isProduction,
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    
    // Session Configuration
    sessionTimeoutMinutes: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '30'),
    tokenRefreshThresholdMinutes: 5,
    
    // Security Configuration
    enablePermissionDebugging: isDevelopment,
    
    // External Links
    termsUrl: process.env.NEXT_PUBLIC_TERMS_URL || '/terms-of-service',
    privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL || '/privacy-policy',
    supportUrl: process.env.NEXT_PUBLIC_SUPPORT_URL || '/support',
    
    // Feature Flags
    features: {
      enableTokenRefresh: true,
      enablePermissionCaching: false, // Disable to prevent race conditions
      enableSecurityLogging: isDevelopment,
    },
  };
}

/**
 * Export the configuration instance
 */
export const config = createConfig();

/**
 * Configuration validation
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
  
  if (!config.authCookieName) {
    errors.push('Auth cookie name is required');
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
 * Configuration utilities
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
   * Check if a feature is enabled
   */
  isFeatureEnabled: (feature: keyof AppConfig['features']): boolean => {
    return config.features[feature];
  },
};

// Export types for use throughout the application
export type { AppConfig };

// Default export
export default config;