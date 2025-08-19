// src/app/(dashboard)/patient/medications/layout.tsx
'use client';

import React from 'react';
import { PermissionGate } from '@/components/permissions/PermissionGate';

interface MedicationsLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for the medications module within the patient dashboard
 */
export default function MedicationsLayout({ children }: MedicationsLayoutProps) {
  return (
    <PermissionGate 
      requiredRole="patient"
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don&apos;t have permission to access the medications module.</p>
          </div>
        </div>
      }
    >
      {children}
    </PermissionGate>
  );
}