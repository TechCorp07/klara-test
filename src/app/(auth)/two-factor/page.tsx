// src/app/(auth)/two-factor/page.tsx
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AppLogo } from '@/components/ui/AppLogo';

// Dynamically import components that may use client-side hooks
const TwoFactorForm = dynamic(() => import('@/components/auth/TwoFactorForm'), {
  loading: () => <div className="text-center">Loading...</div>,
  ssr: false
});

const AuthGuard = dynamic(() => import('@/lib/auth/guards/auth-guard').then(mod => mod.AuthGuard), {
  loading: () => <div className="text-center">Loading...</div>,
  ssr: false
});

/**
 * Two-factor authentication setup page component.
 * 
 * This page renders the 2FA setup form and handles:
 * - Authentication guard to ensure user is logged in
 * - Display of the 2FA setup flow
 */
export default function TwoFactorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <AppLogo size='lg' />
        </div>
        
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <AuthGuard>
            <Suspense fallback={<div className="text-center">Loading form...</div>}>
              <TwoFactorForm />
            </Suspense>
          </AuthGuard>
        </Suspense>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          <span>Enhanced security for sensitive healthcare information.</span>
        </p>
      </div>
    </div>
  );
}