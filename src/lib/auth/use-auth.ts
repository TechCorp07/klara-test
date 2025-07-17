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
  
  // Tab-specific state
  tabId: string;
  isTabAuthenticated: boolean;

  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  logoutAllTabs: () => Promise<void>;
  refreshToken: () => Promise<void>;
  
  requestPasswordReset?: (email: string) => Promise<{ detail?: string; success?: boolean; message?: string }>;
  resetPassword?: (token: string, password: string) => Promise<{ detail?: string; success?: boolean; message?: string }>;
  verifyTwoFactor?: (userId: number, code: string) => Promise<LoginResponse>;
  verifyEmail?: (token: string) => Promise<{ success: boolean; message: string }>;
  
  // Permission methods
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  
  // Role-based access methods
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canManageUsers: boolean;
  canAccessAudit: boolean;
  canManageSystemSettings: boolean;
  
  // Utility methods
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

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      return { 
        detail: data.message || 'Password reset email sent',
        success: response.ok,
        message: data.message || 'Password reset email sent'
      };
    } catch (error) {
      throw new Error('Password reset request failed');
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      return {
        detail: data.message || 'Password reset successful',
        success: response.ok,
        message: data.message || 'Password reset successful'
      };
    } catch (error) {
      throw new Error('Password reset failed');
    }
  }, []);

  const verifyTwoFactor = useCallback(async (userId: number, code: string): Promise<LoginResponse> => {
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, code }),
      });
      
      if (!response.ok) {
        throw new Error('Two-factor verification failed');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Two-factor verification failed');
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      const data = await response.json();
      return {
        success: response.ok,
        message: data.message || 'Email verification processed'
      };
    } catch (error) {
      throw new Error('Email verification failed');
    }
  }, []);

  // Return all properties from context, ensuring we match the interface
  return {
    // Core state
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    isInitialized: context.isInitialized,
    
    // JWT state
    jwtPayload: context.jwtPayload,
    tokenNeedsRefresh: context.tokenNeedsRefresh,
    timeToExpiration: context.timeToExpiration,
    
    // Tab state
    tabId: context.tabId,
    isTabAuthenticated: context.isTabAuthenticated,
    
    // Methods
    login: context.login,
    register: context.register,
    logout: context.logout,
    logoutAllTabs: context.logoutAllTabs, // Now properly included
    refreshToken: context.refreshToken,
    
    // Permission methods
    hasPermission: context.hasPermission,
    hasAnyPermission: context.hasAnyPermission,
    hasAllPermissions: context.hasAllPermissions,
    
    // Role methods
    isAdmin: context.isAdmin,
    isSuperAdmin: context.isSuperAdmin,
    canManageUsers: context.canManageUsers,
    canAccessAudit: context.canAccessAudit,
    canManageSystemSettings: context.canManageSystemSettings,
    
    // Utilities
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
 * Hook to check if user has specific permission
 */
export function usePermission(permission: string): boolean {
  const { hasPermission } = useJWTAuth();
  return hasPermission(permission);
}

/**
 * Hook to check if user has any of the specified permissions
 */
export function useAnyPermission(permissions: string[]): boolean {
  const { hasAnyPermission } = useJWTAuth();
  return hasAnyPermission(permissions);
}

/**
 * Hook to check if user has all specified permissions
 */
export function useAllPermissions(permissions: string[]): boolean {
  const { hasAllPermissions } = useJWTAuth();
  return hasAllPermissions(permissions);
}

/**
 * Hook to check if user has specific role
 */
export function useRole(role: string): boolean {
  const { user } = useJWTAuth();
  return user?.role === role;
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useAnyRole(roles: string[]): boolean {
  const { user } = useJWTAuth();
  return user ? roles.includes(user.role) : false;
}

export default useJWTAuth;