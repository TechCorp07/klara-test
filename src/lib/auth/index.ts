// src/lib/auth/index.ts

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

// Specialized permission hooks
export {
  useAdminAccess,
  useUserManagementAccess,
  useAuditAccess,
  useComplianceAccess,
  useSystemSettingsAccess,
  useRoutePermissions,
  useTokenMonitoring,
} from './use-auth';

// Permission-based components
export {
  PermissionGate,
  AdminGate,
  UserManagementGate,
  AuditGate,
  RoleBasedRender,
  FeatureFlag,
  ConditionalRender,
  PermissionDebug,
} from '../../components/permissions/PermissionGate';

// API services
export { jwtAuthService, authService } from '../api/services/auth.service';
export { jwtApiClient, api, extractDataFromResponse } from '../api/client';

// Permission types
export type {
  JWTPermissions,
  CorePermissions,
  PatientPermissions,
  ProviderPermissions,
  AdminPermissions,
  ResearcherPermissions,
  CompliancePermissions,
  PermissionContext,
  PermissionCheckRequest,
  PermissionCheckResult,
  FeatureFlags,
  DashboardPermissions,
  NavigationPermissions,
  PermissionName,
  CorePermissionName,
  PermissionChecker,
  FeatureFlagChecker,
  PermissionHierarchy,
  PermissionHierarchyName,
} from '../../types/permissions.types';

// Permission constants
export { PERMISSION_HIERARCHIES } from '../../types/permissions.types';

/**
 * Main authentication hook for backward compatibility
 */
export { useJWTAuth as useAuth } from './use-auth';

/**
 * Main authentication provider for backward compatibility
 */
export { JWTAuthProvider as AuthProvider } from './auth-provider';

/**
 * Permission checking utilities
 */
export const PermissionUtils = {
  /**
   * Check if a permission exists in a JWT payload
   */
  hasPermission: (
    jwtPayload: JWTPayload | null,
    permission: keyof NonNullable<JWTPayload['permissions']>
  ): boolean => {
    return jwtPayload ? JWTValidator.hasPermission(jwtPayload, permission) : false;
  },

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission: (
    jwtPayload: JWTPayload | null,
    permissions: Array<keyof NonNullable<JWTPayload['permissions']>>
  ): boolean => {
    if (!jwtPayload) return false;
    return permissions.some(permission => JWTValidator.hasPermission(jwtPayload, permission));
  },

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions: (
    jwtPayload: JWTPayload | null,
    permissions: Array<keyof NonNullable<JWTPayload['permissions']>>
  ): boolean => {
    if (!jwtPayload) return false;
    return permissions.every(permission => JWTValidator.hasPermission(jwtPayload, permission));
  },

  /**
   * Get accessible routes for a user based on their JWT payload
   */
  getAccessibleRoutes: (jwtPayload: JWTPayload | null): string[] => {
    if (!jwtPayload) return [];

    const routes: string[] = [];
    const { role, permissions } = jwtPayload;

    // Base routes for all authenticated users
    routes.push('/profile', '/settings');

    // Role-specific routes
    switch (role) {
      case 'patient':
        routes.push('/patient', '/patient/appointments', '/patient/health-records');
        break;
      case 'provider':
        routes.push('/provider', '/provider/patients', '/provider/appointments');
        break;
      case 'admin':
      case 'superadmin':
        routes.push('/admin');
        if (permissions?.has_user_management_access) routes.push('/admin/users');
        if (permissions?.has_audit_access) routes.push('/admin/audit-logs');
        break;
      case 'researcher':
        routes.push('/researcher', '/researcher/studies');
        break;
      case 'compliance':
        routes.push('/compliance', '/compliance/audit-logs');
        break;
    }

    return routes;
  },

  /**
   * Check if user can access a specific route
   */
  canAccessRoute: (jwtPayload: JWTPayload | null, route: string): boolean => {
    const accessibleRoutes = PermissionUtils.getAccessibleRoutes(jwtPayload);
    return accessibleRoutes.some(accessibleRoute => 
      route === accessibleRoute || route.startsWith(accessibleRoute + '/')
    );
  },

  /**
   * Get the appropriate dashboard path for a user
   */
  getDashboardPath: (jwtPayload: JWTPayload | null): string => {
    if (!jwtPayload) return '/login';
    
    switch (jwtPayload.role) {
      case 'patient': return '/patient';
      case 'provider': return '/provider';
      case 'admin':
      case 'superadmin': return '/admin';
      case 'researcher': return '/researcher';
      case 'compliance': return '/compliance';
      default: return '/';
    }
  },
};

/**
 * Token management utilities
 */
export const TokenUtils = {
  /**
   * Check if a token needs refresh
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
    patient: ['/patient'],
    provider: ['/provider'],
    admin: ['/admin'],
    superadmin: ['/admin'],
    researcher: ['/researcher'],
    compliance: ['/compliance'],
    pharmco: ['/pharmco'],
    caregiver: ['/caregiver'],
  } as const,

  /**
   * Get allowed routes for a role
   */
  getRoleRoutes: (role: string): string[] => {
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
    
    const payload = jwtPayload as unknown;
    const requiredFields = ['user_id', 'email', 'role', 'exp', 'iat'];
    
    return requiredFields.every(field => field in (payload as Record<string, unknown>));
  },
};

/**
 * Legacy compatibility exports
 */
export type AuthContextType = UseJWTAuthReturn;

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
        'Automatic token refresh',
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
  JWTAuthProvider,
  useJWTAuth,
  JWTValidator,
  PermissionUtils,
  TokenUtils,
  RouteUtils,
  DevUtils,
};