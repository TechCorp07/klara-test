// src/components/guards/AdminGuard.tsx
'use client';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Spinner } from '@/components/ui/spinner';

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AdminGuard = ({ children, fallback }: AdminGuardProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { permissions, loading, error } = usePermissions();
  const router = useRouter();

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Checking admin access...</span>
      </div>
    );
  }

  // Check if user has admin access
  const hasAccess = permissions?.has_admin_access;

  if (!hasAccess) {
    return fallback || (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">🚫 Admin Access Required</h3>
          <p className="mb-4">
            This page requires administrator privileges.
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