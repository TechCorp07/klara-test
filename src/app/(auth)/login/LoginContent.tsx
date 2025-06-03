// src/app/(auth)/login/LoginContent.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/lib/auth/use-auth';

/**
 * FIXED: Improved returnUrl handling to prevent redirect loops
 */
export default function LoginContent() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ENHANCED: Better returnUrl sanitization and loop prevention
  const getCleanReturnUrl = () => {
    const returnUrl = searchParams.get('returnUrl') || '/dashboard';
    
    // Decode the URL to handle encoded parameters
    let decodedUrl;
    try {
      decodedUrl = decodeURIComponent(returnUrl);
    } catch {
      // If decoding fails, default to dashboard
      return '/dashboard';
    }
    
    // CRITICAL FIX: More comprehensive loop detection
    if (
      decodedUrl.includes('/login') ||           // Direct login references
      decodedUrl.includes('%2Flogin') ||         // Encoded login references  
      decodedUrl.includes('%252Flogin') ||       // Double-encoded login references
      decodedUrl.includes('returnUrl=') ||       // Nested returnUrl parameters
      decodedUrl.length > 200 ||                 // Suspiciously long URLs
      decodedUrl.split('?').length > 5 ||        // Too many query parameters (likely recursive)
      (decodedUrl.match(/returnUrl/g) || []).length > 1 || // Multiple returnUrl params
      decodedUrl.includes('/register') ||        // Other auth pages
      decodedUrl.includes('/verify-email') ||
      decodedUrl.includes('/reset-password') ||
      decodedUrl.includes('/forgot-password')
    ) {
      return '/dashboard';
    }
    
    // Ensure the URL starts with / for security
    if (!decodedUrl.startsWith('/')) {
      return '/dashboard';
    }
    
    return decodedUrl;
  };
  
  const sanitizedReturnUrl = getCleanReturnUrl();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      // CRITICAL FIX: Add a small delay and use replace instead of push
      const timeoutId = setTimeout(() => {
        router.replace(sanitizedReturnUrl); // Use replace to prevent back button issues
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isInitialized, router, sanitizedReturnUrl]);
  
  // CRITICAL FIX: Don't render anything while redirecting if already authenticated
  if (isInitialized && isAuthenticated) {
    return null; // Prevent any flash of login form
  }
  
  return <LoginForm />;
}