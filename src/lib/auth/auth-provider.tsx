// src/lib/auth/auth-provider.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { JWTPayload } from './validator';
import { TabAuthManager } from './tab-auth-utils';
import { config } from '@/lib/config';
import { jwtDecode } from 'jwt-decode';
import {
  User,
  UserRole,
  LoginCredentials,
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  AdminPermissions,
  EmergencyAccessSummary,
  SetupTwoFactorResponse,
  EmergencyAccessRecord,
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
  resetPassword: (data: { token: string; password: string; confirm_password: string }) => Promise<{ detail?: string; success?: boolean; message?: string }>;
  setupTwoFactor: () => Promise<SetupTwoFactorResponse>;
  confirmTwoFactor: (code: string) => Promise<{ success: boolean; message: string; backup_codes?: string[] }>;
  disableTwoFactor: (code: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (data: { token: string; email?: string }) => Promise<{ success: boolean; message: string; detail?: string }>;
  requestEmailVerification: () => Promise<{ detail?: string; success?: boolean; message?: string }>;
  request2FAEmailBackup: (userId: number) => Promise<{ success: boolean; message: string }>;
  verify2FAEmailBackup: (userId: number, backupCode: string) => Promise<string | { success: boolean; message: string }>;
  verifyTwoFactor: (userId: number, code: string) => Promise<{token: string; refresh_token: string; user: User; expires_in: number;}>;

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
  getEmergencyAccessSummary: () => Promise<EmergencyAccessSummary>;
  initiateEmergencyAccess: (data: { patient_identifier: string; reason: string; detailed_reason?: string }) => Promise<{ success: boolean; message: string; access_id?: number; expires_in?: number }>;
  endEmergencyAccess: (accessId: number, reason?: string) => Promise<{ success: boolean; message: string }>;
  reviewEmergencyAccess: (accessId: number, data: { justified: boolean; notes?: string }) => Promise<{ success: boolean; message: string }>;
  getEmergencyAccessRecords: (filters?: { reviewed?: boolean; status?: string }) => Promise<EmergencyAccessRecord[]>;
  updateConsent: (consentType: string, consentValue: boolean) => Promise<{ success: boolean; message: string }>;
  updateUserProfileImage: (imageUrl: string | null) => void;
}

// Create the context
export const JWTAuthContext = createContext<JWTAuthContextType | null>(null);

/**
 * JWT Authentication Provider with Tab Isolation
 */
export function JWTAuthProvider({ children }: { children: ReactNode }) {
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
  const refreshSessionTokenRef = useRef<(() => Promise<{ success: boolean; userData?: unknown }>) | null>(null);
  const checkSessionHealthRef = useRef<(() => Promise<void>) | null>(null);

    const isTokenExpired = (token: string): boolean => {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp ? decoded.exp < currentTime : true;
      } catch {
        return true;
      }
    };
  
    const getTokenExpirationTime = (token: string): number | null => {
      try {
        const decoded = jwtDecode(token);
        return decoded.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
      } catch {
        return null;
      }
    };

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
  
  const refreshSessionToken = useCallback(async (): Promise<{ success: boolean; userData?: User | null; error?: unknown }> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      const authToken = localStorage.getItem('auth_token');
      
      if (!sessionToken && !authToken) {
        throw new Error('No tokens available for refresh');
      }

      // Check if JWT token needs refresh (5 minutes before expiry)
      if (authToken) {
        const expirationTime = getTokenExpirationTime(authToken);
        if (expirationTime) {
          const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
          if (expirationTime > fiveMinutesFromNow) {
            // Token doesn't need refresh yet
            return { success: true, userData: user };
          }
        }
      }

      // Attempt refresh with session token first, then refresh token
      const refreshData: Record<string, string> = {};
      if (sessionToken) {
        refreshData.session_token = sessionToken;
      }
      if (authToken && isTokenExpired(authToken)) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          refreshData.refresh_token = refreshToken;
        }
      }

      const response = await fetch(`${config.apiBaseUrl}/users/auth/refresh-session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken && { 'Authorization': `Session ${sessionToken}` }),
        },
        body: JSON.stringify(refreshData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update tokens if provided
        if (data.access_token) {
          localStorage.setItem('auth_token', data.access_token);
        }
        if (data.session_token) {
          localStorage.setItem('session_token', data.session_token);
        }
        
        // Type-safe user data handling
        let updatedUser: User | null = null;
        if (data.user && typeof data.user === 'object') {
          updatedUser = {
            ...data.user,
            role: data.user.role || 'patient', // Ensure role exists
          } as User;
          setUser(updatedUser);
        } else if (user) {
          // Keep existing user data if no new user data provided
          updatedUser = user;
        }
        
        return { success: true, userData: updatedUser };
      } else {
        const errorData = await response.json();
        console.error('❌ Session refresh failed:', response.status, errorData);
        
        // Only logout on authentication errors, not server errors
        if (response.status === 401 || response.status === 403) {
          logout();
        }
        return { success: false, error: errorData };
      }
    } catch (error) {
      console.error('❌ Session refresh error:', error);
      return { success: false, error };
    }
  }, [logout, user]);

  const updateUserProfileImage = useCallback((imageUrl: string | null) => {
    setUser(prevUser =>
      prevUser
        ? { ...prevUser, profile_image: imageUrl === null ? undefined : imageUrl }
        : null
    );
  }, []);

  const checkSessionHealth = useCallback(async () => {
    const sessionToken = localStorage.getItem('session_token');
    const authToken = localStorage.getItem('auth_token');
    
    if (!sessionToken && !authToken) {
      logout();
      return;
    }

    // Check if auth token is expired and try refresh first
    if (authToken && isTokenExpired(authToken)) {
      console.log('🔄 Auth token expired, attempting refresh...');
      const refreshResult = await refreshSessionTokenRef.current?.();
      if (!refreshResult?.success) {
        logout();
        return;
      }
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Use session token if available, otherwise use auth token
      if (sessionToken) {
        headers['Authorization'] = `Session ${sessionToken}`;
      } else if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${config.apiBaseUrl}/users/auth/me/`, {
        headers,
      });

      if (response.ok) {
        const userData = await response.json();
        const userObject = userData.user;
        
        if (!userObject || !userObject.role) {
          console.error('❌ Invalid user data received');
          logout();
          return;
        }
        
        if (userData.permissions && !userObject.permissions) {
          userObject.permissions = userData.permissions;
        }
        
        setUser(userObject);
        setIsTabAuthenticated(true);
      } else if (response.status === 401) {
        // Try refresh one more time
        if (refreshSessionTokenRef.current) {
          const refreshResult = await refreshSessionTokenRef.current();
          if (refreshResult.success && refreshResult.userData && typeof refreshResult.userData === 'object' && 'id' in refreshResult.userData) {
            setUser(refreshResult.userData as User);
            setIsTabAuthenticated(true);
          } else {
            logout();
          }
        } else {
          logout();
        }
      } else {
        console.error('❌ Session check failed:', response.status);
        // Don't logout on server errors (5xx), only on auth errors
        if (response.status >= 400 && response.status < 500) {
          logout();
        }
      }
    } catch (error) {
      console.error('❌ Session check error:', error);
      // Don't logout on network errors, they might be temporary
    }
  }, [logout]);

  const setupSessionRefresh = useCallback(() => {
  if (sessionRefreshInterval.current) {
    clearInterval(sessionRefreshInterval.current);
  }
  
  // Health check every 10 minutes
  const healthCheckInterval = setInterval(() => {
    if (checkSessionHealthRef.current) {
      checkSessionHealthRef.current();
    }
  }, 10 * 60 * 1000);
  
  // Smart refresh check every 2 minutes
  const refreshInterval = setInterval(() => {
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      const expirationTime = getTokenExpirationTime(authToken);
      if (expirationTime) {
        const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
        // Only refresh if token expires within 5 minutes
        if (expirationTime <= fiveMinutesFromNow && refreshSessionTokenRef.current) {
          refreshSessionTokenRef.current();
        }
      }
    }
  }, 2 * 60 * 1000); // Check every 2 minutes
  
  sessionRefreshInterval.current = refreshInterval;
  
  return () => {
    clearInterval(healthCheckInterval);
    clearInterval(refreshInterval);
  };
}, []);

  useEffect(() => {
    if (isTabAuthenticated) {
      const cleanup = setupSessionRefresh();
      return cleanup;
    }
  }, [isTabAuthenticated, setupSessionRefresh]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      // Handle 2FA requirement
      if (response.requires_2fa) {
        return response; // Return the response with requires_2fa flag
      }

      // Normal login success - store tokens and set user
      if (response.token && response.session_token) {
        localStorage.setItem('session_token', response.session_token);
        
        TabAuthManager.clearTabSession();
        
        // ✅ Ensure user has role property
        const userWithRole = {
          ...response.user,
          role: response.user.role || 'patient',
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

  const refreshToken = useCallback(async () => {
    if (refreshSessionTokenRef.current) {
      await refreshSessionTokenRef.current();
    }
  }, []);

  const getEmergencyAccessSummary = useCallback(async (): Promise<EmergencyAccessSummary> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      const response = await fetch('/api/admin/emergency-access/summary', {
        headers: {
          'Authorization': `Session ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch emergency access summary');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch emergency access summary:', error);
      throw error;
    }
  }, []);

  const initiateEmergencyAccess = useCallback(async (data: { patient_identifier: string; reason: string; detailed_reason?: string }): Promise<{ success: boolean; message: string; access_id?: number; expires_in?: number }> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      const response = await fetch('/api/admin/emergency-access/initiate/', {
        method: 'POST',
        headers: {
          'Authorization': `Session ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to initiate emergency access');
      }
      
      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Emergency access initiated successfully',
        access_id: result.access_id,
        expires_in: result.expires_in,
      };
    } catch (error) {
      console.error('Failed to initiate emergency access:', error);
      throw error;
    }
  }, []);
  
  const endEmergencyAccess = useCallback(async (accessId: number, reason?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      const response = await fetch(`/api/admin/emergency-access/${accessId}/end/`, {
        method: 'POST',
        headers: {
          'Authorization': `Session ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to end emergency access');
      }
      
      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Emergency access ended successfully',
      };
    } catch (error) {
      console.error('Failed to end emergency access:', error);
      throw error;
    }
  }, []);
  
  const reviewEmergencyAccess = useCallback(async (accessId: number, data: { justified: boolean; notes?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      const response = await fetch(`/api/admin/emergency-access/${accessId}/review/`, {
        method: 'POST',
        headers: {
          'Authorization': `Session ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_justified: data.justified,  // Convert to backend expected format
          notes: data.notes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to review emergency access');
      }
      
      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Emergency access reviewed successfully',
      };
    } catch (error) {
      console.error('Failed to review emergency access:', error);
      throw error;
    }
  }, []);
  
  const getEmergencyAccessRecords = useCallback(async (filters?: { reviewed?: boolean; status?: string }): Promise<EmergencyAccessRecord[]> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      const queryParams = new URLSearchParams();
      
      if (filters?.reviewed !== undefined) {
        queryParams.append('reviewed', filters.reviewed.toString());
      }
      if (filters?.status) {
        queryParams.append('status', filters.status);
      }
      
      const url = `/api/admin/emergency-access/records/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Session ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch emergency access records');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch emergency access records:', error);
      throw error;
    }
  }, []);

  const updateConsent = useCallback(async (consentType: string, consentValue: boolean): Promise<{ success: boolean; message: string }> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      if (!sessionToken) {
        console.error('❌ [updateConsent] No session token found');
        throw new Error('No authentication token found');
      }

      const requestPayload = {
        consent_type: consentType,
        consented: consentValue,
      };

      const response = await fetch('/api/healthcare/health-data-consents/update_consent/', {
        method: 'POST',
        headers: {
          'Authorization': `Session ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      // Get response text first to log it
      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);

      } catch (parseError) {
        console.error('❌ [updateConsent] Failed to parse response as JSON:', parseError);
        responseData = { error: 'Invalid JSON response', raw: responseText };
      }
      
      if (!response.ok) {
        console.error('❌ [updateConsent] Request failed:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(responseData)}`);
      }
      
      return {
        success: true,
        message: responseData.message || 'Consent updated successfully',
      };
    } catch (error) {
      console.error('❌ [updateConsent] Caught error:', error);
      console.error('❌ [updateConsent] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (data: { token: string; password: string; confirm_password: string }): Promise<{ detail?: string; success?: boolean; message?: string }> => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/users/auth/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: data.token,
          password: data.password,
          confirm_password: data.confirm_password,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset password');
      }
      
      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Password reset successfully',
      };
    } catch (error) {
      console.error('Failed to reset password:', error);
      throw error;
    }
  }, []);
 
  const setupTwoFactor = useCallback(async (): Promise<SetupTwoFactorResponse> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      const response = await fetch(`${config.apiBaseUrl}/users/auth/setup-2fa/`, {
        method: 'POST',
        headers: {
          'Authorization': `Session ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to setup two-factor authentication');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to setup 2FA:', error);
      throw error;
    }
  }, []);
  
  const confirmTwoFactor = useCallback(async (code: string): Promise<{ success: boolean; message: string; backup_codes?: string[] }> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      const response = await fetch(`${config.apiBaseUrl}/users/auth/confirm-2fa/`, {
        method: 'POST',
        headers: {
          'Authorization': `Session ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: code }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to confirm two-factor authentication');
      }
      
      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Two-factor authentication enabled successfully',
        backup_codes: result.backup_codes,
      };
    } catch (error) {
      console.error('Failed to confirm 2FA:', error);
      throw error;
    }
  }, []);
  
  const disableTwoFactor = useCallback(async (code: string) => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      const response = await fetch(`${config.apiBaseUrl}/users/auth/disable-2fa/`, {
        method: 'POST',
        headers: {
          'Authorization': `Session ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: code }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to disable two-factor authentication');
      }
      
      const result = await response.json();
      return {
        success: true,
        message: result.detail || 'Two-factor authentication disabled successfully',
      };
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      throw error;
    }
  }, []);

  const verifyTwoFactor = useCallback(async (userId: number, code: string) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/users/auth/verify-2fa/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tab-ID': tabId,
        },
        body: JSON.stringify({ 
          user_id: userId, 
          token: code,
          tab_id: tabId 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Two-factor authentication failed');
      }

      const data = await response.json();
      
      // Store tokens and user data
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      if (data.session_token) {
        localStorage.setItem('session_token', data.session_token);
      }
      
      setUser(data.user);
      setIsTabAuthenticated(true);
      
      return data;
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  }, [tabId]);
  
  const verifyEmail = useCallback(async (data: { token: string; email?: string }): Promise<{ success: boolean; message: string; detail?: string }> => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/users/auth/verify-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: data.token,
          email: data.email,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify email');
      }
      
      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Email verified successfully',
        detail: result.detail || result.message,
      };
    } catch (error) {
      console.error('Failed to verify email:', error);
      throw error;
    }
  }, []);

  const requestEmailVerification = useCallback(async (): Promise<{ detail?: string; success?: boolean; message?: string }> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      const response = await fetch(`${config.apiBaseUrl}/users/auth/request-verification/`, {
        method: 'POST',
        headers: {
          'Authorization': `Session ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to request email verification');
      }
      
      const result = await response.json();
      return {
        success: true,
        message: result.message || result.detail || 'Verification email sent successfully',
      };
    } catch (error) {
      console.error('Failed to request email verification:', error);
      throw error;
    }
  }, []);

  const request2FAEmailBackup = useCallback(async (userId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/users/auth/request-2fa-email-backup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to request email backup code');
      }
      
      const result = await response.json();
      return {
        success: true,
        message: result.message || result.detail || 'Backup code sent to your email',
      };
    } catch (error) {
      console.error('Failed to request 2FA email backup:', error);
      throw error;
    }
  }, []);

  const verify2FAEmailBackup = useCallback(async (userId: number, backupCode: string) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/users/auth/verify-2fa-email-backup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId, 
          backup_code: backupCode 
        }),
      });

      if (!response.ok) {
        throw new Error('Email backup verification failed');
      }

      const data = await response.json();
      
      // Store tokens and user data
      if (data.session_token) {
        localStorage.setItem('session_token', data.session_token);
      }
      
      setUser(data.user);
      setIsTabAuthenticated(true);
      
      return data;
    } catch (error) {
      console.error('2FA email backup verification error:', error);
      throw error;
    }
  }, []);

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
 return Boolean((user.permissions as unknown as Record<string, unknown>)[permission]);
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

  useEffect(() => {
    refreshSessionTokenRef.current = refreshSessionToken;
  }, [refreshSessionToken]);
  
  useEffect(() => {
    checkSessionHealthRef.current = checkSessionHealth;
  }, [checkSessionHealth]);
  
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
    getEmergencyAccessSummary,
    initiateEmergencyAccess,
    endEmergencyAccess,
    reviewEmergencyAccess,
    getEmergencyAccessRecords,
    updateConsent,
    login,
    register,
    logout,
    logoutAllTabs,
    refreshToken,
    updateUserProfileImage,
    resetPassword,
    setupTwoFactor,
    confirmTwoFactor,
    disableTwoFactor,
    verifyEmail,
    verifyTwoFactor,
    requestEmailVerification,
    request2FAEmailBackup,
    verify2FAEmailBackup,
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