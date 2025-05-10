// src/app/(auth)/two-factor/TwoFactorContent.tsx
'use client';

import TwoFactorForm from '@/components/auth/TwoFactorForm';

/**
 * Content component for two-factor authentication form.
 * This component is wrapped in Suspense by the parent page component.
 */
export default function TwoFactorContent() {
  return <TwoFactorForm />;
}