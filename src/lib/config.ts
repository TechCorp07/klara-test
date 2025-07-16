// src/lib/config.ts
/**
 * JWT Configuration - Race Condition Free Settings
 * 
 */

/**
 * Application Configuration Interface
 * 
 * This interface defines all the configuration options needed for the
 * JWT authentication system and general application operation.
 */
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
 * 
 * This function creates the appropriate configuration based on the
 * current environment, ensuring that development and production
 * environments have appropriate settings.
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
    // These must match your backend JWT middleware settings
    authCookieName: 'jwt_access_token', // Matches your backend JWT_COOKIE_NAME
    refreshCookieName: 'jwt_refresh_token',
    secureCookies: isProduction, // Use secure cookies in production only
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN, // Optional domain setting
    
    // Session Configuration
    sessionTimeoutMinutes: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '30'),
    tokenRefreshThresholdMinutes: 5, // Refresh when less than 5 minutes remain
    
    // Security Configuration
    enablePermissionDebugging: isDevelopment, // Only enable in development
    
    // External Links
    termsUrl: process.env.NEXT_PUBLIC_TERMS_URL || '/terms-of-service',
    privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL || '/privacy-policy',
    supportUrl: process.env.NEXT_PUBLIC_SUPPORT_URL || '/support',
    
    // Feature Flags
    features: {
      enableTokenRefresh: true, // Enable automatic token refresh
      enablePermissionCaching: false, // Disable to prevent race conditions
      enableSecurityLogging: isDevelopment, // Log security events in development
    },
  };
}

/**
 * Export the configuration instance
 * 
 * This creates a single configuration instance that can be imported
 * throughout your application for consistent settings.
 */
export const config = createConfig();

/**
 * Configuration validation
 * 
 * This function validates that all required configuration values are present
 * and have reasonable values. It helps catch configuration errors early.
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
 * 
 * These utility functions provide convenient access to common configuration
 * operations throughout your application.
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

/**
 * Environment variable documentation
 * 
 * This documentation helps developers understand what environment variables
 * are available and how they affect the application configuration.
 * 
 * Required Environment Variables:
 * - NEXT_PUBLIC_API_URL: Backend API base URL
 * 
 * Optional Environment Variables:
 * - NEXT_PUBLIC_APP_NAME: Application display name
 * - NEXT_PUBLIC_APP_VERSION: Application version
 * - NEXT_PUBLIC_SESSION_TIMEOUT: Session timeout in minutes (default: 30)
 * - NEXT_PUBLIC_COOKIE_DOMAIN: Cookie domain for multi-subdomain setups
 * - NEXT_PUBLIC_TERMS_URL: Terms of service URL
 * - NEXT_PUBLIC_PRIVACY_URL: Privacy policy URL
 * - NEXT_PUBLIC_SUPPORT_URL: Support page URL
 */

// Export types for use throughout the application
export type { AppConfig };

// Default export
export default config;