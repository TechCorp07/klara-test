// src/components/guards/AdminGuard.tsx
'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Spinner } from '@/components/ui/spinner';

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireSuperAdmin?: boolean; // If true, requires superadmin role specifically
}

export const AdminGuard = ({ children, fallback, requireSuperAdmin = false }: AdminGuardProps) => {
  const { permissions, loading } = usePermissions();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Verifying admin access...</span>
      </div>
    );
  }

  // Check admin access permissions
  const hasAdminAccess = permissions?.has_admin_access;
  const isSuperAdmin = permissions?.user_role === 'superadmin';
  
  // If superadmin is required, check for that specifically
  const hasRequiredAccess = requireSuperAdmin ? isSuperAdmin : hasAdminAccess;

  if (!hasRequiredAccess) {
    return fallback || (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">🚫 Administrative Access Required</h3>
          <p className="mb-4">
            This page requires {requireSuperAdmin ? 'superadmin' : 'administrative'} privileges.
          </p>
          <p className="text-sm mb-4">
            <strong>Required access:</strong> {requireSuperAdmin ? 'Superadmin role' : 'Admin access permissions'}
          </p>
          <p className="text-sm mb-4">
            <strong>Your role:</strong> {permissions?.user_role || 'Unknown'}
          </p>
          <p className="text-sm mb-4">
            <strong>Your permissions:</strong> {hasAdminAccess ? 'Admin access granted' : 'No admin access'}
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
