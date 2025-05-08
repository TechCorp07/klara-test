// src/lib/auth/guards/role-guard.tsx
'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../use-auth';
import { UserRole } from '@/types/auth.types';
import { Spinner } from '@/components/ui/spinner'; // Assuming you have a spinner component

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

/**
 * RoleGuard component that protects routes based on user roles
 * 
 * This component extends the authentication check with role-based protection:
 * - Ensures the user is authenticated
 * - Checks if the user's role is in the list of allowed roles
 * - Redirects unauthorized users to the specified fallback path or a default unauthorized page
 * 
 * Note: This component should be used inside routes that are already protected by AuthGuard,
 * or you can use it independently as it also checks for authentication.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallbackPath = '/unauthorized' 
}) => {
  const { isAuthenticated, isInitialized, user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Only proceed if authentication is initialized and not loading
    if (!isInitialized || isLoading) return;

    // First check if user is authenticated
    if (!isAuthenticated || !user) {
      setIsAuthorized(false);
      return;
    }

    // Then check if user has an allowed role
    const hasAllowedRole = allowedRoles.includes(user.role);
    setIsAuthorized(hasAllowedRole);

    // If not authorized, redirect to the fallback path
    if (!hasAllowedRole) {
      router.push(fallbackPath);
    }
  }, [isAuthenticated, isInitialized, user, isLoading, allowedRoles, router, fallbackPath]);

  // Show loading spinner while checking authorization
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // If not authorized, don't render anything (we're redirecting anyway)
  if (!isAuthorized) {
    return null;
  }

  // Render protected content if all checks pass
  return <>{children}</>;
};

// Create specialized role guards for common role combinations
export const PatientGuard: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard {...props} allowedRoles={['patient']} />
);

export const ProviderGuard: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard {...props} allowedRoles={['provider']} />
);

export const AdminGuard: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard {...props} allowedRoles={['admin', 'superadmin']} />
);

export const MedicalStaffGuard: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard {...props} allowedRoles={['provider', 'admin', 'superadmin']} />
);

export const ResearchAccessGuard: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard {...props} allowedRoles={['researcher', 'admin', 'superadmin']} />
);

export const PharmcoAccessGuard: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard {...props} allowedRoles={['pharmco', 'admin', 'superadmin']} />
);

export const CaregiverGuard: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard {...props} allowedRoles={['caregiver']} />
);

export const ComplianceGuard: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard {...props} allowedRoles={['compliance', 'admin', 'superadmin']} />
);

export default RoleGuard;