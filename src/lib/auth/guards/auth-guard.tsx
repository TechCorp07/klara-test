// src/lib/auth/guards/auth-guard.tsx
'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../use-auth';
import { Spinner } from '@/components/ui/spinner'; // Assuming you have a spinner component

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * AuthGuard component that protects routes requiring authentication
 * 
 * This component checks if the user is authenticated and:
 * - If not authenticated: Redirects to the login page
 * - If authenticated but email not verified: Redirects to email verification page
 * - If authenticated but account not approved: Redirects to approval pending page
 * - Otherwise: Renders the protected content
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isInitialized, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // State to track whether we're currently redirecting
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Skip guard for public routes
    const publicRoutes = ['/login', '/register', '/verify-email', '/reset-password', '/terms-of-service', 
                        '/forgot-password', '/two-factor', '/approval-pending', '/unauthorized',
                        '/hipaa-notice', '/contact',  '/privacy-policy',];
                        
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return;
    }

    // Only proceed if authentication is initialized and not currently loading
    if (!isInitialized || isLoading) return;
    
    // Don't redirect if already redirecting (prevents redirect loops)
    if (isRedirecting) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      setIsRedirecting(true);
      
      // Store the current URL to redirect back after login
      const returnUrl = encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }
    
    // If authenticated but email not verified, redirect to verification page
    // Skip this check if already on the verification page to prevent redirect loops
    if (user && !user.email_verified && !pathname.includes('/verify-email')) {
      setIsRedirecting(true);
      router.push('/verify-email');
      return;
    }
    
    // If authenticated but account not approved, redirect to approval pending page
    // Skip this check if already on the approval page to prevent redirect loops
    if (user && user.is_approved === false && !pathname.includes('/approval-pending')) {
      setIsRedirecting(true);
      router.push('/approval-pending');
      return;
    }
    
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
