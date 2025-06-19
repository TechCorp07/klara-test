// src/components/guards/ProviderGuard.tsx
'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Spinner } from '@/components/ui/spinner';

interface ProviderGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProviderGuard = ({ children, fallback }: ProviderGuardProps) => {
  const { permissions, loading } = usePermissions();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Checking provider access...</span>
      </div>
    );
  }

  // Check if user has medical provider access
  const hasAccess = permissions?.has_medical_records_access || 
                   permissions?.can_manage_appointments || 
                   permissions?.can_access_telemedicine;

  if (!hasAccess) {
    return fallback || (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">🩺 Provider Access Required</h3>
          <p className="mb-4">
            This page requires medical provider privileges.
          </p>
          <p className="text-sm mb-4">
            <strong>Required access:</strong> Medical records, appointments, or telemedicine
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