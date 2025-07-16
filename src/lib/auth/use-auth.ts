// src/lib/auth/use-auth.ts
import { useContext } from 'react';
import { JWTAuthContext } from './auth-provider';
import { JWTPayload } from './validator';
import { UserRole } from '@/types/auth.types';

/**
 * Extended authentication hook interface
 */
export interface UseJWTAuthReturn {
  // Core authentication state
  user: unknown | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  // JWT-specific state
  jwtPayload: JWTPayload | null;
  tokenNeedsRefresh: boolean;
  timeToExpiration: number | null;
  
  // Authentication methods
  login: (credentials: { email: string; password: string }) => Promise<unknown>;
  register: (userData: unknown) => Promise<unknown>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // Permission checking methods (instant, no async)
  hasPermission: (permission: keyof NonNullable<JWTPayload['permissions']>) => boolean;
  hasAnyPermission: (permissions: Array<keyof NonNullable<JWTPayload['permissions']>>) => boolean;
  hasAllPermissions: (permissions: Array<keyof NonNullable<JWTPayload['permissions']>>) => boolean;
  
  // Role-based access methods (instant, computed from JWT)
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canManageUsers: boolean;
  canAccessAudit: boolean;
  canManageSystemSettings: boolean;
  canAccessCompliance: boolean;
  canExportData: boolean;
  
  // User information methods (instant, from JWT payload)
  getUserId: () => number | null;
  getUserRole: () => UserRole | null;
  getUserEmail: () => string | null;
  getSessionId: () => string | null;
  
  // Utility methods for dashboard logic
  getAccessibleRoutes: () => string[];
  canAccessRoute: (route: string) => boolean;
  getDashboardPath: () => string;
  
  // Token monitoring utilities
  formatTimeToExpiration: () => string;
  isTokenExpiringSoon: () => boolean;
}

/**
 * Main JWT authentication hook
 */
export function useJWTAuth(): UseJWTAuthReturn {
  const context = useContext(JWTAuthContext);
  
  if (!context) {
    throw new Error('useJWTAuth must be used within a JWTAuthProvider');
  }

  // Extract context values for easier access
  const {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    jwtPayload,
    tokenNeedsRefresh,
    timeToExpiration,
    login,
    register,
    logout,
    refreshToken,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isSuperAdmin,
    canManageUsers,
    canAccessAudit,
    canManageSystemSettings,
    getUserId,
    getUserRole,
    getSessionId,
  } = context;

  /**
   * Get user email from JWT payload
   */
  const getUserEmail = (): string | null => {
    return jwtPayload?.email || null;
  };

  /**
   * Check if user has compliance access
   */
  const canAccessCompliance = hasPermission('has_compliance_access');

  /**
   * Check if user can export data
   */
  const canExportData = hasPermission('has_export_access');

  /**
   * Get accessible routes based on user permissions
   */
  const getAccessibleRoutes = (): string[] => {
    if (!jwtPayload) return [];

    const routes: string[] = [];
    const { role } = jwtPayload;

    // Base routes available to all authenticated users
    routes.push('/profile', '/settings');

    // Role-specific routes
    switch (role) {
      case 'patient':
        routes.push(
          '/patient',
          '/patient/appointments',
          '/patient/health-records',
          '/patient/medications',
          '/patient/profile'
        );
        
        // Conditional patient features based on permissions
        if (hasPermission('can_view_phi')) {
          routes.push('/patient/health-records/detailed');
        }
        break;

      case 'provider':
        routes.push(
          '/provider',
          '/provider/patients',
          '/provider/appointments',
          '/provider/clinical-notes'
        );
        
        // Conditional provider features
        if (hasPermission('can_approve_users')) {
          routes.push('/provider/approvals');
        }
        break;

      case 'admin':
      case 'superadmin':
        routes.push('/admin');
        
        // Permission-based admin routes
        if (canManageUsers) {
          routes.push('/admin/users', '/admin/approvals');
        }
        
        if (canAccessAudit) {
          routes.push('/admin/audit-logs');
        }
        
        if (canManageSystemSettings) {
          routes.push('/admin/system-settings');
        }
        
        if (canAccessCompliance) {
          routes.push('/admin/compliance');
        }
        
        if (hasPermission('has_admin_access')) {
          routes.push('/admin/monitoring', '/admin/reports');
        }
        break;

      case 'pharmco':
        routes.push(
          '/pharmco',
          '/pharmco/research',
          '/pharmco/clinical-trials',
          '/pharmco/reports'
        );
        break;

      case 'researcher':
        routes.push(
          '/researcher',
          '/researcher/studies',
          '/researcher/data-analysis',
          '/researcher/publications'
        );
        break;

      case 'caregiver':
        routes.push(
          '/caregiver',
          '/caregiver/patients',
          '/caregiver/appointments'
        );
        break;

      case 'compliance':
        routes.push(
          '/compliance',
          '/compliance/audit-logs',
          '/compliance/emergency-access',
          '/compliance/consent-management'
        );
        break;
    }

    return routes;
  };

  /**
   * Check if user can access a specific route
   */
  const canAccessRoute = (route: string): boolean => {
    if (!jwtPayload) return false;

    // Public routes are always accessible
    const publicRoutes = ['/', '/profile', '/settings'];
    if (publicRoutes.includes(route)) return true;

    // Check against accessible routes
    const accessibleRoutes = getAccessibleRoutes();
    return accessibleRoutes.some(accessibleRoute => 
      route === accessibleRoute || route.startsWith(accessibleRoute + '/')
    );
  };

  /**
   * Get the appropriate dashboard path for the user
   */
  const getDashboardPath = (): string => {
    if (!jwtPayload) return '/login';

    const { role } = jwtPayload;

    // Return role-specific dashboard paths
    switch (role) {
      case 'patient':
        return '/patient';
      case 'provider':
        return '/provider';
      case 'admin':
      case 'superadmin':
        return '/admin';
      case 'pharmco':
        return '/pharmco';
      case 'researcher':
        return '/researcher';
      case 'caregiver':
        return '/caregiver';
      case 'compliance':
        return '/compliance';
      default:
        return '/';
    }
  };

  /**
   * Format time to expiration in human-readable format
   */
  const formatTimeToExpiration = (): string => {
    if (!timeToExpiration) return 'Unknown';

    const minutes = Math.floor(timeToExpiration / 60);
    const seconds = timeToExpiration % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  /**
   * Check if token is expiring soon
   */
  const isTokenExpiringSoon = (): boolean => {
    if (!timeToExpiration) return false;
    
    // Consider "soon" to be less than 5 minutes
    return timeToExpiration < 300;
  };

  // Return the complete hook interface
  return {
    // Core authentication state
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    
    // JWT-specific state
    jwtPayload,
    tokenNeedsRefresh,
    timeToExpiration,
    
    // Authentication methods
    login,
    register,
    logout,
    refreshToken,
    
    // Permission checking methods
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Role-based access methods
    isAdmin,
    isSuperAdmin,
    canManageUsers,
    canAccessAudit,
    canManageSystemSettings,
    canAccessCompliance,
    canExportData,
    
    // User information methods
    getUserId,
    getUserRole,
    getUserEmail,
    getSessionId,
    
    // Utility methods for dashboard logic
    getAccessibleRoutes,
    canAccessRoute,
    getDashboardPath,
    
    // Token monitoring utilities
    formatTimeToExpiration,
    isTokenExpiringSoon,
  };
}

/**
 * Convenience hooks for specific permission checks
 */

export function useAdminAccess() {
  const { isAdmin, isLoading } = useJWTAuth();
  return { hasAccess: isAdmin, isLoading };
}

export function useUserManagementAccess() {
  const { canManageUsers, isLoading } = useJWTAuth();
  return { hasAccess: canManageUsers, isLoading };
}

export function useAuditAccess() {
  const { canAccessAudit, isLoading } = useJWTAuth();
  return { hasAccess: canAccessAudit, isLoading };
}

export function useComplianceAccess() {
  const { canAccessCompliance, isLoading } = useJWTAuth();
  return { hasAccess: canAccessCompliance, isLoading };
}

export function useSystemSettingsAccess() {
  const { canManageSystemSettings, isLoading } = useJWTAuth();
  return { hasAccess: canManageSystemSettings, isLoading };
}

/**
 * Hook for permission-based route guards
 */
export function useRoutePermissions() {
  const { canAccessRoute, getAccessibleRoutes, getDashboardPath } = useJWTAuth();
  
  return {
    canAccessRoute,
    getAccessibleRoutes,
    getDashboardPath,
  };
}

/**
 * Hook for token monitoring and refresh logic
 */
export function useTokenMonitoring() {
  const { 
    tokenNeedsRefresh, 
    timeToExpiration, 
    formatTimeToExpiration, 
    isTokenExpiringSoon,
    refreshToken 
  } = useJWTAuth();
  
  return {
    tokenNeedsRefresh,
    timeToExpiration,
    formatTimeToExpiration,
    isTokenExpiringSoon,
    refreshToken,
  };
}

export default useJWTAuth;