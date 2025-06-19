// src/lib/auth/auth-provider.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  ResetPasswordRequest, 
  VerifyEmailRequest, 
  SetupTwoFactorResponse,
  AuthContextType 
} from '@/types/auth.types';
import { authService } from '../api/services/auth.service';
import { config } from '@/lib/config';
import { ConsentUpdateResponse } from '@/types/auth.types';
import { getCookieValue } from '@/lib/utils/cookies';

// Create context with null as initial value
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  
  // CRITICAL FIX: Check for token before making API calls
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // STEP 1: Check if auth token exists before making any API calls
        const authToken = getCookieValue(config.authCookieName);
        
        console.error('🔍 AuthProvider initializing:', {
          hasToken: !!authToken,
          cookieName: config.authCookieName
        });
        
        // STEP 2: Only call API if token exists
        if (authToken) {
          console.error('✅ Token found, checking user data...');
          const userData = await authService.getCurrentUser();
          setUser(userData);
          console.error('✅ User data loaded:', userData);
        } else {
          console.error('❌ No token found, user remains unauthenticated');
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to initialize authentication state:', error);
        // If API call fails, clear any stale cookies and set user to null
        setUser(null);
        
        // Clear potentially invalid cookies
        if (typeof window !== 'undefined') {
          document.cookie = `${config.authCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${config.userRoleCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${config.emailVerifiedCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${config.isApprovedCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        console.error('🏁 AuthProvider initialization complete');
      }
    };

    initializeAuth();
  }, []);
  
  // Auto-logout functionality for HIPAA compliance (unchanged)
  useEffect(() => {
    if (!user) return;
    
    const updateActivity = () => {
      setLastActivity(Date.now());
    };
    
    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      const inactiveTimeoutMs = config.sessionTimeoutMinutes * 60 * 1000;
      
      if (inactiveTime > inactiveTimeoutMs) {
        logout();
        if (typeof window !== 'undefined') {
          alert('Your session has expired due to inactivity. Please log in again.');
          window.location.href = '/login';
        }
      }
    };
    
    // Track user activity to reset the inactivity timer
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity));
    
    const intervalId = setInterval(checkInactivity, 60 * 1000); // Check every minute
    
    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(intervalId);
    };
  }, [user, lastActivity]);

  /**
   * Login function aligned with backend single-token system
   */
  const login = async (username: string, password: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ username, password });
      
      // Handle single-token response from backend
      if (!response.requires_2fa) {
        // Store authentication data in cookies via our API route
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response),
          credentials: 'include'
        });
        
        setUser(response.user);
        setLastActivity(Date.now());
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registration function with proper field transformations
   */
  const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    setIsLoading(true);
    try {
      return await authService.register(userData);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function for single-token system
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Call backend logout endpoint
      await authService.logout();
      
      // Clear cookies via our API route
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Even if API call fails, clear local state and cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Two-factor authentication verification
   */
  const verifyTwoFactor = async (userIdOrToken: string, code: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const userId = parseInt(userIdOrToken, 10);
      if (isNaN(userId)) {
        throw new Error('Invalid user ID for two-factor verification');
      }
      
      const response = await authService.verifyTwoFactor(userId, code);
      
      // Store authentication data in cookies
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
        credentials: 'include'
      });
      
      setUser(response.user);
      setLastActivity(Date.now());
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Setup two-factor authentication
   */
  const setupTwoFactor = async (): Promise<SetupTwoFactorResponse> => {
    setIsLoading(true);
    try {
      return await authService.setupTwoFactor();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Confirm two-factor authentication setup
   */
  const confirmTwoFactor = async (code: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.confirmTwoFactor(code);
      
      if (response.success) {
        // Update user information after successful 2FA setup
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Disable 2FA - backend expects password, not 2FA code
   */
  const disableTwoFactor = async (password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.disableTwoFactor(password);
      
      if (response.success) {
        // Update user information after disabling 2FA
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Request password reset email
   */
  const requestPasswordReset = async (email: string): Promise<{ detail: string }> => {
    setIsLoading(true);
    try {
      return await authService.forgotPassword(email);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset password with token from email
   */
  const resetPassword = async (data: ResetPasswordRequest): Promise<{ detail: string }> => {
    setIsLoading(true);
    try {
      return await authService.resetPassword(data);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Request email verification
   */
  const requestEmailVerification = async (): Promise<{ detail: string }> => {
    setIsLoading(true);
    try {
      return await authService.requestEmailVerification();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify email with token
   */
  const verifyEmail = async (data: VerifyEmailRequest): Promise<{ detail: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.verifyEmail(data);
      
      // Update user info if logged in
      if (user) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        // Update email verification cookie
        if (userData.email_verified) {
          document.cookie = `${config.emailVerifiedCookieName}=true; path=/; max-age=604800; SameSite=Strict${config.secureCookies ? '; Secure' : ''}`;
        }
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user consent preferences
   */
  const updateConsent = async (consentType: string, consented: boolean): Promise<ConsentUpdateResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.updateConsent(consentType, consented);
  
      // Refresh user data after consent update
      if (user) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
  
      return response;
    } finally {
      setIsLoading(false);
    }
  };  

  // Context value with all authentication methods
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    login,
    register,
    logout,
    verifyTwoFactor,
    setupTwoFactor,
    confirmTwoFactor,
    disableTwoFactor,
    requestPasswordReset,
    resetPassword,
    requestEmailVerification,
    verifyEmail,
    updateConsent
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;