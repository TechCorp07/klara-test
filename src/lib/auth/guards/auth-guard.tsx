// src/lib/auth/guards/auth-guard.tsx
'use client';

import { useEffect, ReactNode, useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../use-auth';
import { Spinner } from '@/components/ui/spinner';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * FIXED: AuthGuard with proper public route handling to prevent infinite loops
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isInitialized, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Enhanced state management for redirect prevention
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectAttempts = useRef(0);
  const lastRedirectPath = useRef<string>('');
  
  useEffect(() => {
    // CRITICAL FIX: Comprehensive public routes list that MUST be excluded from auth checks
    const publicRoutes = [
      '/login', '/register', '/verify-email', '/reset-password', 
      '/forgot-password', '/two-factor', '/approval-pending', '/unauthorized',
      '/hipaa-notice', '/contact', '/privacy-policy', '/terms-of-service',
      '/compliance-violation', '/about', '/help', '/support', '/faq'
    ];
                        
    // CRITICAL FIX: If we're on a public route, NEVER run auth checks
    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    if (isPublicRoute) {
      // Reset all redirect tracking when on public routes
      redirectAttempts.current = 0;
      lastRedirectPath.current = '';
      setIsRedirecting(false);
      return; // EXIT EARLY - no auth checks for public routes
    }

    // Only proceed if authentication is initialized and not currently loading
    if (!isInitialized || isLoading) return;
    
    // ENHANCED: Loop detection - prevent too many redirects
    if (redirectAttempts.current > 3) {
      console.error('Too many redirect attempts, stopping to prevent infinite loop');
      // Force redirect to a safe page and reset
      redirectAttempts.current = 0;
      router.replace('/dashboard'); // Use replace instead of push
      return;
    }
    
    // Don't redirect if already redirecting to prevent rapid fire redirects
    if (isRedirecting) return;

    // Check if we're trying to redirect to the same path (loop detection)
    const currentFullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    if (lastRedirectPath.current === currentFullPath) {
      console.error('Detected redirect loop, breaking cycle');
      redirectAttempts.current = 0;
      router.replace('/dashboard'); // Use replace instead of push
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      setIsRedirecting(true);
      redirectAttempts.current++;
      lastRedirectPath.current = currentFullPath;
      
      // IMPROVED: Better returnUrl encoding with length limits
      let returnUrl = pathname;
      const queryString = searchParams.toString();
      
      // Add query params only if they don't contain returnUrl (to prevent nesting)
      if (queryString && !queryString.includes('returnUrl')) {
        returnUrl += `?${queryString}`;
      }
      
      // Prevent excessively long return URLs
      if (returnUrl.length > 200) {
        returnUrl = pathname; // Just use the path without query params
      }
      
      // CRITICAL FIX: Prevent login paths from being used as returnUrl
      if (returnUrl.includes('/login') || returnUrl.includes('/register') || 
          returnUrl.includes('/verify-email') || returnUrl.includes('/reset-password')) {
        returnUrl = '/dashboard';
      }
      
      const encodedReturnUrl = encodeURIComponent(returnUrl);
      
      // Use replace instead of push to prevent back button issues
      router.replace(`/login?returnUrl=${encodedReturnUrl}`);
      return;
    }
    
    // If authenticated but email not verified, redirect to verification page
    if (user && !user.email_verified && !pathname.includes('/verify-email')) {
      setIsRedirecting(true);
      redirectAttempts.current++;
      router.replace('/verify-email');
      return;
    }
    
    // If authenticated but account not approved, redirect to approval pending page
    if (user && user.is_approved === false && !pathname.includes('/approval-pending')) {
      setIsRedirecting(true);
      redirectAttempts.current++;
      router.replace('/approval-pending');
      return;
    }
    
    // Reset redirect tracking on successful auth checks
    redirectAttempts.current = 0;
    lastRedirectPath.current = '';
    setIsRedirecting(false);
    
  }, [isAuthenticated, isInitialized, router, pathname, searchParams, user, isLoading, isRedirecting]);

  // CRITICAL FIX: Don't show loading for public routes
  const publicRoutes = [
    '/login', '/register', '/verify-email', '/reset-password', 
    '/forgot-password', '/two-factor', '/approval-pending', '/unauthorized',
    '/hipaa-notice', '/contact', '/privacy-policy', '/terms-of-service',
    '/compliance-violation', '/about', '/help', '/support', '/faq'
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // For public routes, always render children immediately
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show loading indicator while checking authentication or during redirection
  if (!isInitialized || isLoading || isRedirecting || !isAuthenticated || 
      (user && !user.email_verified) || 
      (user && user.is_approved === false)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Render protected content if all checks pass
  return <>{children}</>;
};

export default AuthGuard;