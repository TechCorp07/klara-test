// Example: src/app/(dashboard)/patient/layout.tsx
// This pattern should be used for each role-specific dashboard

import BaseAuthenticatedLayout from '../_shared/layouts/BaseAuthenticatedLayout';

interface PatientLayoutProps {
  children: React.ReactNode;
}

/**
 * Patient-specific dashboard layout.
 * 
 * This layout:
 * - Restricts access to patients only
 * - Shows identity verification warnings
 * - Provides patient-specific navigation and features
 */
export default function PatientLayout({ children }: PatientLayoutProps) {
  return (
    <BaseAuthenticatedLayout 
      requiredRole={['patient']}
      showVerificationWarning={true}
    >
      {children}
    </BaseAuthenticatedLayout>
  );
}
