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
 * ENHANCED: AuthGuard with better redirect loop prevention
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
    // EXPANDED: More comprehensive public routes list
    const publicRoutes = [
      '/login', '/register', '/verify-email', '/reset-password', 
      '/forgot-password', '/two-factor', '/approval-pending', '/unauthorized',
      '/hipaa-notice', '/contact', '/privacy-policy', '/terms-of-service',
      '/compliance-violation',
      // Add common static pages that should be public
      '/about', '/help', '/support', '/faq'
    ];
                        
    // Skip guard for public routes - use exact match and startsWith
    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    if (isPublicRoute) {
      // Reset redirect attempts when on public routes
      redirectAttempts.current = 0;
      lastRedirectPath.current = '';
      return;
    }

    // Only proceed if authentication is initialized and not currently loading
    if (!isInitialized || isLoading) return;
    
    // ENHANCED: Loop detection - prevent too many redirects
    if (redirectAttempts.current > 3) {
      console.error('Too many redirect attempts, stopping to prevent infinite loop');
      // Force redirect to a safe page
      router.push('/dashboard');
      return;
    }
    
    // Don't redirect if already redirecting to prevent rapid fire redirects
    if (isRedirecting) return;

    // Check if we're trying to redirect to the same path (loop detection)
    const currentFullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    if (lastRedirectPath.current === currentFullPath) {
      console.error('Detected redirect loop, breaking cycle');
      redirectAttempts.current = 0;
      router.push('/dashboard');
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
      if (queryString) {
        returnUrl += `?${queryString}`;
      }
      
      // Prevent excessively long return URLs
      if (returnUrl.length > 200) {
        returnUrl = pathname; // Just use the path without query params
      }
      
      // Ensure we don't encode login paths
      if (returnUrl.includes('/login')) {
        returnUrl = '/dashboard';
      }
      
      const encodedReturnUrl = encodeURIComponent(returnUrl);
      router.push(`/login?returnUrl=${encodedReturnUrl}`);
      return;
    }
    
    // If authenticated but email not verified, redirect to verification page
    if (user && !user.email_verified && !pathname.includes('/verify-email')) {
      setIsRedirecting(true);
      redirectAttempts.current++;
      router.push('/verify-email');
      return;
    }
    
    // If authenticated but account not approved, redirect to approval pending page
    if (user && user.is_approved === false && !pathname.includes('/approval-pending')) {
      setIsRedirecting(true);
      redirectAttempts.current++;
      router.push('/approval-pending');
      return;
    }
    
    // Reset redirect tracking on successful auth checks
    redirectAttempts.current = 0;
    lastRedirectPath.current = '';
    setIsRedirecting(false);
    
  }, [isAuthenticated, isInitialized, router, pathname, searchParams, user, isLoading, isRedirecting]);

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