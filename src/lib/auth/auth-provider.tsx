// src/lib/auth/auth-provider.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { JWTPayload } from './validator';
import { TabAuthManager } from './tab-auth-utils';
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
import authService from '../api/services/auth.service';

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
  
  // Tab-specific state
  tabId: string;
  isTabAuthenticated: boolean;
  
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  logoutAllTabs: () => Promise<void>;
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

/**
 * JWT Authentication Provider with Tab Isolation
 */
export function JWTAuthProvider({ children }: { children: ReactNode }) {
  // ✅ 1. FIRST: All state declarations
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [jwtPayload, setJwtPayload] = useState<JWTPayload | null>(null);
  const [tokenNeedsRefresh, setTokenNeedsRefresh] = useState(false);
  const [timeToExpiration, setTimeToExpiration] = useState<number | null>(null);
  const [tabId] = useState(TabAuthManager.getTabId());
  const [isTabAuthenticated, setIsTabAuthenticated] = useState(false);

  const router = useRouter();
  const sessionRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  // ✅ 2. SECOND: Define logout first (no dependencies)
  const logout = useCallback(async () => {
    try {
      
      // Clear all authentication state
      setUser(null);
      setJwtPayload(null);
      setIsTabAuthenticated(false);
      setTokenNeedsRefresh(false);
      setTimeToExpiration(null);
      
      // Clear stored tokens
      TabAuthManager.clearTabSession();
      localStorage.removeItem('session_token');
      
      // Clear any running intervals
      if (sessionRefreshInterval.current) {
        clearInterval(sessionRefreshInterval.current);
        sessionRefreshInterval.current = null;
      }
      
      // Call logout endpoint if session token exists
      try {
        await authService.logout();
      } catch (error) {
        console.error('❌ Logout API error:', error);
      }
      
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }, [router]);

  // ✅ 3. THIRD: Define checkSessionHealth (depends on logout)
  const checkSessionHealth = useCallback(async () => {
    const sessionToken = localStorage.getItem('session_token');
    
    if (!sessionToken) {
      logout();
      return;
    }
  
    try {
      const response = await fetch(`${config.apiBaseUrl}/users/auth/me/`, {
        headers: {
          'Authorization': `Session ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const userData = await response.json();
        
        // ✅ EXTRACT USER WITH FALLBACKS
        const userObject = userData.user;
        
        if (!userObject) {
          console.error('❌ No user object in response!');
          logout();
          return;
        }
        
        if (!userObject.role) {
          console.error('❌ User object missing role property!');
          logout();
          return;
        }
        
        // ✅ ADD PERMISSIONS TO USER OBJECT IF MISSING
        if (userData.permissions && !userObject.permissions) {
          userObject.permissions = userData.permissions;
        }
        
        setUser(userObject);
        setIsTabAuthenticated(true);
      } else if (response.status === 401) {
        const refreshResult = await refreshSessionToken();
        if (!refreshResult) {
          logout();
        }
      } else {
        console.error('❌ Session check failed:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        logout();
      }
    } catch (error) {
      console.error('❌ Session check error:', error);
      logout();
    }
  }, [logout]);

  // ✅ 4. FOURTH: Define refreshSessionToken (depends on logout and checkSessionHealth)
  const refreshSessionToken = useCallback(async () => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        throw new Error('No session token to refresh');
      }

      const response = await fetch(`${config.apiBaseUrl}/users/auth/refresh-session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Session ${sessionToken}`,
        },
        body: JSON.stringify({ session_token: sessionToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('session_token', data.session_token);
        
        // Update user data after refresh
        await checkSessionHealth();
        return true;
      } else {
        console.error('❌ Session refresh failed:', response.status);
        logout();
        return false;
      }
    } catch (error) {
      console.error('❌ Session refresh error:', error);
      logout();
      return false;
    }
  }, [logout, checkSessionHealth]);

  // ✅ 5. FIFTH: Define setupSessionRefresh (depends on checkSessionHealth and refreshSessionToken)
  const setupSessionRefresh = useCallback(() => {
    
    if (sessionRefreshInterval.current) {
      clearInterval(sessionRefreshInterval.current);
    }
    
    const healthCheckInterval = setInterval(() => {
      checkSessionHealth();
    }, 10 * 60 * 1000);
    
    const refreshInterval = setInterval(() => {
      refreshSessionToken();
    }, 50 * 60 * 1000);
    
    sessionRefreshInterval.current = refreshInterval;
    
    return () => {
      clearInterval(healthCheckInterval);
      clearInterval(refreshInterval);
    };
  }, [checkSessionHealth, refreshSessionToken]);

  // ✅ 6. SIXTH: Define login (depends on setupSessionRefresh)
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.token && response.session_token) {
        // ✅ Store ONLY session token, discard JWT immediately
        localStorage.setItem('session_token', response.session_token);
        
        // ✅ Remove any stored JWT tokens
        TabAuthManager.clearTabSession();
        
        // ✅ Ensure user has role property
        const userWithRole = {
          ...response.user,
          role: response.user.role || 'patient', // ✅ Fallback to patient if missing
        };
        
        // ✅ Set user state with confirmed role
        setUser(userWithRole);
        setIsTabAuthenticated(true);
        setTokenNeedsRefresh(false);
        
        // ✅ Start session monitoring (not JWT monitoring)
        setupSessionRefresh();
        
        return response;
      } else {
        throw new Error('Login failed: Missing authentication tokens');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setupSessionRefresh]);

  // ✅ 7. SEVENTH: Define other auth methods
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
        throw new Error(errorData.detail || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAllTabs = async () => {
    await logout();
  };

  const refreshToken = async () => {
    await refreshSessionToken();
  };

  // ✅ 8. EIGHTH: Permission methods
// ✅ NEW: Get permissions from user object
const hasPermission = useCallback((permission: string): boolean => {
  if (!user?.permissions) return false;
  
  // Map common permission names to user.permissions structure
  const permissionMap: Record<string, keyof AdminPermissions> = {
    'has_admin_access': 'has_admin_access',
    'can_manage_users': 'has_user_management_access',
    'has_audit_access': 'has_audit_access',
    'has_compliance_access': 'has_compliance_access',
    'has_dashboard_access': 'has_dashboard_access',
    'can_access_admin': 'has_admin_access',
    'can_access_patient_data': 'has_patient_data_access',
    'can_view_research_data': 'can_view_research_data',
    'can_view_own_data': 'can_view_own_data',
    'can_edit_own_profile': 'can_edit_own_profile',
  };
  
  const mappedPermission = permissionMap[permission];
  if (mappedPermission && user.permissions[mappedPermission] !== undefined) {
    return Boolean(user.permissions[mappedPermission]);
  }
  
  // Fallback: check if the permission exists directly
  return Boolean((user.permissions as any)[permission]);
}, [user]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Role-based access methods
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';
  const canManageUsers = hasPermission('can_manage_users');
  const canAccessAudit = hasPermission('has_audit_access');
  const canManageSystemSettings = hasPermission('can_access_admin');

  // Utility methods
  const getUserId = useCallback((): number | null => user?.id ?? null, [user]);
  const getUserRole = useCallback((): UserRole | null => user?.role ?? null, [user]);
  const getSessionId = useCallback((): string | null => {
  
    const sessionToken = localStorage.getItem('session_token');
    return sessionToken ? 'session-based' : null;
  }, []);

  // ✅ 9. NINTH: Now all useEffect hooks AFTER all functions are defined
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const sessionToken = localStorage.getItem('session_token');
        
        if (sessionToken) {
          await checkSessionHealth();
        } else {
          setIsTabAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Error initializing tab authentication:', error);
        TabAuthManager.clearTabSession();
        localStorage.removeItem('session_token');
        setIsTabAuthenticated(false);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [tabId, checkSessionHealth]);

  useEffect(() => {
    if (isTabAuthenticated) {
      const cleanup = setupSessionRefresh();
      return cleanup;
    }
  }, [isTabAuthenticated, setupSessionRefresh]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (sessionRefreshInterval.current) {
        clearInterval(sessionRefreshInterval.current);
      }
    };
  }, []);

  // Debug effect
  useEffect(() => {
  }, [user, isTabAuthenticated]);

  // ✅ 10. TENTH: Context value and provider
  const contextValue: JWTAuthContextType = {
    user,
    isAuthenticated: isTabAuthenticated && !!user,
    isLoading,
    isInitialized,
    jwtPayload,
    tokenNeedsRefresh,
    timeToExpiration,
    tabId,
    isTabAuthenticated,
    login,
    register,
    logout,
    logoutAllTabs,
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
  };

  return (
    <JWTAuthContext.Provider value={contextValue}>
      {children}
    </JWTAuthContext.Provider>
  );
}