// src/lib/auth/auth-provider.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { JWTValidator, JWTPayload } from './validator';
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
import apiClient from '../api/client';
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
    first_name: '', 
    last_name: '',
    role: payload.role,
    is_approved: true,
    is_active: true,
    is_staff: payload.role === 'admin' || payload.role === 'superadmin',
    is_superuser: payload.role === 'superadmin',
    email_verified: true,
    two_factor_enabled: false,
    date_joined: new Date().toISOString(),
    phone_verified: false,
    permissions,
  };
}

/**
 * JWT Authentication Provider with Tab Isolation
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
  
  // Tab-specific state
  const [tabId] = useState(TabAuthManager.getTabId());
  const [isTabAuthenticated, setIsTabAuthenticated] = useState(false);

  const router = useRouter();

  const sessionRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  // Initialize authentication state from tab-specific storage
  useEffect(() => {
    const initializeAuth = async () => {
      console.log(`🔐 Initializing tab authentication for tab: ${tabId}`);
      
      try {
        // STEP 1: Check if current tab has valid JWT authentication
        const tabSession = TabAuthManager.getTabSession();
        
        if (tabSession && tabSession.jwtToken) {
          console.log(`✅ Found tab session for user: ${tabSession.userEmail}`);
          
          // Validate the JWT token
          const validationResult = JWTValidator.validateToken(tabSession.jwtToken);
          
          if (validationResult.isValid && validationResult.payload) {
            const userFromJWT = jwtPayloadToUser(validationResult.payload);
            
            setUser(userFromJWT);
            setJwtPayload(validationResult.payload);
            setIsTabAuthenticated(true);
            setTokenNeedsRefresh(validationResult.needsRefresh ?? false);
            setTimeToExpiration(validationResult.expiresIn ?? null);
            
            console.log(`✅ Tab authentication successful for: ${userFromJWT.email}`);
            return; // Exit early - JWT auth successful
          } else {
            console.log('❌ Invalid JWT token in tab session, checking session token fallback...');
            TabAuthManager.clearTabSession();
          }
        }
        
        // STEP 2: JWT failed/expired - Check for session token fallback
        const sessionToken = localStorage.getItem('session_token');
        
        if (sessionToken) {
          console.log('🔄 JWT expired, attempting session token authentication...');
          
          try {
            // Validate session token with backend
            const response = await apiClient.get('/users/auth/me/', {
              headers: {
                'Authorization': `Session ${sessionToken}`,
              },
              skipAuth: true,
            });

            if (response.status === 200) {
              const userData = response.data;
              console.log('✅ Session token authentication successful');
              
              // ADD DEBUG TO SEE RESPONSE STRUCTURE
              console.log('🔍 INIT AUTH - FULL USER DATA:', userData);
              
              // Set up authentication state using session token
              setUser((userData as { user: User }).user);
              setIsTabAuthenticated(true);
              setTokenNeedsRefresh(false);
              setTimeToExpiration(null); // Session tokens don't have JWT expiration
              // Set up session refresh
              setupSessionRefresh();
              
              return; // Exit early - session auth successful
            } else {
              console.log('❌ Session token validation failed');
              localStorage.removeItem('session_token');
            }
          } catch (error) {
            console.error('❌ Session token validation error:', error);
            localStorage.removeItem('session_token');
          }
        }
        
        // STEP 3: Both JWT and session token failed
        console.log('ℹ️ No valid authentication found - tab requires login');
        setIsTabAuthenticated(false);
        
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
  }, [tabId]);

  // Update activity timestamp on user interaction
  useEffect(() => {
    if (isTabAuthenticated) {
      console.log('✅ User authenticated, setting up session monitoring');
      const cleanup = setupSessionRefresh();
      return cleanup;
    }
  }, [isTabAuthenticated, setupSessionRefresh]);

  // Auto-refresh token logic
  useEffect(() => {
    if (!isTabAuthenticated) return;

    // For JWT tokens, set up refresh logic
    if (jwtPayload) {
    const checkSessionHealth = useCallback(async () => {
      const sessionToken = localStorage.getItem('session_token');
      
      if (!sessionToken) {
        console.log('❌ No session token, redirecting to login');
        logout();
        return;
      }

      try {
        // ✅ Call the correct backend endpoint
        const backendUrl = `${config.apiBaseUrl}/users/auth/me/`;
        const response = await fetch(backendUrl, {
          headers: {
            'Authorization': `Session ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('✅ Session token valid, user data updated');
          
          // Update user state with fresh data
          setUser(userData.user || userData);
          setIsTabAuthenticated(true);
        } else if (response.status === 401) {
          console.log('🔄 Session expired, attempting refresh...');
          await checkSessionHealth();
        } else {
          console.error('❌ Session check failed:', response.status);
          logout();
        }
      } catch (error) {
        console.error('❌ Session check error:', error);
        logout();
      }
    }, [logout]);

      checkSessionHealth();
      const interval = setInterval(checkSessionHealth, 30000);
      
      return () => {
        clearInterval(interval);
      };
    }
    
    // For session token only authentication, just keep session refresh running
    else {
      setupSessionRefresh();
    }
  }, [jwtPayload, isTabAuthenticated, tokenNeedsRefresh]);

  // Add this function in your auth provider component
  const testSessionTokenAuth = useCallback(async (sessionToken: string) => {
    console.log('🧪 TESTING SESSION TOKEN AUTH...');
    
    try {
      // Test 1: Direct API call with session token
      console.log('🧪 Test 1: Direct /me call with session token');
      const backendUrl = `${config.apiBaseUrl}/users/auth/me/`;
      const response = await fetch(backendUrl, {
        headers: {
          'Authorization': `Session ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🧪 Session token /me response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Session token auth SUCCESSFUL');
        console.log('✅ Got user data from session token:', userData.user?.email);

        // ADD THIS DEBUG TO SEE THE ACTUAL STRUCTURE
        console.log('🔍 FULL USER DATA STRUCTURE:', userData);
        console.log('🔍 USER OBJECT:', userData.user);
        console.log('🔍 USER KEYS:', Object.keys(userData.user || {}));
        
        // Update user state with session token data
        setUser(userData.user);
        console.log('✅ Updated user state from session token');
      } else {
        const errorText = await response.text();
        console.log('❌ Session token auth FAILED');
        console.log('❌ Error response:', errorText);
      }
      
      // Test 2: API call through your client
      console.log('🧪 Test 2: API call through apiClient');
      
      // Temporarily store session token for the client to use
      const oldAuthHeader = localStorage.getItem('temp_test_auth');
      localStorage.setItem('temp_test_auth', `Session ${sessionToken}`);
      
      try {
        const clientResponse = await fetch('/api/users/patient/dashboard/', {
          headers: {
            'Authorization': `Session ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('🧪 Dashboard API response status:', clientResponse.status);
        
        if (clientResponse.ok) {
          console.log('✅ Dashboard API call with session token SUCCESSFUL');
        } else {
          const errorText = await clientResponse.text();
          console.log('❌ Dashboard API call FAILED:', errorText);
        }
      } finally {
        if (oldAuthHeader) {
          localStorage.setItem('temp_test_auth', oldAuthHeader);
        } else {
          localStorage.removeItem('temp_test_auth');
        }
      }
      
    } catch (error) {
      console.log('❌ Session token test ERROR:', error);
    }
  }, []);

  /**
   * Enhanced login with tab-specific storage
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.token && response.session_token) {
        console.log('✅ Login successful, switching to session token immediately');
        
        // ✅ Store ONLY session token, discard JWT immediately
        localStorage.setItem('session_token', response.session_token);
        
        // ✅ Remove any stored JWT tokens
        TabAuthManager.clearTabSession();
        
        // ✅ Set user state from session token
        setUser(response.user);
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
  }, []);


  /**
   * Register method (unchanged)
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
        throw new Error(errorData.error || 'Registration failed');
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
   * Logout current tab only
   */
  const logout = async (): Promise<void> => {
    try {
      console.log(`🚪 Starting tab logout for tab: ${tabId}`);
      
      const tabSession = TabAuthManager.getTabSession();
      
      // Notify backend about logout if we have a session
      if (tabSession?.jwtToken) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tabSession.jwtToken}`,
            },
            body: JSON.stringify({ tabId }),
          });
        } catch (error) {
          console.warn('⚠️ Backend logout notification failed:', error);
        }
      }
      
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Always clear local state
      TabAuthManager.clearTabSession();
      localStorage.removeItem('session_token');
      if (sessionRefreshInterval.current) {
        clearInterval(sessionRefreshInterval.current);
        sessionRefreshInterval.current = null;
      }
      setUser(null);
      setJwtPayload(null);
      setIsTabAuthenticated(false);
      setTokenNeedsRefresh(false);
      setTimeToExpiration(null);
      
      console.log(`✅ Tab logout completed for tab: ${tabId}`);
      
      // Redirect to login
      router.push('/login');
    }
  };

  /**
   * Logout all tabs
   */
  const logoutAllTabs = async (): Promise<void> => {
    try {
      console.log('🚪 Starting global logout for all tabs...');
      
      const tabSession = TabAuthManager.getTabSession();
      
      // Notify backend about global logout
      if (tabSession?.jwtToken) {
        try {
          await fetch('/api/auth/logout-all', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tabSession.jwtToken}`,
            },
          });
        } catch (error) {
          console.warn('⚠️ Backend global logout failed:', error);
        }
      }
      
    } catch (error) {
      console.error('❌ Global logout error:', error);
    } finally {
      // Clear all tab sessions
      TabAuthManager.clearAllTabSessions();
      
      // Clear current tab state
      setUser(null);
      setJwtPayload(null);
      setIsTabAuthenticated(false);
      setTokenNeedsRefresh(false);
      setTimeToExpiration(null);
      
      console.log('✅ Global logout completed');
      
      // Redirect to login
      router.push('/login');
    }
  };

  /**
   * Refresh token method
   */
  const refreshToken = async (): Promise<void> => {
    try {
      const tabSession = TabAuthManager.getTabSession();
      if (!tabSession?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tabSession.jwtToken && { 'Authorization': `Bearer ${tabSession.jwtToken}` }),
          ...(tabId && { 'X-Tab-ID': tabId }),
        },
        body: JSON.stringify({ 
          refresh_token: tabSession.refreshToken,
          tabId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.token) {
          // Update tab session with new token
          TabAuthManager.setTabSession({
            jwtToken: data.token,
            refreshToken: data.refresh_token || tabSession.refreshToken,
            userEmail: tabSession.userEmail,
            userId: tabSession.userId,
            role: tabSession.role,
          });
          
          const validationResult = JWTValidator.validateToken(data.token);
          
          if (validationResult.isValid && validationResult.payload) {
            const userFromJWT = jwtPayloadToUser(validationResult.payload);
            
            setUser(userFromJWT);
            setJwtPayload(validationResult.payload);
            setTokenNeedsRefresh(false);
            setTimeToExpiration(validationResult.expiresIn ?? null);
            
            console.log('✅ Token refresh successful for tab:', tabId);
          }
        }
      } else {
        // Refresh failed, logout this tab
        console.error('❌ Token refresh failed:', await response.text());
        await logout();
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      await logout();
    }
  };

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
        console.log('✅ Session token refreshed successfully');
        
        // ✅ Store new session token
        localStorage.setItem('session_token', data.session_token);
        
        // ✅ Update user data
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
  
  /**
   * Set up automatic session token refresh
   */
  const setupSessionRefresh = useCallback(() => {
    console.log('🔄 Setting up session monitoring...');
    
    // ✅ Clear any existing intervals
    if (sessionRefreshInterval.current) {
      clearInterval(sessionRefreshInterval.current);
    }
    
    // ✅ Check session health every 10 minutes
    const healthCheckInterval = setInterval(() => {
      console.log('🔍 Performing session health check...');
      checkSessionHealth();
    }, 10 * 60 * 1000); // 10 minutes
    
    // ✅ Auto-refresh session token every 50 minutes
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing session token...');
      refreshSessionToken();
    }, 50 * 60 * 1000); // 50 minutes
    
    // ✅ Store interval references for cleanup
    sessionRefreshInterval.current = refreshInterval;
    
    return () => {
      clearInterval(healthCheckInterval);
      clearInterval(refreshInterval);
    };
  }, [checkSessionHealth, refreshSessionToken]);

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
    isAuthenticated: isTabAuthenticated && !!user,
    isLoading,
    isInitialized,
    
    // JWT state
    jwtPayload,
    tokenNeedsRefresh,
    timeToExpiration,
    
    // Tab state
    tabId,
    isTabAuthenticated,
    
    // Methods
    login,
    register,
    logout,
    logoutAllTabs,
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
  
  useEffect(() => {
    return () => {
      if (sessionRefreshInterval.current) {
        clearInterval(sessionRefreshInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log('🔍 USER STATE CHANGE DEBUG:', {
      hasUser: !!user,
      userEmail: user?.email,
      userRole: user?.role,
      userPermissions: user?.permissions ? Object.keys(user.permissions) : 'none',
      isTabAuthenticated,
      hasJwtPayload: !!jwtPayload,
      hasSessionToken: !!localStorage.getItem('session_token')
    });
  }, [user, isTabAuthenticated, jwtPayload]);

  return (
    <JWTAuthContext.Provider value={contextValue}>
      {children}
    </JWTAuthContext.Provider>
  );
}