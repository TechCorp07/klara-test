// src/app/(auth)/login/LoginContent.tsx - FIXED to prevent refresh loops
'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/lib/auth/use-auth';

/**
 * MAJOR FIXES: Improved redirect handling to prevent infinite loops
 */
export default function LoginContent() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirectedRef = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout>();
  
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
  
  // 🔧 CRITICAL: Much more careful redirect logic
  useEffect(() => {
    // Don't do anything if already redirected
    if (hasRedirectedRef.current) {
      console.log('⏭️ Already redirected, skipping');
      return;
    }
    
    // Don't redirect until auth is fully initialized
    if (!isInitialized) {
      console.log('⏳ Auth not initialized, waiting...');
      return;
    }
    
    // Only redirect if authenticated
    if (isAuthenticated) {
      console.log('🔄 User authenticated, preparing redirect to:', sanitizedReturnUrl);
      
      hasRedirectedRef.current = true;
      
      // 🔧 CRITICAL: Use a longer delay and replace() to prevent back button issues
      redirectTimeoutRef.current = setTimeout(() => {
        console.log('🚀 Executing redirect to:', sanitizedReturnUrl);
        try {
          router.replace(sanitizedReturnUrl);
        } catch (error) {
          console.error('❌ Redirect failed:', error);
          // Fallback to dashboard if redirect fails
          router.replace('/dashboard');
        }
      }, 200); // Increased delay
      
      return () => {
        if (redirectTimeoutRef.current) {
          clearTimeout(redirectTimeoutRef.current);
        }
      };
    } else {
      console.log('🔑 User not authenticated, showing login form');
    }
  }, [isAuthenticated, isInitialized, router, sanitizedReturnUrl]);
  
  // 🔧 CRITICAL: Don't render anything while redirecting
  if (isInitialized && isAuthenticated) {
    return (
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-4 w-4 bg-blue-500 rounded-full mx-auto mb-4"></div>
        </div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    );
  }
  
  // Don't render login form until auth is initialized
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
  
  return <LoginForm />;
}