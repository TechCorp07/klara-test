// src/components/guards/CaregiverGuard.tsx
'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Spinner } from '@/components/ui/spinner';

interface CaregiverGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const CaregiverGuard = ({ children, fallback }: CaregiverGuardProps) => {
  const { permissions, loading } = usePermissions();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Checking caregiver access...</span>
      </div>
    );
  }

  // Check if user has caregiver access
  // Note: Adjust this permission flag based on your actual permission structure
  const hasAccess = permissions?.has_patient_data_access;

  if (!hasAccess) {
    return fallback || (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-orange-100 border border-orange-400 text-orange-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">🤝 Caregiver Access Required</h3>
          <p className="mb-4">
            This page requires caregiver privileges or patient care access.
          </p>
          <p className="text-sm mb-4">
            <strong>Required access:</strong> Caregiver permissions or patient data access
          </p>
          <p className="text-sm mb-4">
            <strong>Your role:</strong> {permissions?.user_role || 'Unknown'}
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};