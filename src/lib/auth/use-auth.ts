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
  
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // Additional auth methods that components might expect
  requestPasswordReset?: (email: string) => Promise<{ detail?: string; success?: boolean; message?: string }>;
  resetPassword?: (token: string, password: string) => Promise<{ detail?: string; success?: boolean; message?: string }>;
  verifyTwoFactor?: (userId: number, code: string) => Promise<LoginResponse>;
  verifyEmail?: (token: string) => Promise<{ success: boolean; message: string }>;
  
  // Permission checking methods - Updated to handle string permissions
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

  // Fallback implementations for methods that components might expect
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
    
    // Additional methods for backward compatibility
    requestPasswordReset,
    resetPassword,
    verifyTwoFactor,
    verifyEmail,
    
    // Permission methods - now handle string permissions
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

// Export default and compatibility exports
export default useJWTAuth;

// For backward compatibility, export as useAuth as well
export { useJWTAuth as useAuth };