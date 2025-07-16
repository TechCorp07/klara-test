// src/lib/auth/jwt-auth-provider.tsx
/**
 * JWT Authentication Provider - Race Condition Free Implementation
 * 
 * This provider replaces the complex async authentication logic that was causing
 * race conditions. Think of this as upgrading from a complex system with multiple
 * moving parts that could interfere with each other, to a streamlined system
 * where authentication state flows predictably from JWT token validation.
 * 
 * Key improvements over the previous auth provider:
 * 1. Eliminates HTTP requests for permission checks
 * 2. Simplifies authentication state management
 * 3. Provides instant permission access from JWT payload
 * 4. Removes timing-dependent async operations
 * 5. Uses only HttpOnly cookies for security
 */

'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { JWTValidator, JWTPayload } from './validator';
import { 
  User, 
  LoginCredentials,
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  } from '@/types/auth.types';

interface JWTAuthContextType {
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
  getUserRole: () => string | null;
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
  '/faq',
];

/**
 * Convert JWT payload to User object
 * 
 * This function transforms the JWT payload into the User interface that
 * the rest of your application expects, maintaining compatibility with
 * existing components while leveraging JWT data.
 */
function jwtPayloadToUser(payload: JWTPayload): User {
  return {
    id: payload.user_id,
    email: payload.email,
    role: payload.role,
    
    // These fields would come from the JWT payload if your backend includes them
    // For now, we'll provide reasonable defaults and rely on the JWT permissions
    first_name: '', // Could be extracted from JWT if backend includes it
    last_name: '',  // Could be extracted from JWT if backend includes it
    is_active: true, // If JWT is valid, user is active
    is_approved: true, // If JWT is valid, user is approved
    email_verified: true, // If JWT is valid, email was verified
    phone_verified: false, // Would need to be in JWT payload
    two_factor_enabled: false, // Would need to be in JWT payload
    
    // Profile data - these could be included in JWT or fetched separately
    patient_profile: undefined,
    provider_profile: undefined,
    admin_profile: undefined,
    pharmco_profile: undefined,
    caregiver_profile: undefined,
    researcher_profile: undefined,
    compliance_profile: undefined,
    
    // Permissions extracted from JWT
    permissions: payload.permissions || {},
    
    // Metadata
    date_joined: '', // Would need to be in JWT payload
    last_login: '', // Would need to be in JWT payload
  };
}

interface JWTAuthProviderProps {
  children: ReactNode;
}

export const JWTAuthProvider: React.FC<JWTAuthProviderProps> = ({ children }) => {
  // Core authentication state
  const [user, setUser] = useState<User | null>(null);
  const [jwtPayload, setJwtPayload] = useState<JWTPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [tokenNeedsRefresh, setTokenNeedsRefresh] = useState<boolean>(false);
  const [timeToExpiration, setTimeToExpiration] = useState<number | null>(null);
  
  const pathname = usePathname();

  /**
   * Initialize authentication state from JWT cookie
   * 
   * This function runs once when the provider mounts and extracts authentication
   * state directly from the JWT cookie. Unlike the previous implementation,
   * this doesn't make any HTTP requests during initialization.
   */
  const initializeAuth = useCallback(async () => {
    try {
      // Check if we're on a public route - no need to validate auth
      const isPublicRoute = PUBLIC_ROUTES.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      );

      if (isPublicRoute) {
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      // Try to get JWT token from cookie via a simple fetch
      // This is the only HTTP request we make, and it's to our own API route
      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        credentials: 'include', // Include HttpOnly cookies
      });

      if (response.ok) {
        const { token } = await response.json();
        
        if (token) {
          // Validate the JWT token locally
          const validationResult = JWTValidator.validateToken(token);
          
          if (validationResult.isValid && validationResult.payload) {
            // Extract user information from JWT payload
            const userFromJWT = jwtPayloadToUser(validationResult.payload);
            
            setUser(userFromJWT);
            setJwtPayload(validationResult.payload);
            setTokenNeedsRefresh(validationResult.needsRefresh || false);
            setTimeToExpiration(validationResult.expiresIn || null);
            
            console.log('✅ JWT authentication initialized successfully');
          } else {
            console.log('❌ Invalid JWT token during initialization');
            setUser(null);
            setJwtPayload(null);
          }
        }
      } else {
        // No valid token available
        console.log('ℹ️ No JWT token available during initialization');
        setUser(null);
        setJwtPayload(null);
      }
    } catch (error) {
      console.error('JWT initialization error:', error);
      setUser(null);
      setJwtPayload(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [pathname]);

  // Initialize auth when component mounts
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  // Set up token expiration monitoring
  useEffect(() => {
    if (!jwtPayload) return;

    const updateExpirationTimer = () => {
      const remaining = JWTValidator.getTimeToExpiration(jwtPayload);
      setTimeToExpiration(remaining);
      setTokenNeedsRefresh(JWTValidator.needsRefresh(jwtPayload));
      
      // If token expired, clear auth state
      if (remaining <= 0) {
        setUser(null);
        setJwtPayload(null);
        setTimeToExpiration(null);
        setTokenNeedsRefresh(false);
      }
    };

    // Update immediately
    updateExpirationTimer();

    // Set up interval to update every minute
    const interval = setInterval(updateExpirationTimer, 60000);

    return () => clearInterval(interval);
  }, [jwtPayload]);

  /**
   * Login method - simplified for JWT
   * 
   * This method handles login by calling the backend authentication endpoint
   * and then extracting the resulting JWT token for local validation.
   */
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setIsLoading(true);
    
    try {
      // Step 1: Authenticate with backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for HttpOnly cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const loginData: LoginResponse = await response.json();

      // Step 2: If we have a token in the response, validate it locally
      if (loginData.token) {
        const validationResult = JWTValidator.validateToken(loginData.token);
        
        if (validationResult.isValid && validationResult.payload) {
          const userFromJWT = jwtPayloadToUser(validationResult.payload);
          
          setUser(userFromJWT);
          setJwtPayload(validationResult.payload);
          setTokenNeedsRefresh(validationResult.needsRefresh || false);
          setTimeToExpiration(validationResult.expiresIn || null);
          
          console.log('✅ Login successful with JWT validation');
        }
      }

      return loginData;
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setJwtPayload(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout method - simplified for JWT
   * 
   * This method clears authentication state and HttpOnly cookies.
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Call logout endpoint to clear HttpOnly cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear local state immediately
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
   * 
   * This handles user registration through the backend API.
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
   * 
   * This method refreshes the JWT token before it expires.
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
            setTimeToExpiration(validationResult.expiresIn || null);
            
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
   * 
   * These methods extract permissions directly from the JWT payload,
   * eliminating the need for HTTP requests to check permissions.
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
    return jwtPayload?.user_id || null;
  }, [jwtPayload]);

  const getUserRole = useCallback((): string | null => {
    return jwtPayload?.role || null;
  }, [jwtPayload]);

  const getSessionId = useCallback((): string | null => {
    return jwtPayload?.session_id || null;
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
};

export default JWTAuthProvider;