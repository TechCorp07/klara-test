// src/lib/auth/use-auth.ts

'use client';

import { useContext, useCallback } from 'react';
import { JWTAuthContext, type JWTAuthContextType } from './auth-provider';
import { JWTPayload } from './validator';
import { 
  UserRole, 
  LoginCredentials, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse 
} from '@/types/auth.types';

export interface UseJWTAuthReturn {
  // Core authentication state
  user: JWTAuthContextType['user'];
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  // JWT-specific state
  jwtPayload: JWTPayload | null;
  tokenNeedsRefresh: boolean;
  timeToExpiration: number | null;
  
  // Authentication methods - Fixed types to match backend expectations
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // Permission checking methods
  hasPermission: (permission: keyof NonNullable<JWTPayload['permissions']>) => boolean;
  hasAnyPermission: (permissions: Array<keyof NonNullable<JWTPayload['permissions']>>) => boolean;
  hasAllPermissions: (permissions: Array<keyof NonNullable<JWTPayload['permissions']>>) => boolean;
  
  // Role-based access methods
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canManageUsers: boolean;
  canAccessAudit: boolean;
  canManageSystemSettings: boolean;
  
  // Utility methods - Fixed return type
  getUserId: () => number | null;
  getUserRole: () => UserRole | null;
  getSessionId: () => string | null;
}

/**
 * Main JWT authentication hook
 */
export function useJWTAuth(): UseJWTAuthReturn {
  const context = useContext(JWTAuthContext);
  
  if (!context) {
    throw new Error('useJWTAuth must be used within a JWTAuthProvider');
  }

  // Return all context methods and properties with proper typing
  return {
    // Core state
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    isInitialized: context.isInitialized,
    
    // JWT-specific state
    jwtPayload: context.jwtPayload,
    tokenNeedsRefresh: context.tokenNeedsRefresh,
    timeToExpiration: context.timeToExpiration,
    
    // Authentication methods - already properly typed in context
    login: context.login,
    register: context.register,
    logout: context.logout,
    refreshToken: context.refreshToken,
    
    // Permission methods
    hasPermission: context.hasPermission,
    hasAnyPermission: context.hasAnyPermission,
    hasAllPermissions: context.hasAllPermissions,
    
    // Computed permissions
    isAdmin: context.isAdmin,
    isSuperAdmin: context.isSuperAdmin,
    canManageUsers: context.canManageUsers,
    canAccessAudit: context.canAccessAudit,
    canManageSystemSettings: context.canManageSystemSettings,
    
    // Utility methods
    getUserId: context.getUserId,
    getUserRole: context.getUserRole,
    getSessionId: context.getSessionId,
  };
}

/**
 * Specialized hooks for common permission checks
 */

export function useAdminAccess() {
  const { hasPermission } = useJWTAuth();
  return useCallback(() => hasPermission('has_admin_access'), [hasPermission]);
}

export function useUserManagementAccess() {
  const { hasPermission } = useJWTAuth();
  return useCallback(() => hasPermission('has_user_management_access'), [hasPermission]);
}

export function useAuditAccess() {
  const { hasPermission } = useJWTAuth();
  return useCallback(() => hasPermission('has_audit_access'), [hasPermission]);
}

export function useComplianceAccess() {
  const { hasPermission } = useJWTAuth();
  return useCallback(() => hasPermission('has_compliance_access'), [hasPermission]);
}

export function useSystemSettingsAccess() {
  const { hasPermission } = useJWTAuth();
  return useCallback(() => hasPermission('has_system_settings_access'), [hasPermission]);
}

/**
 * Hook for checking route-based permissions
 */
export function useRoutePermissions(routePath: string) {
  const { hasPermission, jwtPayload } = useJWTAuth();
  
  return useCallback(() => {
    if (!jwtPayload) return false;
    
    // Define route permission mappings
    if (routePath.startsWith('/admin')) {
      return hasPermission('has_admin_access');
    }
    
    if (routePath.startsWith('/audit')) {
      return hasPermission('has_audit_access');
    }
    
    if (routePath.startsWith('/compliance')) {
      return hasPermission('has_compliance_access');
    }
    
    if (routePath.startsWith('/users')) {
      return hasPermission('has_user_management_access');
    }
    
    if (routePath.startsWith('/settings')) {
      return hasPermission('has_system_settings_access');
    }
    
    // Default: allow access for authenticated users
    return true;
  }, [routePath, hasPermission, jwtPayload]);
}

/**
 * Hook for monitoring token expiration
 */
export function useTokenMonitoring() {
  const { timeToExpiration, tokenNeedsRefresh, refreshToken } = useJWTAuth();
  
  const formatTimeRemaining = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }, []);
  
  const isExpiringSoon = useCallback((thresholdMinutes: number = 5): boolean => {
    return timeToExpiration !== null && timeToExpiration < (thresholdMinutes * 60);
  }, [timeToExpiration]);
  
  return {
    timeToExpiration,
    tokenNeedsRefresh,
    refreshToken,
    formatTimeRemaining: timeToExpiration ? formatTimeRemaining(timeToExpiration) : null,
    isExpiringSoon: isExpiringSoon(),
  };
}

export default useJWTAuth;