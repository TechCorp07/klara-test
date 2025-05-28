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

// Create context with null as initial value
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * MAJOR FIX: AuthProvider aligned with your single-token backend system
 * 
 * Key Changes Explained:
 * 1. Removed all refresh token logic - your backend doesn't support it
 * 2. Simplified token management - backend uses longer-lived single tokens
 * 3. Fixed 2FA verification to use proper user ID parameter
 * 4. Corrected cookie handling to match backend expectations
 * 5. Improved error handling for backend response format
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  
  // Initialize authentication state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // FIXED: Simplified initialization - no token refresh needed
        // The token is automatically sent via cookies due to withCredentials: true
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        // If authentication fails, user remains null
        console.error('Failed to initialize authentication state:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);
  
  // Auto-logout functionality for HIPAA compliance
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
    
    // Activity tracking event listeners
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity));
    
    const intervalId = setInterval(checkInactivity, 60 * 1000);
    
    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(intervalId);
    };
  }, [user, lastActivity]);

  /**
   * FIXED: Login function aligned with backend single-token system
   */
  const login = async (username: string, password: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ username, password });
      
      // FIXED: Handle single-token response from backend
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
   * FIXED: Registration function with proper field transformations
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
   * SIMPLIFIED: Logout function for single-token system
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
   * CRITICAL FIX: Two-factor authentication verification
   * Your backend expects a numeric user_id, not a token string
   */
  const verifyTwoFactor = async (userIdOrToken: string, code: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      // FIXED: Parse user ID as number - backend expects numeric user_id
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
   * FIXED: Setup two-factor authentication with correct response handling
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
   * FIXED: Disable 2FA - backend expects password, not 2FA code
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