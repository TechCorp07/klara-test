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
  RegisterResponse,
  SetupTwoFactorResponse, 
  EmergencyAccessSummary,
  EmergencyAccessRecord,
  User
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
  resetPassword: (data: { token: string; password: string; confirm_password: string }) => Promise<{ detail?: string; success?: boolean; message?: string }>;
  setupTwoFactor: () => Promise<SetupTwoFactorResponse>;
  updateUserProfileImage: (imageUrl: string | null) => void;
  confirmTwoFactor: (code: string) => Promise<{ success: boolean; message: string; backup_codes?: string[] }>;
  disableTwoFactor: (code: string) => Promise<{ success: boolean; message: string }>;
  verifyTwoFactor: (userId: number, code: string) => Promise<{ token: string; refresh_token: string; user: User; expires_in: number; }>;
  verifyEmail: (data: { token: string; email?: string }) => Promise<{ success: boolean; message: string; detail?: string }>;
  requestEmailVerification: () => Promise<{ detail?: string; success?: boolean; message?: string }>;
  request2FAEmailBackup: (userId: number) => Promise<{ success: boolean; message: string }>;
  verify2FAEmailBackup: (userId: number, backupCode: string) => Promise<string | { success: boolean; message: string }>;

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
  getEmergencyAccessSummary: () => Promise<EmergencyAccessSummary>;
  initiateEmergencyAccess: (data: { patient_identifier: string; reason: string; detailed_reason?: string }) => Promise<{ success: boolean; message: string; access_id?: number; expires_in?: number }>;
  endEmergencyAccess: (accessId: number, reason?: string) => Promise<{ success: boolean; message: string }>;
  reviewEmergencyAccess: (accessId: number, data: { justified: boolean; notes?: string }) => Promise<{ success: boolean; message: string }>;
  getEmergencyAccessRecords: (filters?: { reviewed?: boolean; status?: string }) => Promise<EmergencyAccessRecord[]>;
  updateConsent: (consentType: string, consentValue: boolean) => Promise<{ success: boolean; message: string }>;
}

/**
 * Main JWT authentication hook
 */
export function useJWTAuth(): UseJWTAuthReturn {
  const context = useContext(JWTAuthContext);
  
  if (!context) {
    throw new Error('useJWTAuth must be used within a JWTAuthProvider');
  }

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
    logoutAllTabs: context.logoutAllTabs,
    refreshToken: context.refreshToken,
    updateUserProfileImage: context.updateUserProfileImage,
    resetPassword: context.resetPassword,
    setupTwoFactor: context.setupTwoFactor,
    confirmTwoFactor: context.confirmTwoFactor,
    disableTwoFactor: context.disableTwoFactor,
    verifyEmail: context.verifyEmail,
    requestEmailVerification: context.requestEmailVerification,
    verify2FAEmailBackup: context.verify2FAEmailBackup,
    request2FAEmailBackup: context.request2FAEmailBackup,
    verifyTwoFactor: context.verifyTwoFactor,

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
    getEmergencyAccessSummary: context.getEmergencyAccessSummary,
    initiateEmergencyAccess: context.initiateEmergencyAccess,
    endEmergencyAccess: context.endEmergencyAccess,
    reviewEmergencyAccess: context.reviewEmergencyAccess,
    getEmergencyAccessRecords: context.getEmergencyAccessRecords,
    updateConsent: context.updateConsent,
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