// src/app/(auth)/login/LoginContent.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/lib/auth';

/**
 * Sequential login flow that waits for auth to be fully ready before redirecting
 */
export default function LoginContent() {
  const { isAuthenticated, isInitialized, isAuthReady } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirectedRef = useRef(false);
  
  // 🔧 IMPROVED: Much more conservative returnUrl handling
  const getCleanReturnUrl = () => {
    const returnUrl = searchParams.get('returnUrl');
    
    if (!returnUrl) {
      return '/dashboard';
    }
    
    // 🔧 CRITICAL: Be very strict about what we allow
    const dangerousPatterns = [
      '/login',
      '/auth',
      '/.well-known',
      '/_next',
      '/api',
      'returnUrl=',
      'javascript:',
      'data:',
      'vbscript:',
      '/logout'
    ];
    
    // Check if returnUrl contains any dangerous patterns
    if (dangerousPatterns.some(pattern => returnUrl.toLowerCase().includes(pattern.toLowerCase()))) {
      console.log('🚫 Dangerous returnUrl pattern detected:', returnUrl);
      return '/dashboard';
    }
    
    // Check URL length
    if (returnUrl.length > 100) {
      console.log('🚫 ReturnUrl too long:', returnUrl.length);
      return '/dashboard';
    }
    
    // Must start with / and be a simple path
    if (!returnUrl.startsWith('/') || returnUrl.includes('//')) {
      console.log('🚫 Invalid returnUrl format:', returnUrl);
      return '/dashboard';
    }
    
    // Only allow simple alphanumeric paths with basic separators
    if (!/^\/[a-zA-Z0-9/_-]*$/.test(returnUrl)) {
      console.log('🚫 ReturnUrl contains invalid characters:', returnUrl);
      return '/dashboard';
    }
    
    console.log('✅ Allowing returnUrl:', returnUrl);
    return returnUrl;
  };
  
  const sanitizedReturnUrl = getCleanReturnUrl();
  
  useEffect(() => {
    console.log('🔄 Auth state check:', { 
      isAuthenticated, 
      isInitialized, 
      isAuthReady,
      hasRedirected: hasRedirectedRef.current 
    });
    
    // CRITICAL: Only redirect when ALL conditions are met and we haven't redirected yet
    const shouldRedirect = (
      isInitialized &&        // Auth system initialized
      isAuthenticated &&      // User is authenticated  
      isAuthReady &&          // Auth cookies are ready for API calls
      !hasRedirectedRef.current // Haven't redirected yet
    );
    
    if (shouldRedirect) {
      console.log('✅ All auth conditions met, executing redirect to:', sanitizedReturnUrl);
      hasRedirectedRef.current = true;
      
      // Use push instead of replace to avoid potential navigation issues
      router.push(sanitizedReturnUrl);
    } else if (isInitialized && isAuthenticated && !isAuthReady) {
      console.log('⏳ User authenticated but auth system not ready yet, waiting...');
    } else if (isInitialized && !isAuthenticated) {
      console.log('🔑 User not authenticated, showing login form');
    }
  }, [isInitialized, isAuthenticated, isAuthReady, sanitizedReturnUrl, router]);
  
  // Show different loading states based on auth progress
  if (!isInitialized) {
    return (
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-4 w-4 bg-gray-300 rounded-full mx-auto mb-4"></div>
        </div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }
  
  if (isInitialized && isAuthenticated && !isAuthReady) {
    return (
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-4 w-4 bg-blue-400 rounded-full mx-auto mb-4"></div>
        </div>
        <p className="text-gray-600">Verifying your session...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we confirm your authentication.</p>
      </div>
    );
  }
  
  if (isInitialized && isAuthenticated && isAuthReady) {
    return (
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-4 w-4 bg-green-500 rounded-full mx-auto mb-4"></div>
        </div>
        <p className="text-gray-600">Redirecting...</p>
        <p className="text-sm text-gray-500 mt-2">Taking you to your dashboard.</p>
      </div>
    );
  }
  
  // Only show login form when fully initialized and not authenticated
  return <LoginForm />;
}