// src/app/(auth)/login/LoginContent.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/lib/auth/use-auth';

/**
 * Content component that may need to handle client-side routing.
 * This component is wrapped in Suspense by the parent page component.
 */
export default function LoginContent() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isInitialized, router]);
  
  return <LoginForm />;
}