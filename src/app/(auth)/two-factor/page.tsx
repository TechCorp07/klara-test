// src/app/(auth)/two-factor/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TwoFactorForm from '@/components/auth/TwoFactorForm';
import { useAuth } from '@/lib/auth/use-auth';
import { AuthGuard } from '@/lib/auth/guards/auth-guard';

/**
 * Two-factor authentication setup page component.
 * 
 * This page renders the 2FA setup form and handles:
 * - Authentication guard to ensure user is logged in
 * - Display of the 2FA setup flow
 */
export default function TwoFactorPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <img 
              className="h-16 w-auto" 
              src="/images/logo.svg" 
              alt="Klararety Healthcare Platform" 
            />
          </div>
          
          <TwoFactorForm />
          
          <p className="mt-8 text-center text-sm text-gray-500">
            <span>Enhanced security for sensitive healthcare information.</span>
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}