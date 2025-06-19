// src/components/guards/ComplianceGuard.tsx
'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Spinner } from '@/components/ui/spinner';

interface ComplianceGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ComplianceGuard = ({ children, fallback }: ComplianceGuardProps) => {
  const { permissions, loading } = usePermissions();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Checking compliance access...</span>
      </div>
    );
  }

  const hasAccess = permissions?.has_audit_access;

  if (!hasAccess) {
    return fallback || (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">🔒 Compliance Access Required To Enter</h3>
          <p className="mb-4">
            This page requires compliance or administrative privileges.
          </p>
          <p className="text-sm mb-4">
            <strong>Required roles:</strong> Admin, Super Admin, or Compliance Officer
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
