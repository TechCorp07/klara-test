// src/app/(dashboard)/admin/layout.tsx
'use client';

import React from 'react';
import { PermissionGate } from '@/components/permissions/PermissionGate';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin-specific dashboard layout using new JWT permission system
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <PermissionGate 
      requiredRole="admin"
      requiredPermission="has_admin_access"
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
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