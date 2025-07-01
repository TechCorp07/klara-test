// src/app/(dashboard)/patient/layout.tsx
'use client';

import React from 'react';
import { BaseAuthenticatedLayout } from '../_shared/layouts/BaseAuthenticatedLayout';
import { PatientGuard } from '@/components/guards/PatientGuard';
import { LayoutProvider } from '../_shared/layouts/LayoutContext';

interface PatientLayoutProps {
  children: React.ReactNode;
}

/**
 * Patient-specific dashboard layout that wraps all patient pages
 * with appropriate authentication, permissions, and navigation.
 */
export default function PatientLayout({ children }: PatientLayoutProps) {
  return (
    <LayoutProvider>
      <BaseAuthenticatedLayout 
        requiredRole={['patient', 'admin']}
        showVerificationWarning={true}
      >
        <PatientGuard>
          <div className="min-h-screen bg-gray-50">
            {/* Patient-specific header/breadcrumb could go here */}
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </div>
        </PatientGuard>
      </BaseAuthenticatedLayout>
    </LayoutProvider>
  );
}
