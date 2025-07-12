// src/app/(dashboard)/layout.tsx 
'use client';

import { useAuth } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Simplified dashboard layout.
 * 
 * Role-based routing is now handled by middleware, so this layout
 * just provides loading states and passes through to role-specific layouts.
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading, isInitialized } = useAuth();

  // Show loading spinner during authentication check
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Middleware has already handled role-based routing,
  // so just render the children (role-specific layouts and pages)
  return <>{children}</>;
}