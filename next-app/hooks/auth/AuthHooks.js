'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

/**
 * Custom hook for handling authentication-based redirects
 * 
 * @param {Object} options - Options for the redirect
 * @returns {Object} Current auth state
 */
export function useAuthRedirect(options = {}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const defaultOptions = {
    requiredRoles: null,
    redirectTo: '/login',
    redirectIfAuthenticated: false,
    redirectAuthenticatedTo: '/dashboard',
    ...options
  };
  
  useEffect(() => {
    if (isLoading) return;
    
    // If redirectIfAuthenticated is true and user is authenticated, redirect
    if (defaultOptions.redirectIfAuthenticated && user) {
      router.push(defaultOptions.redirectAuthenticatedTo);
      return;
    }
    
    // If user is not authenticated, redirect to login
    if (!user && !defaultOptions.redirectIfAuthenticated) {
      router.push(defaultOptions.redirectTo);
      return;
    }
    
    // If requiredRoles is specified, check if user has required role
    if (user && defaultOptions.requiredRoles) {
      const roles = Array.isArray(defaultOptions.requiredRoles) 
        ? defaultOptions.requiredRoles 
        : [defaultOptions.requiredRoles];
      
      if (!roles.includes(user.role)) {
        router.push(defaultOptions.redirectTo);
      }
    }
  }, [user, isLoading, router, defaultOptions]);
  
  return { user, isLoading };
}

/**
 * Custom hook for login functionality
 * 
 * @param {Object} options - Options for the login
 * @returns {Object} Login mutation and state
 */
export function useLogin(options = {}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const defaultOptions = {
    onSuccess: () => {},
    onError: () => {},
    redirectTo: '/dashboard',
    ...options
  };
  
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'same-origin'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      if (data.requires2FA) {
        defaultOptions.onSuccess(data);
        return;
      }
      
      // Update user data in cache
      queryClient.setQueryData(['currentUser'], data.user);
      
      // Show success message
      toast.success('Login successful');
      
      // Redirect user
      if (defaultOptions.redirectTo) {
        router.push(defaultOptions.redirectTo);
      }
      
      // Call custom onSuccess
      defaultOptions.onSuccess(data);
    },
    onError: (error) => {
      toast.error(error.message || 'Login failed');
      defaultOptions.onError(error);
    }
  });
  
  return {
    login: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    reset: loginMutation.reset
  };
}

/**
 * Custom hook for logout functionality
 * 
 * @param {Object} options - Options for the logout
 * @returns {Object} Logout mutation and state
 */
export function useLogout(options = {}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const defaultOptions = {
    onSuccess: () => {},
    onError: () => {},
    redirectTo: '/login',
    ...options
  };
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Logout failed');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      // Clear cache
      queryClient.clear();
      
      // Show success message
      toast.success('Logout successful');
      
      // Redirect user
      if (defaultOptions.redirectTo) {
        router.push(defaultOptions.redirectTo);
      }
      
      // Call custom onSuccess
      defaultOptions.onSuccess(data);
    },
    onError: (error) => {
      // Even if API call fails, force logout
      queryClient.clear();
      
      if (defaultOptions.redirectTo) {
        router.push(defaultOptions.redirectTo);
      }
      
      defaultOptions.onError(error);
    }
  });
  
  return {
    logout: logoutMutation.mutateAsync,
    isLoading: logoutMutation.isPending,
    error: logoutMutation.error
  };
}

/**
 * Custom hook for two-factor authentication
 * 
 * @param {Object} options - Options for 2FA
 * @returns {Object} 2FA methods and state
 */
export function useTwoFactor(options = {}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const defaultOptions = {
    onVerifySuccess: () => {},
    onVerifyError: () => {},
    onSetupSuccess: () => {},
    onSetupError: () => {},
    onDisableSuccess: () => {},
    onDisableError: () => {},
    redirectTo: '/dashboard',
    ...options
  };
  
  // Verify 2FA code mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ token, code }) => {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, code }),
        credentials: 'same-origin'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Verification failed');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      // Update user data in cache
      queryClient.setQueryData(['currentUser'], data.user);
      
      // Show success message
      toast.success('Verification successful');
      
      // Redirect user
      if (defaultOptions.redirectTo) {
        router.push(defaultOptions.redirectTo);
      }
      
      // Call custom onSuccess
      defaultOptions.onVerifySuccess(data);
    },
    onError: (error) => {
      toast.error(error.message || 'Verification failed');
      defaultOptions.onVerifyError(error);
    }
  });
  
  // Setup 2FA mutation
  const setupMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/setup-2fa', {
        method: 'POST',
        credentials: 'same-origin'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || '2FA setup failed');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      defaultOptions.onSetupSuccess(data);
    },
    onError: (error) => {
      toast.error(error.message || '2FA setup failed');
      defaultOptions.onSetupError(error);
    }
  });
  
  // Disable 2FA mutation
  const disableMutation = useMutation({
    mutationFn: async (password) => {
      const res = await fetch('/api/auth/disable-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
        credentials: 'same-origin'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || '2FA disabling failed');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      // Update user data in cache
      queryClient.setQueryData(['currentUser'], prev => ({ 
        ...prev, 
        two_factor_enabled: false 
      }));
      
      // Show success message
      toast.success('Two-factor authentication disabled');
      
      // Call custom onSuccess
      defaultOptions.onDisableSuccess(data);
    },
    onError: (error) => {
      toast.error(error.message || '2FA disabling failed');
      defaultOptions.onDisableError(error);
    }
  });
  
  return {
    verify: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
    verifyError: verifyMutation.error,
    
    setup: setupMutation.mutateAsync,
    isSettingUp: setupMutation.isPending,
    setupError: setupMutation.error,
    setupData: setupMutation.data,
    
    disable: disableMutation.mutateAsync,
    isDisabling: disableMutation.isPending,
    disableError: disableMutation.error
  };
}