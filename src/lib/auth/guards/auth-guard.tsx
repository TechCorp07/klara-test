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
      redirectAttempts.current = 0;
      lastRedirectPath.current = '';
      setIsRedirecting(false);
      return;
    }
    

    const currentFullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    if (lastRedirectPath.current === currentFullPath) {
      redirectAttempts.current = 0;
      router.replace('/dashboard');
      return;
    }

    if (!isAuthenticated) {
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
      
      router.replace(loginUrl);
      return;
    }
    
    if (user && !user.email_verified && !pathname.includes('/verify-email')) {
      setIsRedirecting(true);
      redirectAttempts.current++;
      router.replace('/verify-email');
      return;
    }
    
    if (user && user.is_approved === false && !pathname.includes('/approval-pending')) {
      setIsRedirecting(true);
      redirectAttempts.current++;
      router.replace('/approval-pending');
      return;
    }
    
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
    return <>{children}</>;
  }

  if (!isInitialized || isLoading || isRedirecting || !isAuthenticated || 
      (user && !user.email_verified) || 
      (user && user.is_approved === false)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;