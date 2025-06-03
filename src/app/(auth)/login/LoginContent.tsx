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
    
    // Prevent redirect loops by checking for problematic patterns
    if (
      decodedUrl.includes('/login') ||           // Direct login references
      decodedUrl.includes('%2Flogin') ||         // Encoded login references
      decodedUrl.includes('returnUrl=') ||       // Nested returnUrl parameters
      decodedUrl.length > 100 ||                 // Suspiciously long URLs
      decodedUrl.split('?').length > 3           // Too many query parameters (likely recursive)
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
      // Add a small delay to prevent rapid redirects
      const timeoutId = setTimeout(() => {
        router.push(sanitizedReturnUrl);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isInitialized, router, sanitizedReturnUrl]);
  
  return <LoginForm />;
}