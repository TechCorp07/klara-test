// src/app/(auth)/login/LoginContent.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/lib/auth/use-auth';

/**
 * Content component that may need to handle client-side routing.
 * This component is wrapped in Suspense by the parent page component.
 */
export default function LoginContent() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the return URL from the query string, sanitize it to prevent multiple nesting
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const sanitizedReturnUrl = returnUrl.includes('/login') ? '/dashboard' : returnUrl;
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push(sanitizedReturnUrl);
    }
  }, [isAuthenticated, isInitialized, router, sanitizedReturnUrl]);
  
  return <LoginForm />;
}