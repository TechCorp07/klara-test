// src/lib/auth/index.ts

// Import validator and types first
import { JWTValidator, JWTPayload, JWTValidationResult, extractJWTPayload } from './validator';

// Core JWT authentication components
export { JWTAuthProvider } from './auth-provider';
export type { JWTAuthContextType } from './auth-provider';

// JWT validation and utilities
export { JWTValidator } from './validator';
export type { JWTPayload, JWTValidationResult } from './validator';
export { validateJWT, extractJWTPayload, checkJWTPermission, getJWTUserRole } from './validator';

// Authentication hook and utilities
export { useJWTAuth } from './use-auth';
export type { UseJWTAuthReturn } from './use-auth';

// Main authentication hook for backward compatibility
export { useJWTAuth as useAuth } from './use-auth';

// Main authentication provider for backward compatibility
export { JWTAuthProvider as AuthProvider } from './auth-provider';

/**
 * Permission checking utilities
 * Updated to handle string permissions
 */
export const PermissionUtils = {
  /**
   * Check if a permission exists in a JWT payload
   */
  hasPermission: (
    jwtPayload: JWTPayload | null,
    permission: string
  ): boolean => {
    return jwtPayload ? JWTValidator.hasPermission(jwtPayload, permission) : false;
  },

  /**
   * Check if any of the provided permissions exist
   */
  hasAnyPermission: (
    jwtPayload: JWTPayload | null,
    permissions: string[]
  ): boolean => {
    return permissions.some(permission => 
      PermissionUtils.hasPermission(jwtPayload, permission)
    );
  },

  /**
   * Check if all provided permissions exist
   */
  hasAllPermissions: (
    jwtPayload: JWTPayload | null,
    permissions: string[]
  ): boolean => {
    return permissions.every(permission => 
      PermissionUtils.hasPermission(jwtPayload, permission)
    );
  },

  /**
   * Check if token needs refresh
   */
  needsRefresh: (jwtPayload: JWTPayload | null): boolean => {
    return jwtPayload ? JWTValidator.needsRefresh(jwtPayload) : false;
  },

  /**
   * Get time to token expiration
   */
  getTimeToExpiration: (jwtPayload: JWTPayload | null): number => {
    return jwtPayload ? JWTValidator.getTimeToExpiration(jwtPayload) : 0;
  },

  /**
   * Format time to expiration for display
   */
  formatTimeToExpiration: (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  },

  /**
   * Check if token is expiring soon
   */
  isExpiringSoon: (jwtPayload: JWTPayload | null, thresholdMinutes: number = 5): boolean => {
    if (!jwtPayload) return false;
    const timeToExpiration = JWTValidator.getTimeToExpiration(jwtPayload);
    return timeToExpiration < (thresholdMinutes * 60);
  },
};

/**
 * Token utilities for JWT management
 */
export const TokenUtils = {
  /**
   * Validate JWT token structure
   */
  validateToken: (token: string): JWTValidationResult => {
    return JWTValidator.validateToken(token);
  },

  /**
   * Extract payload from JWT token
   */
  extractPayload: (token: string): JWTPayload | null => {
    return extractJWTPayload(token);
  },

  /**
   * Check if token needs refresh
   */
  needsRefresh: (jwtPayload: JWTPayload | null): boolean => {
    return jwtPayload ? JWTValidator.needsRefresh(jwtPayload) : false;
  },

  /**
   * Get time to token expiration
   */
  getTimeToExpiration: (jwtPayload: JWTPayload | null): number => {
    return jwtPayload ? JWTValidator.getTimeToExpiration(jwtPayload) : 0;
  },

  /**
   * Format time to expiration for display
   */
  formatTimeToExpiration: (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  },

  /**
   * Check if token is expiring soon
   */
  isExpiringSoon: (jwtPayload: JWTPayload | null, thresholdMinutes: number = 5): boolean => {
    if (!jwtPayload) return false;
    const timeToExpiration = JWTValidator.getTimeToExpiration(jwtPayload);
    return timeToExpiration < (thresholdMinutes * 60);
  },
};

/**
 * Route protection utilities
 */
export const RouteUtils = {
  /**
   * Public routes that don't require authentication
   */
  PUBLIC_ROUTES: [
    '/',
    '/login',
    '/register',
    '/verify-email',
    '/reset-password',
    '/forgot-password',
    '/terms-of-service',
    '/privacy-policy',
    '/about',
    '/contact',
    '/support',
  ] as const,

  /**
   * Check if a route is public
   */
  isPublicRoute: (path: string): boolean => {
    return RouteUtils.PUBLIC_ROUTES.some(route => 
      path === route || path.startsWith(route + '/')
    );
  },

  /**
   * Role-based route mapping
   */
  ROLE_ROUTES: {
    patient: ['/patient'] as const,
    provider: ['/provider'] as const,
    admin: ['/admin'] as const,
    superadmin: ['/admin'] as const,
    researcher: ['/researcher'] as const,
    compliance: ['/compliance'] as const,
    pharmco: ['/pharmco'] as const,
    caregiver: ['/caregiver'] as const,
  } as const,

  /**
   * Get allowed routes for a role
   */
  getRoleRoutes: (role: string): readonly string[] => {
    return RouteUtils.ROLE_ROUTES[role as keyof typeof RouteUtils.ROLE_ROUTES] || [];
  },
};

/**
 * Development utilities
 */
export const DevUtils = {
  /**
   * Log permission information for debugging
   */
  logPermissions: (jwtPayload: JWTPayload | null): void => {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.group('🔐 JWT Permissions Debug');
    console.log('User:', jwtPayload?.email);
    console.log('Role:', jwtPayload?.role);
    console.log('Permissions:', jwtPayload?.permissions);
    console.log('Session ID:', jwtPayload?.session_id);
    console.log('Expires:', new Date((jwtPayload?.exp || 0) * 1000));
    console.groupEnd();
  },

  /**
   * Validate JWT payload structure
   */
  validatePayloadStructure: (jwtPayload: unknown): boolean => {
    if (!jwtPayload || typeof jwtPayload !== 'object') return false;
    
    const payload = jwtPayload as Record<string, unknown>;
    const requiredFields = ['user_id', 'username', 'email', 'role', 'exp', 'iat'];
    
    return requiredFields.every(field => field in payload);
  },
};

// Export configuration
export { config } from '../config';
export { validateConfig, configUtils } from '../config';

/**
 * Migration utilities
 */
export const MigrationUtils = {
  /**
   * Check if the new JWT system is active
   */
  isJWTSystemActive: (): boolean => {
    return true; // Always true in the new system
  },

  /**
   * Get migration status
   */
  getMigrationStatus: (): { 
    phase: 'complete';
    features: string[];
    deprecated: string[];
  } => {
    return {
      phase: 'complete',
      features: [
        'JWT token validation',
        'Local permission checking',
        'Race condition elimination',
        'Permission-based routing',
        'Backend JWT integration',
      ],
      deprecated: [
        'HTTP-based token validation',
        'localStorage token storage',
        'Complex authentication guards',
        'Async permission resolution',
      ],
    };
  },
};

// Default export for easy importing
export default {
  JWTValidator,
  PermissionUtils,
  TokenUtils,
  RouteUtils,
  DevUtils,
};