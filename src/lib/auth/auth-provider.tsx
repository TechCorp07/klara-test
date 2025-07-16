// src/lib/auth/auth-provider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { JWTValidator, JWTPayload } from './validator';
import { 
  User, 
  UserRole,
  LoginCredentials,
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  AdminPermissions,
  PatientProfile,
  ProviderProfile,
  PharmcoProfile,
  CaregiverProfile,
  ResearcherProfile,
  ComplianceProfile,
} from '@/types/auth.types';

export interface EnhancedJWTAuthContextType {
  // Core authentication state
  user: User | null;
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
  
  // Computed permission properties (from your current provider)
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canManageUsers: boolean;
  canAccessAudit: boolean;
  canManageSystemSettings: boolean;
  
  // Enhanced computed permissions (from enhanced version)
  canEmergencyAccess: boolean;
  canAccessPatientData: boolean;
  canAccessResearchData: boolean;
  
  // Healthcare-specific permissions (from your current provider)
  hasMedicalRecordsAccess: boolean;
  canManageAppointments: boolean;
  canAccessTelemedicine: boolean;
  canManageMedications: boolean;
  canAccessClinicalTrials: boolean;
  
  // Utility methods
  getUserId: () => number | null;
  getUserRole: () => UserRole | null;
  getSessionId: () => string | null;
  
  // Feature flags system (from enhanced version)
  isFeatureEnabled: (flag: string) => boolean;
  
  // Route protection (from your current provider)
  isPublicRoute: boolean;
}

const EnhancedJWTAuthContext = createContext<EnhancedJWTAuthContextType | null>(null);

// Export the context for use in hooks
export { EnhancedJWTAuthContext };

// Public routes that don't require authentication (from your current provider)
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/reset-password',
  '/forgot-password',
  '/two-factor',
  '/approval-pending',
  '/unauthorized',
  '/compliance-violation',
  '/terms-of-service',
  '/privacy-policy',
  '/hipaa-notice',
  '/contact',
  '/about',
  '/help',
  '/support',
];

/**
 * Convert JWT payload to User object (from your current provider)
 * Enhanced with proper type safety and comprehensive permission mapping
 */
function jwtPayloadToUser(payload: JWTPayload): User {
  // Map backend permissions to frontend AdminPermissions structure
  const permissions: AdminPermissions = {
    // Core admin permissions
    has_admin_access: payload.permissions?.can_access_admin ?? false,
    has_user_management_access: payload.permissions?.can_manage_users ?? false,
    has_system_settings_access: payload.permissions?.can_access_admin ?? false,
    has_audit_access: payload.permissions?.has_audit_access ?? false,
    has_compliance_access: payload.permissions?.has_compliance_access ?? false,
    has_export_access: payload.permissions?.has_export_access ?? false,
    has_dashboard_access: payload.permissions?.can_access_admin ?? true,
    has_compliance_reports_access: payload.permissions?.has_compliance_reports_access ?? false,
    has_approval_permissions: payload.permissions?.has_approval_permissions ?? false,
    
    // Healthcare permissions
    has_patient_data_access: payload.permissions?.can_access_patient_data ?? false,
    has_medical_records_access: payload.permissions?.has_medical_records_access ?? false,
    can_manage_appointments: payload.permissions?.can_manage_appointments ?? false,
    can_access_telemedicine: payload.permissions?.can_access_telemedicine ?? false,
    can_manage_medications: payload.permissions?.can_manage_medications ?? false,
    can_view_research_data: payload.permissions?.can_access_research_data ?? false,
    can_access_clinical_trials: payload.permissions?.can_access_clinical_trials ?? false,
    
    // User permissions
    can_view_own_data: payload.permissions?.can_view_own_data ?? true,
    can_edit_own_profile: payload.permissions?.can_edit_own_profile ?? true,
    
    // Role info
    user_role: payload.role,
    is_superadmin: payload.permissions?.is_superadmin ?? false,
    
    // Optional profile-specific fields
    identity_verified: payload.permissions?.identity_verified,
  };

  return {
    id: payload.user_id,
    username: payload.username,
    email: payload.email,
    first_name: '', // Will be populated from backend when needed
    last_name: '',
    role: payload.role,
    is_active: true,
    is_approved: payload.is_approved ?? true,
    is_staff: payload.permissions?.is_staff ?? false,
    is_superuser: payload.permissions?.is_superadmin ?? false,
    email_verified: payload.email_verified ?? false,
    two_factor_enabled: payload.two_factor_enabled ?? false,
    date_joined: new Date(payload.iat * 1000).toISOString(),
    last_login: new Date().toISOString(),
    phone_verified: false,
    permissions,
    
    // Profile fields - set to undefined instead of null to match type definition
    patient_profile: undefined,
    provider_profile: undefined,
    pharmco_profile: undefined,
    caregiver_profile: undefined,
    researcher_profile: undefined,
    compliance_profile: undefined,
  };
}

interface EnhancedJWTAuthProviderProps {
  children: ReactNode;
}

export function EnhancedJWTAuthProvider({ children }: EnhancedJWTAuthProviderProps) {
  // Core authentication state
  const [user, setUser] = useState<User | null>(null);
  const [jwtPayload, setJwtPayload] = useState<JWTPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tokenNeedsRefresh, setTokenNeedsRefresh] = useState(false);
  const [timeToExpiration, setTimeToExpiration] = useState<number | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();

  // Check if current route is public (from your current provider)
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || 
    pathname.startsWith('/verify-email/') || 
    pathname.startsWith('/reset-password/');

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  // Monitor token expiration (from enhanced version)
  useEffect(() => {
    if (jwtPayload) {
      const expirationTime = jwtPayload.exp * 1000;
      const currentTime = Date.now();
      const timeRemaining = expirationTime - currentTime;
      
      setTimeToExpiration(Math.max(0, timeRemaining));
      setTokenNeedsRefresh(timeRemaining < 5 * 60 * 1000); // 5 minutes

      // Set up automatic refresh
      if (timeRemaining > 0 && timeRemaining < 5 * 60 * 1000) {
        const refreshTimeout = setTimeout(() => {
          refreshToken();
        }, Math.max(1000, timeRemaining - 60000)); // Refresh 1 minute before expiry

        return () => clearTimeout(refreshTimeout);
      }
    }
  }, [jwtPayload]);

  /**
   * Initialize authentication state from JWT cookie (from your current provider)
   */
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Try to extract token from HTTP-only cookie via API
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const { token } = await response.json();
        
        if (token) {
          const validationResult = JWTValidator.validateToken(token);
          
          if (validationResult.isValid && validationResult.payload) {
            const userFromJWT = jwtPayloadToUser(validationResult.payload);
            
            setUser(userFromJWT);
            setJwtPayload(validationResult.payload);
            setTokenNeedsRefresh(validationResult.needsRefresh ?? false);
            setTimeToExpiration(validationResult.expiresIn ?? null);
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  /**
   * Login method (from your current provider with enhancements)
   */
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const loginResponse: LoginResponse = await response.json();
      
          // Handle successful login with JWT token
      if (loginResponse.token) {
        const validationResult = JWTValidator.validateToken(loginResponse.token);
        
        if (validationResult.isValid && validationResult.payload) {
          const userFromJWT = jwtPayloadToUser(validationResult.payload);
          
          setUser(userFromJWT);
          setJwtPayload(validationResult.payload);
          setTokenNeedsRefresh(validationResult.needsRefresh ?? false);
          setTimeToExpiration(validationResult.expiresIn ?? null);
          
          // Enhanced redirect logic based on role
          const userRole = validationResult.payload.role;
          router.push(`/${userRole}`);
          
          console.log('✅ Login successful');
        }
      }

      return loginResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register method (from your current provider)
   */
  const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout method (from your current provider)
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear auth state
      setUser(null);
      setJwtPayload(null);
      setTokenNeedsRefresh(false);
      setTimeToExpiration(null);
      
      router.push('/login');
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if logout call fails
      setUser(null);
      setJwtPayload(null);
      setTokenNeedsRefresh(false);
      setTimeToExpiration(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Token refresh method (enhanced from both versions)
   */
  const refreshToken = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const { token } = await response.json();
        
        if (token) {
          const validationResult = JWTValidator.validateToken(token);
          
          if (validationResult.isValid && validationResult.payload) {
            const userFromJWT = jwtPayloadToUser(validationResult.payload);
            
            setUser(userFromJWT);
            setJwtPayload(validationResult.payload);
            setTokenNeedsRefresh(false);
            setTimeToExpiration(validationResult.expiresIn ?? null);
            
            console.log('✅ Token refreshed successfully');
          }
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  };

  // Permission checking methods (enhanced from both versions)
  const hasPermission = useCallback((permission: string): boolean => {
    return jwtPayload ? JWTValidator.hasPermission(jwtPayload, permission) : false;
  }, [jwtPayload]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Computed permission properties (from both versions)
  const isAdmin = hasPermission('is_admin') || hasPermission('can_access_admin');
  const isSuperAdmin = hasPermission('is_superadmin');
  const canManageUsers = hasPermission('can_manage_users');
  const canAccessAudit = hasPermission('has_audit_access');
  const canManageSystemSettings = hasPermission('can_access_admin');
  const canEmergencyAccess = hasPermission('can_emergency_access');
  const canAccessPatientData = hasPermission('can_access_patient_data');
  const canAccessResearchData = hasPermission('can_access_research_data');
  
  // Healthcare-specific permissions (from your current provider)
  const hasMedicalRecordsAccess = hasPermission('has_medical_records_access');
  const canManageAppointments = hasPermission('can_manage_appointments');
  const canAccessTelemedicine = hasPermission('can_access_telemedicine');
  const canManageMedications = hasPermission('can_manage_medications');
  const canAccessClinicalTrials = hasPermission('can_access_clinical_trials');

  // Utility methods (from enhanced version)
  const getUserId = useCallback((): number | null => {
    return jwtPayload?.user_id ?? null;
  }, [jwtPayload]);

  const getUserRole = useCallback((): UserRole | null => {
    return jwtPayload?.role ?? null;
  }, [jwtPayload]);

  const getSessionId = useCallback((): string | null => {
    return jwtPayload?.session_id ?? null;
  }, [jwtPayload]);

  // Feature flag system (from enhanced version)
  const isFeatureEnabled = useCallback((flag: string): boolean => {
    const featureFlags: Record<string, boolean> = {
      'user_management': canManageUsers,
      'emergency_access': canEmergencyAccess,
      'patient_data_access': canAccessPatientData,
      'research_data_access': canAccessResearchData,
      'system_monitoring': canManageSystemSettings,
      'audit_logs': canAccessAudit,
      'telemedicine_access': canAccessTelemedicine || getUserRole() === 'patient' || getUserRole() === 'provider',
      'medical_records': hasMedicalRecordsAccess,
      'appointment_management': canManageAppointments,
      'medication_management': canManageMedications,
      'clinical_trials': canAccessClinicalTrials,
      'custom_reports': canManageSystemSettings,
    };

    return featureFlags[flag] || false;
  }, [
    canManageUsers, canEmergencyAccess, canAccessPatientData, canAccessResearchData,
    canManageSystemSettings, canAccessAudit, canAccessTelemedicine, hasMedicalRecordsAccess,
    canManageAppointments, canManageMedications, canAccessClinicalTrials, getUserRole
  ]);

  // Build context value
  const contextValue: EnhancedJWTAuthContextType = {
    // Core state
    user,
    isAuthenticated: !!user && !!jwtPayload,
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
    
    // Permission methods
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Computed permissions (from your current provider)
    isAdmin,
    isSuperAdmin,
    canManageUsers,
    canAccessAudit,
    canManageSystemSettings,
    
    // Enhanced computed permissions (from enhanced version)
    canEmergencyAccess,
    canAccessPatientData,
    canAccessResearchData,
    
    // Healthcare-specific permissions (from your current provider)
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
  };

  return (
    <EnhancedJWTAuthContext.Provider value={contextValue}>
      {children}
    </EnhancedJWTAuthContext.Provider>
  );
}

// Export for backward compatibility - provider only
export { EnhancedJWTAuthProvider as JWTAuthProvider };
export { EnhancedJWTAuthProvider as AuthProvider };

// Export types for backward compatibility
export type { EnhancedJWTAuthContextType as JWTAuthContextType };

export default EnhancedJWTAuthProvider;