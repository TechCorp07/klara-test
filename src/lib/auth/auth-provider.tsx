// src/lib/auth/auth-provider.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { JWTValidator, JWTPayload } from './validator';
import { TabAuthManager } from './tab-auth-utils';
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
            const response = await fetch('/api/users/auth/me/', {
              headers: {
                'Authorization': `Session ${sessionToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const userData = await response.json();
              console.log('✅ Session token authentication successful');
              
              // Set up authentication state using session token
              setUser(userData.user);
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
    const updateActivity = () => {
      if (isTabAuthenticated) {
        TabAuthManager.updateActivity();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [isTabAuthenticated]);

  // Auto-refresh token logic
  useEffect(() => {
    if (!isTabAuthenticated) return;

    // For JWT tokens, set up refresh logic
    if (jwtPayload) {
      const checkTokenExpiration = () => {
        const now = Math.floor(Date.now() / 1000);
        const timeToExp = jwtPayload.exp - now;
        
        setTimeToExpiration(timeToExp);

        console.log('🔍 JWT EXPIRATION CHECK:', {
          timeToExp,
          willExpireIn5Min: timeToExp < 5 * 60,
          needsRefresh: !tokenNeedsRefresh
        });
        
        // If JWT token expires in 5 minutes, switch to session token instead of refreshing JWT
        if (timeToExp < 5 * 60 && timeToExp > 0 && !tokenNeedsRefresh) {
          console.log('🔄 JWT expires in', timeToExp, 'seconds, switching to session token...');
          
          // Check if we have a session token
          const sessionToken = localStorage.getItem('session_token');
          console.log('🔍 SESSION TOKEN CHECK:', {
            hasSessionToken: !!sessionToken,
            sessionTokenPreview: sessionToken?.substring(0, 20) + '...' || 'NONE',
            sessionTokenLength: sessionToken?.length || 0
          });

          if (sessionToken) {
            console.log('✅ Switching from JWT to session token authentication');

            // TEST THE SESSION TOKEN IMMEDIATELY
            testSessionTokenAuth(sessionToken);

            // Clear JWT state but keep session authenticated
            setJwtPayload(null);
            setTokenNeedsRefresh(false);
            setTimeToExpiration(null);
            
            TabAuthManager.clearTabSession();
            console.log('🧹 Cleared expired JWT from TabAuthManager');
            
            // Set up session refresh
            setupSessionRefresh();
            return;
          } else {
            console.log('❌ No session token available, will need to re-login');
            setTokenNeedsRefresh(true);
          }
        }
        
        // Auto-logout if token is expired and no session token
        if (timeToExp <= 0) {
          const sessionToken = localStorage.getItem('session_token');
          if (!sessionToken) {
            console.log('🕐 JWT token expired and no session token, logging out...');
            logout();
          }
        }
      };

      checkTokenExpiration();
      const interval = setInterval(checkTokenExpiration, 30000);
      
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
      const response = await fetch('/api/users/auth/me/', {
        headers: {
          'Authorization': `Session ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🧪 Session token /me response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Session token auth SUCCESSFUL');
        console.log('✅ User email from session:', userData.user?.email);
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
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setIsLoading(true);
    
    try {
      console.log(`🔑 Starting tab-specific login for tab: ${tabId}`);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Type': 'tab-specific',
          'X-Tab-ID': tabId,
        },
        body: JSON.stringify({
          ...credentials,
          tabId,
        }),
      });
  
      // Parse response data first, regardless of status
      const responseData = await response.json();
      console.log('🔍 DEBUG - Full responseData:', responseData); // DEBUG

      console.log('🔍 SESSION TOKEN STORAGE DEBUG:');
      console.log('responseData.session_token:', responseData.session_token);
      console.log('responseData.session_token length:', responseData.session_token?.length);

      // Check if session token gets stored
      if (responseData.session_token) {
        localStorage.setItem('session_token', responseData.session_token);
        console.log('✅ STORED session_token in localStorage');
        
        // Immediately verify storage
        const storedToken = localStorage.getItem('session_token');
        console.log('✅ VERIFIED stored token:', storedToken?.substring(0, 20) + '...');
        console.log('✅ Storage successful:', storedToken === responseData.session_token);
      } else {
        console.log('❌ No session_token in responseData to store');
      }

      if (!response.ok) {
        // CHECK FOR APPROVAL PENDING FIRST
        if (responseData.requires_approval || responseData.error_type === 'APPROVAL_PENDING') {
          console.log('🔍 DEBUG - Approval pending detected, redirecting...'); // DEBUG
          const role = responseData.role || 'user';
          const submittedAt = responseData.submitted_at || new Date().toISOString();
          const approvalUrl = `/approval-pending?role=${role}&submitted=${encodeURIComponent(submittedAt)}`;
          
          console.log('🔍 DEBUG - Redirecting to:', approvalUrl); // DEBUG
          
          // Use window.location for immediate redirect
          if (typeof window !== 'undefined') {
            window.location.href = approvalUrl;
            return Promise.resolve({} as LoginResponse); // Return empty response since we're redirecting
          }
        }
        
        // Handle other errors
        throw new Error(responseData.error || 'Login failed');
      }
  
      // Success path - existing code
      const loginResponse: LoginResponse = responseData;
      
      if (loginResponse.token) {
        TabAuthManager.setTabSession({
          jwtToken: loginResponse.token,
          refreshToken: loginResponse.refresh_token,
          userEmail: loginResponse.user.email,
          userId: loginResponse.user.id,
          role: loginResponse.user.role,
        });
        
        const validationResult = JWTValidator.validateToken(loginResponse.token);
        
        if (validationResult.isValid && validationResult.payload) {
          const userFromJWT = jwtPayloadToUser(validationResult.payload);
          
          setUser(userFromJWT);
          setJwtPayload(validationResult.payload);
          setIsTabAuthenticated(true);
          setTokenNeedsRefresh(validationResult.needsRefresh ?? false);
          setTimeToExpiration(validationResult.expiresIn ?? null);
          
          setupSessionRefresh();

          console.log(`✅ Tab login successful for: ${userFromJWT.email} on tab: ${tabId}`);
        }
      }
  
      return loginResponse;
  
    } catch (error) {
      console.error('❌ Tab login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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

  /**
   * Set up automatic session token refresh
   */
  const setupSessionRefresh = useCallback(() => {
    // Clear any existing interval
    console.log('🔄 SETTING UP SESSION REFRESH...');
    if (sessionRefreshInterval.current) {
      clearInterval(sessionRefreshInterval.current);
      console.log('🔄 Cleared existing session refresh interval');
    }
    
    // Only set up refresh if we have a session token
    const sessionToken = localStorage.getItem('session_token');
    console.log('🔍 SESSION REFRESH SETUP CHECK:', {
      hasSessionToken: !!sessionToken,
      sessionTokenPreview: sessionToken?.substring(0, 20) + '...' || 'NONE'
    });

    if (!sessionToken) {
      console.log('⚠️ No session token found, skipping session refresh setup');
      return;
    }
    
    console.log('🔄 Setting up session token auto-refresh (50min interval)');
    
    // Set up automatic refresh every 50 minutes
    sessionRefreshInterval.current = setInterval(async () => {
      console.log('⏰ SESSION REFRESH INTERVAL TRIGGERED');

      try {
        const currentSessionToken = localStorage.getItem('session_token');

        console.log('🔍 REFRESH ATTEMPT:', {
          hasCurrentToken: !!currentSessionToken,
          tokenPreview: currentSessionToken?.substring(0, 20) + '...' || 'NONE'
        });

        if (currentSessionToken) {
          console.log('🔄 Attempting to refresh session token...');
          
          const response = await fetch('/api/users/auth/refresh-session/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_token: currentSessionToken })
          });
          
          console.log('🔍 Refresh response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('session_token', data.session_token);
            console.log('✅ Session token refreshed successfully');
            console.log('✅ New token preview:', data.session_token?.substring(0, 20) + '...');
          } else {
            const errorText = await response.text();
            console.error('❌ Session refresh failed, status:', response.status);
            console.error('❌ Error response:', errorText);
            localStorage.removeItem('session_token');
            await logout();
          }
        }
      } catch (error) {
        console.error('❌ Session refresh error:', error);
        localStorage.removeItem('session_token');
        await logout();
      }
    }, 50 * 60 * 1000); // 50 minutes
    
    console.log('✅ Session refresh interval setup complete');
  }, []);

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

  return (
    <JWTAuthContext.Provider value={contextValue}>
      {children}
    </JWTAuthContext.Provider>
  );
}