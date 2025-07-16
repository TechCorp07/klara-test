// src/lib/auth/auth-provider.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { JWTValidator, JWTPayload } from './validator';
import { config } from '@/lib/config';
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

export interface JWTAuthContextType {
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
  
  // Permission checking methods (extracted from JWT)
  hasPermission: (permission: keyof NonNullable<JWTPayload['permissions']>) => boolean;
  hasAnyPermission: (permissions: Array<keyof NonNullable<JWTPayload['permissions']>>) => boolean;
  hasAllPermissions: (permissions: Array<keyof NonNullable<JWTPayload['permissions']>>) => boolean;
  
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

// Create the context
export const JWTAuthContext = createContext<JWTAuthContextType | null>(null);

// Public routes that don't require authentication
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
 * Convert JWT payload to User object
 * FIXED: Handle undefined values properly for profile types
 */
function jwtPayloadToUser(payload: JWTPayload): User {
  // Create complete AdminPermissions object with all required fields
  const permissions: AdminPermissions = {
    // Core admin permissions
    has_admin_access: payload.permissions?.has_admin_access ?? false,
    has_user_management_access: payload.permissions?.has_user_management_access ?? false,
    has_system_settings_access: payload.permissions?.has_system_settings_access ?? false,
    has_audit_access: payload.permissions?.has_audit_access ?? false,
    has_compliance_access: payload.permissions?.has_compliance_access ?? false,
    has_export_access: payload.permissions?.has_export_access ?? false,
    has_dashboard_access: payload.permissions?.has_dashboard_access ?? false,
    has_compliance_reports_access: payload.permissions?.has_compliance_reports_access ?? false,
    has_approval_permissions: payload.permissions?.has_approval_permissions ?? false,
    
    // Healthcare permissions
    has_patient_data_access: payload.permissions?.has_patient_data_access ?? false,
    has_medical_records_access: payload.permissions?.has_medical_records_access ?? false,
    can_manage_appointments: payload.permissions?.can_manage_appointments ?? false,
    can_access_telemedicine: payload.permissions?.can_access_telemedicine ?? false,
    can_manage_medications: payload.permissions?.can_manage_medications ?? false,
    can_view_research_data: payload.permissions?.can_view_research_data ?? false,
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
    username: payload.email.split('@')[0], // Generate username from email if not provided
    email: payload.email,
    first_name: '', // Will be populated from backend when needed
    last_name: '',
    role: payload.role,
    is_active: true,
    is_approved: true,
    is_staff: payload.permissions?.has_admin_access ?? false,
    is_superuser: payload.permissions?.is_superadmin ?? false,
    email_verified: true, // Assume verified if JWT is valid
    two_factor_enabled: false, // Will be updated from backend
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

interface JWTAuthProviderProps {
  children: ReactNode;
}

export function JWTAuthProvider({ children }: JWTAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [jwtPayload, setJwtPayload] = useState<JWTPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tokenNeedsRefresh, setTokenNeedsRefresh] = useState(false);
  const [timeToExpiration, setTimeToExpiration] = useState<number | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || 
    pathname.startsWith('/verify-email/') || 
    pathname.startsWith('/reset-password/');

  /**
   * Initialize authentication state from JWT cookie
   */
  useEffect(() => {
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
              
              console.log('✅ JWT authentication initialized');
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

    initializeAuth();
  }, []);

  /**
   * Set up token expiration monitoring
   */
  useEffect(() => {
    if (!jwtPayload) return;

    const interval = setInterval(() => {
      const timeLeft = JWTValidator.getTimeToExpiration(jwtPayload);
      setTimeToExpiration(timeLeft);
      
      if (timeLeft <= 0) {
        // Token expired, clear auth state
        setUser(null);
        setJwtPayload(null);
        setTokenNeedsRefresh(false);
        setTimeToExpiration(null);
        
        if (!isPublicRoute) {
          router.push('/login');
        }
      } else if (timeLeft < 5 * 60) { // 5 minutes
        setTokenNeedsRefresh(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [jwtPayload, isPublicRoute, router]);

  /**
   * Login method
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
      
      if (loginResponse.token) {
        const validationResult = JWTValidator.validateToken(loginResponse.token);
        
        if (validationResult.isValid && validationResult.payload) {
          const userFromJWT = jwtPayloadToUser(validationResult.payload);
          
          setUser(userFromJWT);
          setJwtPayload(validationResult.payload);
          setTokenNeedsRefresh(validationResult.needsRefresh ?? false);
          setTimeToExpiration(validationResult.expiresIn ?? null);
          
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
   * Logout method
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
   * Registration method
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
   * Token refresh method
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

  /**
   * Permission checking methods
   */
  const hasPermission = useCallback((permission: keyof NonNullable<JWTPayload['permissions']>): boolean => {
    return jwtPayload ? JWTValidator.hasPermission(jwtPayload, permission) : false;
  }, [jwtPayload]);

  const hasAnyPermission = useCallback((permissions: Array<keyof NonNullable<JWTPayload['permissions']>>): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: Array<keyof NonNullable<JWTPayload['permissions']>>): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Computed permission properties for easy access
  const isAdmin = hasPermission('has_admin_access');
  const isSuperAdmin = hasPermission('is_superadmin');
  const canManageUsers = hasPermission('has_user_management_access');
  const canAccessAudit = hasPermission('has_audit_access');
  const canManageSystemSettings = hasPermission('has_system_settings_access');

  // Utility methods
  const getUserId = useCallback((): number | null => {
    return jwtPayload?.user_id ?? null;
  }, [jwtPayload]);

  const getUserRole = useCallback((): UserRole | null => {
    return jwtPayload?.role ?? null;
  }, [jwtPayload]);

  const getSessionId = useCallback((): string | null => {
    return jwtPayload?.session_id ?? null;
  }, [jwtPayload]);

  // Build context value
  const contextValue: JWTAuthContextType = {
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
    
    // Computed permissions
    isAdmin,
    isSuperAdmin,
    canManageUsers,
    canAccessAudit,
    canManageSystemSettings,
    
    // Utility methods
    getUserId,
    getUserRole,
    getSessionId,
  };

  return (
    <JWTAuthContext.Provider value={contextValue}>
      {children}
    </JWTAuthContext.Provider>
  );
}

export default JWTAuthProvider;