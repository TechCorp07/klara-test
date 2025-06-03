// src/lib/auth/guards/auth-guard.tsx - WITH DEBUG LOGGING
'use client';

import { useEffect, ReactNode, useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../use-auth';
import { Spinner } from '@/components/ui/spinner';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isInitialized, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectAttempts = useRef(0);
  const lastRedirectPath = useRef<string>('');
  
  useEffect(() => {
    // 🔍 ADD DEBUG LOGGING HERE - AT THE TOP OF useEffect
    console.log('🛡️ AuthGuard running:', {
      pathname,
      isAuthenticated,
      isInitialized,
      isLoading,
      user: user ? { id: user.id, email: user.email, role: user.role, email_verified: user.email_verified, is_approved: user.is_approved } : null,
      redirectAttempts: redirectAttempts.current,
      isRedirecting
    });

    const publicRoutes = [
      '/login', '/register', '/verify-email', '/reset-password', 
      '/forgot-password', '/two-factor', '/approval-pending', '/unauthorized',
      '/hipaa-notice', '/contact', '/privacy-policy', '/terms-of-service',
      '/compliance-violation', '/about', '/help', '/support', '/faq'
    ];
                        
    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    // 🔍 MORE DEBUG LOGGING
    console.log('🛡️ Route check:', {
      pathname,
      isPublicRoute,
      matchedRoutes: publicRoutes.filter(route => pathname === route || pathname.startsWith(route + '/'))
    });
    
    if (isPublicRoute) {
      console.log('✅ Public route detected - resetting state and exiting early');
      redirectAttempts.current = 0;
      lastRedirectPath.current = '';
      setIsRedirecting(false);
      return;
    }

    if (!isInitialized || isLoading) {
      console.log('⏳ Auth not ready - waiting...', { isInitialized, isLoading });
      return;
    }
    
    if (redirectAttempts.current > 3) {
      console.error('🔄 Too many redirect attempts, forcing dashboard redirect');
      redirectAttempts.current = 0;
      router.replace('/dashboard');
      return;
    }
    
    if (isRedirecting) {
      console.log('🔄 Already redirecting - skipping');
      return;
    }

    const currentFullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    if (lastRedirectPath.current === currentFullPath) {
      console.error('🔄 Redirect loop detected - forcing dashboard');
      redirectAttempts.current = 0;
      router.replace('/dashboard');
      return;
    }

    if (!isAuthenticated) {
      console.log('🔐 Not authenticated - preparing redirect to login');
      setIsRedirecting(true);
      redirectAttempts.current++;
      lastRedirectPath.current = currentFullPath;
      
      let returnUrl = pathname;
      const queryString = searchParams.toString();
      
      if (queryString && !queryString.includes('returnUrl')) {
        returnUrl += `?${queryString}`;
      }
      
      if (returnUrl.length > 200) {
        returnUrl = pathname;
      }
      
      if (returnUrl.includes('/login') || returnUrl.includes('/register') || 
          returnUrl.includes('/verify-email') || returnUrl.includes('/reset-password')) {
        returnUrl = '/dashboard';
      }
      
      const encodedReturnUrl = encodeURIComponent(returnUrl);
      const loginUrl = `/login?returnUrl=${encodedReturnUrl}`;
      
      console.log('🔐 Redirecting to:', loginUrl);
      router.replace(loginUrl);
      return;
    }
    
    if (user && !user.email_verified && !pathname.includes('/verify-email')) {
      console.log('📧 Email not verified - redirecting to verification');
      setIsRedirecting(true);
      redirectAttempts.current++;
      router.replace('/verify-email');
      return;
    }
    
    if (user && user.is_approved === false && !pathname.includes('/approval-pending')) {
      console.log('⏳ Account not approved - redirecting to approval pending');
      setIsRedirecting(true);
      redirectAttempts.current++;
      router.replace('/approval-pending');
      return;
    }
    
    console.log('✅ All AuthGuard checks passed');
    redirectAttempts.current = 0;
    lastRedirectPath.current = '';
    setIsRedirecting(false);
    
  }, [isAuthenticated, isInitialized, router, pathname, searchParams, user, isLoading, isRedirecting]);

  const publicRoutes = [
    '/login', '/register', '/verify-email', '/reset-password', 
    '/forgot-password', '/two-factor', '/approval-pending', '/unauthorized',
    '/hipaa-notice', '/contact', '/privacy-policy', '/terms-of-service',
    '/compliance-violation', '/about', '/help', '/support', '/faq'
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublicRoute) {
    console.log('✅ Public route - rendering children directly');
    return <>{children}</>;
  }

  if (!isInitialized || isLoading || isRedirecting || !isAuthenticated || 
      (user && !user.email_verified) || 
      (user && user.is_approved === false)) {
    console.log('⏳ Showing loading spinner');
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  console.log('✅ AuthGuard complete - rendering protected content');
  return <>{children}</>;
};

export default AuthGuard;