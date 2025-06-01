// src/lib/config.ts

/**
 * Environment-based configuration utility for the Klararety Healthcare Platform
 * FIXED: Updated to align with deployed backend API
 */
export const config = {
  // API Configuration - FIXED: Updated to match deployed backend
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.klararety.com/api',
  
  // Cookie Configuration
  cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 'klararety.com',
  secureCookies: process.env.NEXT_PUBLIC_SECURE_COOKIES === 'true' || process.env.NODE_ENV === 'production',
  
  // Authentication Cookie Names - SIMPLIFIED: Backend uses single token
  authCookieName: 'klararety_auth_token',
  userRoleCookieName: 'klararety_user_role',
  emailVerifiedCookieName: 'klararety_email_verified',
  isApprovedCookieName: 'klararety_is_approved',
  
  // REMOVED: Refresh token settings since backend doesn't support token refresh
  // Authentication Settings - SIMPLIFIED: Single token system
  tokenExpiryDays: 7, // Backend uses longer-lived tokens
  
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
  
  // Environment Detection
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Application Settings
  appName: 'Klararety Healthcare Platform',
  supportEmail: 'support@klararety.com',
  
  // Terms and Privacy URLs
  termsUrl: '/terms-of-service',
  privacyUrl: '/privacy-policy',
  hipaaNoticeUrl: '/hipaa-notice',
};

export default config;