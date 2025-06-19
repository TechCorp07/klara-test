// src/components/guards/ClinicalAccessGuard.tsx
'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Spinner } from '@/components/ui/spinner';

interface ClinicalAccessGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ClinicalAccessGuard = ({ children, fallback }: ClinicalAccessGuardProps) => {
  const { permissions, loading } = usePermissions();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Checking clinical access...</span>
      </div>
    );
  }

  // Check for healthcare-related permissions (patients, providers, caregivers, admins)
  // but explicitly exclude compliance/audit access
  const hasHealthcareAccess = permissions?.has_patient_data_access || 
                             permissions?.has_medical_records_access ||
                             permissions?.can_manage_appointments ||
                             permissions?.can_view_own_data ||
                             permissions?.can_access_telemedicine ||
                             permissions?.can_manage_medications ||
                             permissions?.has_admin_access;

  // Explicitly exclude compliance officers
  const isComplianceOnly = permissions?.has_audit_access && !hasHealthcareAccess;

  const hasAccess = hasHealthcareAccess && !isComplianceOnly;

  if (!hasAccess) {
    return fallback || (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-teal-100 border border-teal-400 text-teal-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">🏥 Clinical Access Required</h3>
          <p className="mb-4">
            This page requires clinical or healthcare-related privileges.
          </p>
          <p className="text-sm mb-4">
            <strong>Allowed access:</strong> Patients, Providers, Caregivers, or Administrators
          </p>
          <p className="text-sm mb-4">
            <strong>Note:</strong> Compliance officers cannot access clinical content
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