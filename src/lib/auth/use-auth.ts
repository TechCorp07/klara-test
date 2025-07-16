// src/lib/auth/use-auth.ts
'use client';

import { useContext } from 'react';
import { EnhancedJWTAuthContext, type EnhancedJWTAuthContextType } from './auth-provider';
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
  user: EnhancedJWTAuthContextType['user'];
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
  
  // Permission checking methods
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  
  // Role-based access methods
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canManageUsers: boolean;
  canAccessAudit: boolean;
  canManageSystemSettings: boolean;
  
  // Enhanced permissions
  canEmergencyAccess: boolean;
  canAccessPatientData: boolean;
  canAccessResearchData: boolean;
  hasMedicalRecordsAccess: boolean;
  canManageAppointments: boolean;
  canAccessTelemedicine: boolean;
  canManageMedications: boolean;
  canAccessClinicalTrials: boolean;
  
  // Utility methods
  getUserId: () => number | null;
  getUserRole: () => UserRole | null;
  getSessionId: () => string | null;
  
  // Feature flags
  isFeatureEnabled: (flag: string) => boolean;
  
  // Route protection
  isPublicRoute: boolean;
  
  // Additional computed properties for easier access
  currentUserId: number | null;
  currentUserRole: UserRole | null;
  currentSessionId: string | null;
  
  // Permission helpers
  isPatient: boolean;
  isProvider: boolean;
  isPharmco: boolean;
  isCaregiver: boolean;
  isResearcher: boolean;
  isCompliance: boolean;
  
  // Quick access to common permissions
  canViewOwnData: boolean;
  canEditOwnProfile: boolean;
  hasIdentityVerified: boolean;
  
  // Token status helpers
  isTokenExpiringSoon: boolean;
  tokenExpirationMinutes: number | null;
  
  // Enhanced feature checks
  canAccessDashboard: boolean;
  canAccessUserManagement: boolean;
  canAccessReports: boolean;
  canAccessSystemSettings: boolean;
}

/**
 * Main JWT authentication hook - Enhanced with all features
 * This is the single hook that replaces your existing useAuth
 */
export function useJWTAuth(): UseJWTAuthReturn {
  const context = useContext(EnhancedJWTAuthContext);
  
  if (!context) {
    throw new Error('useJWTAuth must be used within an EnhancedJWTAuthProvider');
  }

  // Properly destructure context with type safety
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
    canEmergencyAccess,
    canAccessPatientData,
    canAccessResearchData,
    hasMedicalRecordsAccess,
    canManageAppointments,
    canAccessTelemedicine,
    canManageMedications,
    canAccessClinicalTrials,
    getUserId,
    getUserRole,
    getSessionId,
    isFeatureEnabled,
    isPublicRoute,
  } = context;

  // Additional computed properties
  const currentUserId = getUserId();
  const currentUserRole = getUserRole();
  const currentSessionId = getSessionId();
  
  // Role-based boolean helpers
  const isPatient = currentUserRole === 'patient';
  const isProvider = currentUserRole === 'provider';
  const isPharmco = currentUserRole === 'pharmco';
  const isCaregiver = currentUserRole === 'caregiver';
  const isResearcher = currentUserRole === 'researcher';
  const isCompliance = currentUserRole === 'compliance';
  
  // Permission helpers for common use cases
  const canViewOwnData = hasPermission('can_view_own_data');
  const canEditOwnProfile = hasPermission('can_edit_own_profile');
  const hasIdentityVerified = hasPermission('identity_verified') || false;
  
  // Token status helpers
  const isTokenExpiringSoon = timeToExpiration !== null && timeToExpiration < 10 * 60 * 1000; // 10 minutes
  const tokenExpirationMinutes = timeToExpiration !== null ? Math.floor(timeToExpiration / (60 * 1000)) : null;
  
  // Enhanced feature checks
  const canAccessDashboard = isFeatureEnabled('system_monitoring') || hasPermission('has_dashboard_access');
  const canAccessUserManagement = isFeatureEnabled('user_management');
  const canAccessReports = isFeatureEnabled('custom_reports');
  const canAccessSystemSettings = isFeatureEnabled('system_monitoring');

  // Return all context methods and properties with proper typing
  return {
    // Core state
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    
    // JWT state
    jwtPayload,
    tokenNeedsRefresh,
    timeToExpiration,
    
    // Authentication methods
    login,
    register,
    logout,
    refreshToken,
    
    // Permission methods
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Computed permissions
    isAdmin,
    isSuperAdmin,
    canManageUsers,
    canAccessAudit,
    canManageSystemSettings,
    canEmergencyAccess,
    canAccessPatientData,
    canAccessResearchData,
    hasMedicalRecordsAccess,
    canManageAppointments,
    canAccessTelemedicine,
    canManageMedications,
    canAccessClinicalTrials,
    
    // Utility methods
    getUserId,
    getUserRole,
    getSessionId,
    
    // Feature flags
    isFeatureEnabled,
    
    // Route protection
    isPublicRoute,
    
    // Additional computed properties
    currentUserId,
    currentUserRole,
    currentSessionId,
    
    // Role helpers
    isPatient,
    isProvider,
    isPharmco,
    isCaregiver,
    isResearcher,
    isCompliance,
    
    // Permission helpers
    canViewOwnData,
    canEditOwnProfile,
    hasIdentityVerified,
    
    // Token status helpers
    isTokenExpiringSoon,
    tokenExpirationMinutes,
    
    // Enhanced feature checks
    canAccessDashboard,
    canAccessUserManagement,
    canAccessReports,
    canAccessSystemSettings,
  };
}

// Export for backward compatibility
export { useJWTAuth as useAuth };
export default useJWTAuth;