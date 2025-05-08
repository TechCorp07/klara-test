// src/app/(auth)/verify-email/[token]/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import VerifyEmailForm from '@/components/auth/VerifyEmailForm/VerifyEmailForm';

interface VerifyEmailTokenPageProps {
  params: {
    token: string;
  };
}

/**
 * Token-based email verification page component.
 * 
 * This page handles email verification using a token from the URL path:
 * - It automatically processes the token to verify the email
 * - It shows appropriate success or error messages
 */
export default function VerifyEmailTokenPage({ params }: VerifyEmailTokenPageProps) {
  const searchParams = useSearchParams();
  
  // Get token from URL path parameter
  const token = params.token;
  
  // Get email from URL query parameter if available
  const email = searchParams.get('email') || '';
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img 
            className="h-16 w-auto" 
            src="/images/logo.svg" 
            alt="Klararety Healthcare Platform" 
          />
        </div>
        
        <VerifyEmailForm token={token} email={email} />
        
        <p className="mt-8 text-center text-sm text-gray-500">
          <span>Protected health information is handled in accordance with HIPAA regulations.</span>
        </p>
      </div>
    </div>
  );
}