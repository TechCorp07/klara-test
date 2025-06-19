// src/components/guards/ResearchGuard.tsx
'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Spinner } from '@/components/ui/spinner';

interface ResearchGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ResearchGuard = ({ children, fallback }: ResearchGuardProps) => {
  const { permissions, loading } = usePermissions();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Checking research access...</span>
      </div>
    );
  }

  // Check if user has research access
  const hasAccess = permissions?.can_view_research_data || permissions?.can_access_clinical_trials;

  if (!hasAccess) {
    return fallback || (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-purple-100 border border-purple-400 text-purple-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">🔬 Research Access Required</h3>
          <p className="mb-4">
            This page requires research privileges or clinical trial access.
          </p>
          <p className="text-sm mb-4">
            <strong>Required access:</strong> Research data or clinical trials
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