// src/app/(auth)/forgot-password/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { useAuth } from '@/lib/auth';
import { AppLogo } from '@/components/ui/AppLogo';

/**
 * Forgot password page component.
 * 
 * This page renders the forgot password form and handles:
 * - Redirect to dashboard if already authenticated
 * - Display of the form for requesting a password reset email
 */
export default function ForgotPasswordPage() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isInitialized, router]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <AppLogo size='lg' />
        </div>
        
        <ForgotPasswordForm />
        
        <p className="mt-8 text-center text-sm text-gray-500">
          <span>Protected health information is handled in accordance with HIPAA regulations.</span>
        </p>
      </div>
    </div>
  );
}