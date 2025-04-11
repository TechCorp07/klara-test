import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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