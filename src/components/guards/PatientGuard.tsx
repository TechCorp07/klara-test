// src/components/guards/PatientGuard.tsx
'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Spinner } from '@/components/ui/spinner';

interface PatientGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const PatientGuard = ({ children, fallback }: PatientGuardProps) => {
  const { permissions, loading } = usePermissions();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Checking patient access...</span>
      </div>
    );
  }

  // Check if user has patient data access
  const hasAccess = permissions?.can_view_own_data || permissions?.has_patient_data_access;

  if (!hasAccess) {
    return fallback || (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">👤 Patient Access Required</h3>
          <p className="mb-4">
            This page requires patient privileges or access to patient data.
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