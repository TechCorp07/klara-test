// src/app/(auth)/login/page.tsx
'use client';

import { Suspense } from 'react';
import LoginContent from './LoginContent';
import { AppLogo } from '@/components/ui/AppLogo';

/**
 * Login page component.
 * 
 * This page renders the login form and handles:
 * - Redirect to dashboard if already authenticated
 * - Display of the login form
 * - Metadata for SEO
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <AppLogo size='lg' />
        </div>
        
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <LoginContent />
        </Suspense>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          <span>Protected health information is handled in accordance with HIPAA regulations.</span>
        </p>
      </div>
    </div>
  );
}