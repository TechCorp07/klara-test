// src/lib/auth/index.ts
import { JWTValidator, JWTPayload, JWTValidationResult, extractJWTPayload } from './validator';

// Core JWT authentication components - using the enhanced versions
export { EnhancedJWTAuthProvider as JWTAuthProvider } from './auth-provider';
export { EnhancedJWTAuthProvider as AuthProvider } from './auth-provider';
export type { EnhancedJWTAuthContextType as JWTAuthContextType } from './auth-provider';

// JWT validation and utilities
export { JWTValidator } from './validator';
export type { JWTPayload, JWTValidationResult } from './validator';
export { validateJWT, extractJWTPayload, checkJWTPermission, getJWTUserRole } from './validator';

// Authentication hooks - single consolidated hook
export { useJWTAuth } from './use-auth';
export type { UseJWTAuthReturn } from './use-auth';

// Main authentication hook for backward compatibility
export { useJWTAuth as useAuth } from './use-auth';

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
   * Extract user role from JWT payload
   */
  getUserRole: (jwtPayload: JWTPayload | null): string | null => {
    return jwtPayload?.role ?? null;
  },

  /**
   * Extract user ID from JWT payload
   */
  getUserId: (jwtPayload: JWTPayload | null): number | null => {
    return jwtPayload?.user_id ?? null;
  },

  /**
   * Extract session ID from JWT payload
   */
  getSessionId: (jwtPayload: JWTPayload | null): string | null => {
    return jwtPayload?.session_id ?? null;
  }
};