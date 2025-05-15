// src/lib/config.ts

/**
 * Environment-based configuration utility for the Klararety Healthcare Platform
 * This centralizes configuration settings across different environments
 */
export const config = {
    // API Configuration
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.klararety.com/api',
    
    // Cookie Configuration
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 'localhost',
    secureCookies: process.env.NEXT_PUBLIC_SECURE_COOKIES === 'true',
    
    // Authentication Cookie Names
    authCookieName: 'klararety_auth_token',
    refreshCookieName: 'klararety_refresh_token',
    userRoleCookieName: 'klararety_user_role',
    emailVerifiedCookieName: 'klararety_email_verified',
    isApprovedCookieName: 'klararety_is_approved',
    
    // Authentication Settings
    accessTokenExpiryMinutes: 15, // 15 minutes
    refreshTokenExpiryDays: 7, // 7 days
    
    // Security Settings
    passwordMinLength: 12,
    passwordRequiresSpecialChar: true,
    passwordRequiresNumber: true,
    passwordRequiresUppercase: true,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 30,
    
    // HIPAA Compliance
    sessionTimeoutMinutes: 20, // Auto-logout after inactivity
    
    // Feature Flags
    enableTwoFactor: true,
    requireTwoFactorForProviders: true,
    
    // Set based on environment
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    
    // Additional Settings
    appName: 'Klararety Healthcare Platform',
    supportEmail: 'support@klararety.com',
    
    // Terms and Privacy URLs
    termsUrl: '/terms-of-service',
    privacyUrl: '/privacy-policy',
    hipaaNoticeUrl: '/hipaa-notice',
  };
  
  export default config;