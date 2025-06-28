// src/app/(dashboard)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { Spinner } from '@/components/ui/spinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Main dashboard layout that handles routing to role-specific dashboards.
 * 
 * This layout:
 * - Redirects /dashboard to /dashboard/{role} based on user role
 * - Ensures users can only access their role-specific areas
 * - Provides a fallback loading state during route transitions
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && user) {
      // If user is on the root dashboard path, redirect to their role-specific dashboard
      if (pathname === '/dashboard') {
        router.replace(`/dashboard/${user.role}`);
        return;
      }

      // Extract the role from the current path
      const pathSegments = pathname.split('/');
      const roleFromPath = pathSegments[2]; // /dashboard/{role}/...

      // If the path role doesn't match the user's role, redirect to correct dashboard
      if (roleFromPath && roleFromPath !== user.role) {
        // Allow access to some common paths regardless of role
        const commonPaths = ['profile', 'settings', 'messages', 'notifications'];
        if (!commonPaths.includes(roleFromPath)) {
          router.replace(`/dashboard/${user.role}`);
          return;
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  // Show loading spinner during authentication check or route transitions
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
