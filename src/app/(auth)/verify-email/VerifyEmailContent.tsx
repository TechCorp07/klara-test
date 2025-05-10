// src/app/(auth)/verify-email/VerifyEmailContent.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import VerifyEmailForm from '@/components/auth/VerifyEmailForm/VerifyEmailForm';

/**
 * Content component that uses useSearchParams.
 * This component is wrapped in Suspense by the parent page component.
 */
export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  
  // Get token and email from URL parameters if available
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  
  return <VerifyEmailForm token={token} email={email} />;
}