// src/app/(dashboard)/caregiver/layout.tsx
'use client';

import React from 'react';
import { PermissionGate } from '@/components/permissions/PermissionGate';

interface CaregiverLayoutProps {
  children: React.ReactNode;
}

export default function CaregiverLayout({ children }: CaregiverLayoutProps) {
  return (
    <PermissionGate 
      requiredRole="caregiver"
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access the caregiver dashboard.</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
