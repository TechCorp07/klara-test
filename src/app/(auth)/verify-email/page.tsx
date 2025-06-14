// src/app/(auth)/verify-email/page.tsx
'use client';

import { Suspense } from 'react';
import { AppLogo } from '@/components/ui/AppLogo';
import VerifyEmailContent from './VerifyEmailContent';

/**
 * Email verification page component.
 * 
 * This page handles email verification:
 * - If accessed directly, it shows the form to request a new verification email
 * - If accessed via a verification link, it automatically processes the token
 */
export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <AppLogo size='lg' />
        </div>
        
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <VerifyEmailContent />
        </Suspense>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          <span>Protected health information is handled in accordance with HIPAA regulations.</span>
        </p>
      </div>
    </div>
  );
}