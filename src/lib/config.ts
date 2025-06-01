// src/lib/config.ts

// Validate critical environment variables
const validateConfig = () => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_API_BASE_URL',
  ];
  
  const missing = requiredEnvVars.filter(
    envVar => !process.env[envVar] && envVar === 'NEXT_PUBLIC_API_BASE_URL' && !config.apiBaseUrl
  );
  
  if (missing.length > 0 && config.isProduction) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Run validation
if (typeof window === 'undefined') { // Only run on server side
  validateConfig();
}

export const config = {
  
  // Enhanced API configuration with validation
  apiBaseUrl: (() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.klararety.com/api';
    
    // Ensure no trailing slash for consistency
    return baseUrl.replace(/\/$/, '');
  })(),

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

  validateApiConnection: async (): Promise<boolean> => {
  try {
       const response = await fetch(`${config.apiBaseUrl}/users/auth/check-status/?email=test@example.com`);
       return response.status !== 500; // Any non-500 response means API is reachable
    } catch {
       return false;
    }
  },
};

export default config;