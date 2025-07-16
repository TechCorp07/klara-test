// src/lib/auth/index.ts
export { JWTAuthProvider as AuthProvider } from './auth-provider';
export type { JWTAuthContextType } from './auth-provider';

// Main authentication hook
export { useJWTAuth as useAuth } from './use-auth';
export type { UseJWTAuthReturn } from './use-auth';

// JWT validation and utilities
export { JWTValidator } from './validator';
export type { JWTPayload, JWTValidationResult } from './validator';

// Re-export types from auth types for convenience
export type { 
  User, 
  UserRole, 
  LoginCredentials, 
  LoginResponse, 
  RegisterRequest,
  RegisterResponse,
  AdminPermissions
} from '@/types/auth.types';

/**
 * Permission utilities for JWT tokens
 */
export const PermissionUtils = {
  /**
   * Check if a permission exists in a JWT payload
   */
  hasPermission: (jwtPayload: JWTPayload | null, permission: string): boolean => {
    if (!jwtPayload?.permissions) return false;
    
    // Map common permission strings to JWT permission structure
    const permissionMap: Record<string, keyof NonNullable<JWTPayload['permissions']>> = {
      'can_access_admin': 'can_access_admin',
      'can_manage_users': 'can_manage_users',
      'has_audit_access': 'has_audit_access',
      'has_compliance_access': 'has_compliance_access',
      'has_export_access': 'has_export_access',
      'is_superadmin': 'is_superadmin',
    };
    
    const mappedPermission = permissionMap[permission];
    return mappedPermission ? Boolean(jwtPayload.permissions[mappedPermission]) : false;
  },

  /**
   * Check if any of the provided permissions exist
   */
  hasAnyPermission: (jwtPayload: JWTPayload | null, permissions: string[]): boolean => {
    return permissions.some(permission => 
      PermissionUtils.hasPermission(jwtPayload, permission)
    );
  },

  /**
   * Check if all provided permissions exist
   */
  hasAllPermissions: (jwtPayload: JWTPayload | null, permissions: string[]): boolean => {
    return permissions.every(permission => 
      PermissionUtils.hasPermission(jwtPayload, permission)
    );
  },

  /**
   * Get all permissions for a user
   */
  getAllPermissions: (jwtPayload: JWTPayload | null): string[] => {
    if (!jwtPayload?.permissions) return [];
    
    const permissions: string[] = [];
    const permissionObj = jwtPayload.permissions;
    
    if (permissionObj.can_access_admin) permissions.push('can_access_admin');
    if (permissionObj.can_manage_users) permissions.push('can_manage_users');
    if (permissionObj.has_audit_access) permissions.push('has_audit_access');
    if (permissionObj.has_compliance_access) permissions.push('has_compliance_access');
    if (permissionObj.has_export_access) permissions.push('has_export_access');
    if (permissionObj.is_superadmin) permissions.push('is_superadmin');
    
    return permissions;
  },
};

/**
 * Route utilities for role-based access
 */
export const RouteUtils = {
  /**
   * Role-based route mapping
   */
  ROLE_ROUTES: {
    patient: ['/patient', '/profile', '/settings', '/messages'],
    provider: ['/provider', '/profile', '/settings', '/messages'],
    admin: ['/admin', '/profile', '/settings', '/messages'],
    superadmin: ['/admin', '/profile', '/settings', '/messages'],
    researcher: ['/researcher', '/profile', '/settings', '/messages'],
    compliance: ['/compliance', '/profile', '/settings', '/messages'],
    pharmco: ['/pharmco', '/profile', '/settings', '/messages'],
    caregiver: ['/caregiver', '/profile', '/settings', '/messages'],
  } as const,

  /**
   * Get allowed routes for a role
   */
  getRoleRoutes: (role: string): readonly string[] => {
    return RouteUtils.ROLE_ROUTES[role as keyof typeof RouteUtils.ROLE_ROUTES] || [];
  },

  /**
   * Check if user can access a route
   */
  canAccessRoute: (jwtPayload: JWTPayload | null, route: string): boolean => {
    if (!jwtPayload) return false;
    
    const allowedRoutes = RouteUtils.getRoleRoutes(jwtPayload.role);
    return allowedRoutes.some(allowedRoute => route.startsWith(allowedRoute));
  },
};

/**
 * Token utilities
 */
export const TokenUtils = {
  /**
   * Check if token needs refresh (5 minutes before expiration)
   */
  needsRefresh: (jwtPayload: JWTPayload | null): boolean => {
    if (!jwtPayload) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const timeToExpiration = jwtPayload.exp - now;
    
    return timeToExpiration < 5 * 60; // 5 minutes
  },

  /**
   * Get time to token expiration in seconds
   */
  getTimeToExpiration: (jwtPayload: JWTPayload | null): number => {
    if (!jwtPayload) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, jwtPayload.exp - now);
  },

  /**
   * Check if token is expired
   */
  isExpired: (jwtPayload: JWTPayload | null): boolean => {
    if (!jwtPayload) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return jwtPayload.exp <= now;
  },
};

/**
 * Development utilities
 */
export const DevUtils = {
  /**
   * Log authentication state for debugging
   */
  logAuthState: (jwtPayload: JWTPayload | null): void => {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.group('🔐 JWT Auth Debug');
    if (jwtPayload) {
      console.log('User ID:', jwtPayload.user_id);
      console.log('Email:', jwtPayload.email);
      console.log('Role:', jwtPayload.role);
      console.log('Session ID:', jwtPayload.session_id);
      console.log('Expires:', new Date(jwtPayload.exp * 1000));
      console.log('Permissions:', jwtPayload.permissions);
    } else {
      console.log('No authentication token');
    }
    console.groupEnd();
  },

  /**
   * Validate JWT payload structure
   */
  validatePayloadStructure: (jwtPayload: unknown): boolean => {
    if (!jwtPayload || typeof jwtPayload !== 'object') return false;
    
    const payload = jwtPayload as Record<string, unknown>;
    const requiredFields = ['user_id', 'email', 'role', 'exp', 'iat', 'session_id'];
    
    return requiredFields.every(field => field in payload);
  },
};

/**
 * Configuration and migration status
 */
export const AuthConfig = {
  /**
   * Check if JWT system is active
   */
  isJWTSystemActive: (): boolean => true,

  /**
   * Get migration status
   */
  getMigrationStatus: () => ({
    phase: 'complete' as const,
    features: [
      'JWT token validation',
      'Local permission checking',
      'Secure session management',
      'Permission-based routing',
      'Backend JWT integration',
    ],
    cleanedUp: [
      'Old HTTP-based token validation',
      'localStorage token storage',
      'Complex authentication guards',
      'Async permission resolution',
      'Race condition sources',
    ],
  }),
};

// Default export for easy importing
export default {
  PermissionUtils,
  RouteUtils,
  TokenUtils,
  DevUtils,
  AuthConfig,
};