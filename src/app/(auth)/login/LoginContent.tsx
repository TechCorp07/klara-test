// src/app/(auth)/login/LoginContent.tsx - FIXED to prevent refresh loops
'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/lib/auth';

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
  
  useEffect(() => {
    console.log('🔄 User authentication state:', { isAuthenticated, isInitialized });
    
    if (isAuthenticated && isInitialized) {
      console.log('🔄 User authenticated, preparing redirect to:', sanitizedReturnUrl);
      
      // Add a small delay to ensure all auth state is properly set
      const redirectTimer = setTimeout(() => {
        console.log('🚀 Executing redirect to:', sanitizedReturnUrl);
        
        // Use router.push instead of router.replace to avoid SSL issues
        // and ensure proper navigation
        router.push(sanitizedReturnUrl);
      }, 500); // Increased delay to ensure cookies are properly set
      
      return () => clearTimeout(redirectTimer);
    } else {
      console.log('🔑 User not authenticated, showing login form');
    }
  }, [isAuthenticated, isInitialized, sanitizedReturnUrl, router]);
  
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