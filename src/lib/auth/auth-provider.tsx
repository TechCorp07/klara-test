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

// Create context with null as initial value
export const AuthContext = createContext<AuthContextType | null>(null);

// Props interface for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that manages authentication state and provides
 * authentication-related methods to the application.
 * 
 * This provider wraps the application and makes authentication state and
 * methods available to all components through the useAuth hook.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State to track the authenticated user
  const [user, setUser] = useState<User | null>(null);
  
  // State to track loading state during authentication operations
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // State to track whether the provider has finished initializing
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // State to track inactivity for auto-logout
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  
  // Effect to initialize the authentication state when the component mounts
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // The token is stored in HttpOnly cookie and will be sent automatically
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        // If token is invalid or expired, user will remain null
        console.error('Failed to initialize authentication state:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);
  
  // Effect to handle auto-logout after inactivity
  useEffect(() => {
    // Only set up inactivity tracking if user is authenticated
    if (!user) return;
    
    // Function to update last activity timestamp
    const updateActivity = () => {
      setLastActivity(Date.now());
    };
    
    // Function to check for inactivity
    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      const inactiveTimeoutMs = config.sessionTimeoutMinutes * 60 * 1000;
      
      if (inactiveTime > inactiveTimeoutMs) {
        // Auto-logout due to inactivity
        logout();
        
        // Show notification if window is available
        if (typeof window !== 'undefined') {
          alert('Your session has expired due to inactivity. Please log in again.');
          window.location.href = '/login';
        }
      }
    };
    
    // Set up event listeners for user activity
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    
    // Set up interval to check for inactivity
    const intervalId = setInterval(checkInactivity, 60 * 1000); // Check every minute
    
    // Clean up event listeners and interval
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      clearInterval(intervalId);
    };
  }, [user, lastActivity]);

  /**
   * Logs in a user with the provided credentials
   * @param username User's email address or username
   * @param password User's password
   * @returns LoginResponse object with user and token information
   */
  const login = async (username: string, password: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ username, password });
      
      // If two-factor authentication is not required, set user state
      if (!response.requires_two_factor) {
        // Store tokens in HttpOnly cookies via our API route
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(response),
          credentials: 'include'
        });
        
        // Update user state
        setUser(response.user);
        
        // Reset last activity timestamp
        setLastActivity(Date.now());
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registers a new user with the provided information
   * @param userData User registration data
   * @returns RegisterResponse object with the created user information
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
   * Logs out the current user
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // First call the backend logout endpoint
      await authService.logout();
      
      // Then clear cookies using our API route
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Update state
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Even if the API call fails, clear cookies and user state
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
   * Verifies a two-factor authentication code during login
   * @param token Temporary token from login response
   * @param code Verification code from authenticator app
   * @returns LoginResponse with tokens and user data
   */
  const verifyTwoFactor = async (token: string, code: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.verifyTwoFactor(token, code);
      
      // Store tokens in HttpOnly cookies via our API route
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
        credentials: 'include'
      });
      
      // Update user state
      setUser(response.user);
      
      // Reset last activity timestamp
      setLastActivity(Date.now());
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sets up two-factor authentication for the current user
   * @returns SetupTwoFactorResponse with secret key and QR code
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
   * Confirms two-factor authentication setup with a verification code
   * @param code Verification code from authenticator app
   * @returns Success message
   */
  const confirmTwoFactor = async (code: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.confirmTwoFactor(code);
      
      // Update user information after successful 2FA setup
      if (response.success) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Disables two-factor authentication for the current user
   * @param code Verification code from authenticator app
   * @returns Success message
   */
  const disableTwoFactor = async (code: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.disableTwoFactor(code);
      
      // Update user information after successful 2FA disabling
      if (response.success) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Requests a password reset email for the provided email address
   * @param email User's email address
   * @returns Response message
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
   * Resets password using a token from the reset email
   * @param data Reset password data including token and new password
   * @returns Response message
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
   * Requests a new email verification link
   * @returns Response message
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
   * Verifies email with token from the verification email
   * @param data Email verification data including token and optionally email
   * @returns Response message
   */
  const verifyEmail = async (data: VerifyEmailRequest): Promise<{ detail: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.verifyEmail(data);
      
      // If user is logged in, update their info
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
   * Updates user consent for various purposes (HIPAA, research, data sharing, etc.)
   * @param consentType Type of consent to update
   * @param consented Whether consent is granted or revoked
   * @returns Updated consent information
   */
  const updateConsent = async (consentType: string, consented: boolean): Promise<any> => {
    setIsLoading(true);
    try {
      const response = await authService.updateConsent(consentType, consented);
      
      // Update user information after consent change
      if (user) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  // Value to provide in the context
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