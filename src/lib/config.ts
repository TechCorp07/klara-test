// src/lib/config.ts

export const config = {
  // Enhanced API configuration with validation
  apiBaseUrl: (() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.klararety.com/api';
    // Ensure no trailing slash for consistency
    return baseUrl.replace(/\/$/, '');
  })(),

  cookieDomain: (() => {
    // In development, don't set a domain so cookies work on localhost
    if (process.env.NODE_ENV === 'development') {
      return undefined; // Let browser set domain automatically for localhost
    }
    return process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 'klararety.com';
  })(),
  
  secureCookies: process.env.NEXT_PUBLIC_SECURE_COOKIES === 'true' || process.env.NODE_ENV === 'production',
  
  // Authentication Cookie Names - SIMPLIFIED: Backend uses single token
  authCookieName: 'klararety_auth_token',
  userRoleCookieName: 'klararety_user_role',
  emailVerifiedCookieName: 'klararety_email_verified',
  isApprovedCookieName: 'klararety_is_approved',
  
  // Authentication Settings - SIMPLIFIED: Single token system
  tokenExpiryDays: 1, // Backend uses longer-lived tokens
  
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

// Separate validation function to avoid circular dependencies
export const validateApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/users/auth/check-status/?email=test@example.com`);
    return response.status !== 500; // Any non-500 response means API is reachable
  } catch {
    return false;
  }
};

// Validate critical environment variables (moved outside config object)
export const validateConfig = () => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_API_BASE_URL',
  ];
  
  const missing = requiredEnvVars.filter(
    envVar => !process.env[envVar] && envVar === 'NEXT_PUBLIC_API_BASE_URL' && !config.apiBaseUrl
  );
  
  if (missing.length > 0 && config.isProduction) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
};

export default config;