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
 * Updated to handle backend JWT structure properly
 */
function jwtPayloadToUser(payload: JWTPayload): User {
  const permissions: AdminPermissions = {
    // Core admin permissions - using backend permission names
    has_admin_access: payload.permissions?.can_access_admin ?? false,
    has_user_management_access: payload.permissions?.can_manage_users ?? false,
    has_system_settings_access: payload.permissions?.can_access_admin ?? false,
    has_audit_access: payload.permissions?.has_audit_access ?? false,
    has_compliance_access: payload.permissions?.has_compliance_access ?? false,
    has_export_access: payload.permissions?.has_export_access ?? false,
    has_dashboard_access: payload.permissions?.can_access_admin ?? false,
    has_compliance_reports_access: payload.permissions?.has_compliance_access ?? false,
    has_approval_permissions: payload.permissions?.can_manage_users ?? false,
    
    // Healthcare permissions - default to false for security
    has_patient_data_access: payload.role === 'provider' || payload.role === 'admin' || payload.role === 'superadmin',
    has_medical_records_access: payload.role === 'provider' || payload.role === 'admin' || payload.role === 'superadmin',
    can_manage_appointments: payload.role === 'provider' || payload.role === 'admin' || payload.role === 'superadmin',
    can_access_telemedicine: payload.role === 'provider' || payload.role === 'admin' || payload.role === 'superadmin',
    can_manage_medications: payload.role === 'provider' || payload.role === 'pharmco' || payload.role === 'admin' || payload.role === 'superadmin',
    can_view_research_data: payload.role === 'researcher' || payload.role === 'admin' || payload.role === 'superadmin',
    can_access_clinical_trials: payload.role === 'researcher' || payload.role === 'provider' || payload.role === 'admin' || payload.role === 'superadmin',
    
    // User permissions - everyone can view/edit their own data
    can_view_own_data: true,
    can_edit_own_profile: true,
    
    // Role info
    user_role: payload.role,
    is_superadmin: payload.role === 'superadmin' || payload.permissions?.is_superadmin === true,
  };

  return {
    id: payload.user_id,
    username: payload.username || payload.email,
    email: payload.email,
    first_name: '', // Will be populated from actual user data
    last_name: '', // Will be populated from actual user data
    role: payload.role,
    is_approved: true, // JWT tokens are only issued for approved users
    is_active: true,
    is_staff: payload.role === 'admin' || payload.role === 'superadmin',
    is_superuser: payload.role === 'superadmin',
    email_verified: true, // Assume verified if JWT issued
    two_factor_enabled: false, // Will be updated from actual user data
    date_joined: new Date().toISOString(), // Placeholder
    phone_verified: false,
    permissions,
    //profiles: {}, // Will be populated with actual profile data
  };
}

/**
 * JWT Authentication Provider
 */
export function JWTAuthProvider({ children }: { children: ReactNode }) {
  // Core state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // JWT-specific state
  const [jwtPayload, setJwtPayload] = useState<JWTPayload | null>(null);
  const [tokenNeedsRefresh, setTokenNeedsRefresh] = useState(false);
  const [timeToExpiration, setTimeToExpiration] = useState<number | null>(null);
  
  // Navigation
  const pathname = usePathname();
  const router = useRouter();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  
  /**
   * Initialize authentication state on app load
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing JWT authentication...');
        
        const response = await fetch('/api/auth/validate', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.token) {
            const validationResult = JWTValidator.validateToken(data.token);
            
            if (validationResult.isValid && validationResult.payload) {
              const userFromJWT = jwtPayloadToUser(validationResult.payload);
              
              setUser(userFromJWT);
              setJwtPayload(validationResult.payload);
              setTokenNeedsRefresh(validationResult.needsRefresh ?? false);
              setTimeToExpiration(validationResult.expiresIn ?? null);
              
              console.log('✅ JWT authentication initialized');
            }
          }
        } else if (response.status === 401) {
          console.log('ℹ️ No JWT token found - user not authenticated');
        } else {
          console.warn(`⚠️ Auth validation returned ${response.status}: ${response.statusText}`);
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
        throw new Error(errorData.error || 'Login failed');
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
   * Register method
   */
  const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const registerResponse = await response.json();
      return registerResponse;
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout method - FIXED
   */
  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Starting logout process...');
      
      // Call both frontend and backend logout endpoints
      const frontendLogout = fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Call backend logout through our API proxy if session ID is available
      const backendLogout = jwtPayload?.session_id 
        ? fetch('/api/auth/logout-backend', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: jwtPayload.session_id }),
          })
        : Promise.resolve();

      // Wait for both calls to complete (don't throw on errors)
      await Promise.allSettled([frontendLogout, backendLogout]);
      
      console.log('✅ Logout API calls completed');
      
    } catch (error) {
      console.error('❌ Logout API error:', error);
      // Don't throw - logout should always succeed on client side
    } finally {
      // Always clear local state regardless of API success
      setUser(null);
      setJwtPayload(null);
      setTokenNeedsRefresh(false);
      setTimeToExpiration(null);
      
      console.log('✅ Local logout state cleared');
      
      // Redirect to login
      router.push('/login');
    }
  };

  /**
   * Refresh token method
   */
  const refreshToken = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.token) {
          const validationResult = JWTValidator.validateToken(data.token);
          
          if (validationResult.isValid && validationResult.payload) {
            const userFromJWT = jwtPayloadToUser(validationResult.payload);
            
            setUser(userFromJWT);
            setJwtPayload(validationResult.payload);
            setTokenNeedsRefresh(false);
            setTimeToExpiration(validationResult.expiresIn ?? null);
          }
        }
      } else {
        // Refresh failed, clear auth state
        await logout();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
    }
  };

  // Permission checking methods
  const hasPermission = useCallback((permission: string): boolean => {
    return jwtPayload ? JWTValidator.hasPermission(jwtPayload, permission) : false;
  }, [jwtPayload]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Role-based access methods
  const isAdmin = jwtPayload?.role === 'admin' || jwtPayload?.role === 'superadmin';
  const isSuperAdmin = jwtPayload?.role === 'superadmin';
  const canManageUsers = hasPermission('can_manage_users');
  const canAccessAudit = hasPermission('has_audit_access');
  const canManageSystemSettings = hasPermission('can_access_admin');

  // Utility methods
  const getUserId = useCallback((): number | null => jwtPayload?.user_id ?? null, [jwtPayload]);
  const getUserRole = useCallback((): UserRole | null => jwtPayload?.role ?? null, [jwtPayload]);
  const getSessionId = useCallback((): string | null => jwtPayload?.session_id ?? null, [jwtPayload]);

  // Context value
  const contextValue: JWTAuthContextType = {
    // Core state
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    
    // JWT state
    jwtPayload,
    tokenNeedsRefresh,
    timeToExpiration,
    
    // Methods
    login,
    register,
    logout,
    refreshToken,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Role methods
    isAdmin,
    isSuperAdmin,
    canManageUsers,
    canAccessAudit,
    canManageSystemSettings,
    
    // Utilities
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