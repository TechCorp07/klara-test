// src/lib/auth/auth-provider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { JWTValidator, JWTPayload } from './validator';
import { UserRole, User } from '@/types/auth.types';

interface JWTAuthContextType {
  // Core authentication state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // JWT-specific state
  jwtPayload: JWTPayload | null;
  tokenNeedsRefresh: boolean;
  timeToExpiration: number;

  // Authentication methods
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;

  // Permission methods
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;

  // Computed permissions
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canManageUsers: boolean;
  canAccessAudit: boolean;
  canManageSystemSettings: boolean;
  canEmergencyAccess: boolean;
  canAccessPatientData: boolean;
  canAccessResearchData: boolean;

  // Utility methods
  getUserId: () => number | null;
  getUserRole: () => UserRole | null;
  getSessionId: () => string | null;

  // Feature flags (simplified)
  isFeatureEnabled: (flag: string) => boolean;
}

const JWTAuthContext = createContext<JWTAuthContextType | undefined>(undefined);

interface JWTAuthProviderProps {
  children: ReactNode;
}

/**
 * Enhanced JWT Auth Provider
 * This replaces your existing auth provider with Phase 2-3 features
 */
export function JWTAuthProvider({ children }: JWTAuthProviderProps) {
  // Core authentication state
  const [user, setUser] = useState<User | null>(null);
  const [jwtPayload, setJwtPayload] = useState<JWTPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tokenNeedsRefresh, setTokenNeedsRefresh] = useState(false);
  const [timeToExpiration, setTimeToExpiration] = useState(0);

  const router = useRouter();

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  // Monitor token expiration
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

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check for existing JWT token
      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.token) {
          const validation = JWTValidator.validateToken(data.token);
          
          if (validation.isValid && validation.payload) {
            setJwtPayload(validation.payload);
            setUser(data.user);
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

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      if (data.access_token) {
        const validation = JWTValidator.validateToken(data.access_token);
        
        if (validation.isValid && validation.payload) {
          setJwtPayload(validation.payload);
          setUser(data.user);
          
          // Redirect to appropriate dashboard
          const userRole = validation.payload.role;
          router.push(`/${userRole}`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // Registration successful
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      // Clear state
      setUser(null);
      setJwtPayload(null);
      setTokenNeedsRefresh(false);
      setTimeToExpiration(0);

      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.access_token) {
          const validation = JWTValidator.validateToken(data.access_token);
          
          if (validation.isValid && validation.payload) {
            setJwtPayload(validation.payload);
            setUser(data.user);
            setTokenNeedsRefresh(false);
            
            console.log('✅ Token refreshed successfully');
          }
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
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

  // Computed permission properties for easy access
  const isAdmin = hasPermission('is_admin');
  const isSuperAdmin = hasPermission('is_superadmin');
  const canManageUsers = hasPermission('can_manage_users');
  const canAccessAudit = hasPermission('can_access_admin');
  const canManageSystemSettings = hasPermission('can_access_admin');
  const canEmergencyAccess = hasPermission('can_emergency_access');
  const canAccessPatientData = hasPermission('can_access_patient_data');
  const canAccessResearchData = hasPermission('can_access_research_data');

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

  // Simple feature flag system
  const isFeatureEnabled = useCallback((flag: string): boolean => {
    // Basic feature flags based on permissions
    const featureFlags: Record<string, boolean> = {
      'user_management': hasPermission('can_manage_users'),
      'emergency_access': hasPermission('can_emergency_access'),
      'patient_data_access': hasPermission('can_access_patient_data'),
      'research_data_access': hasPermission('can_access_research_data'),
      'system_monitoring': hasPermission('can_access_admin'),
      'audit_logs': hasPermission('can_access_admin'),
      'telemedicine_access': getUserRole() === 'patient' || getUserRole() === 'provider',
      'custom_reports': hasPermission('can_access_admin'),
      // Add more feature flags as needed
    };

    return featureFlags[flag] || false;
  }, [hasPermission, getUserRole]);

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
    canEmergencyAccess,
    canAccessPatientData,
    canAccessResearchData,
    
    // Utility methods
    getUserId,
    getUserRole,
    getSessionId,
    
    // Feature flags
    isFeatureEnabled
  };

  return (
    <JWTAuthContext.Provider value={contextValue}>
      {children}
    </JWTAuthContext.Provider>
  );
}

/**
 * Hook to use the JWT authentication context
 */
export function useJWTAuth(): JWTAuthContextType {
  const context = useContext(JWTAuthContext);
  if (context === undefined) {
    throw new Error('useJWTAuth must be used within a JWTAuthProvider');
  }
  return context;
}

// Export for backward compatibility
export { useJWTAuth as useAuth };
export { JWTAuthProvider as AuthProvider };

export default JWTAuthProvider;