// src/components/permissions/PermissionGate.tsx
'use client';

import React, { ReactNode } from 'react';
import { useJWTAuth } from '@/lib/auth/use-auth';
import { JWTPayload } from '@/lib/auth/validator';
import { UserRole } from '@/types/auth.types';

/**
 * Permission Gate Component
 * 
 * This component provides conditional rendering based on user permissions.
 * It replaces the complex AdminGuard and similar components that were making
 * async permission checks and creating race conditions.
 */
interface PermissionGateProps {
  children: ReactNode;
  
  // Permission-based access control
  requiredPermission?: keyof NonNullable<JWTPayload['permissions']>;
  anyOfPermissions?: Array<keyof NonNullable<JWTPayload['permissions']>>;
  allOfPermissions?: Array<keyof NonNullable<JWTPayload['permissions']>>;
  
  // Role-based access control (for backward compatibility)
  requiredRole?: UserRole;
  anyOfRoles?: UserRole[];
  
  // Custom permission logic
  customCheck?: (user: unknown, jwtPayload: JWTPayload | null) => boolean;
  
  // Fallback content and behavior
  fallback?: ReactNode;
  redirectTo?: string;
  showAccessDenied?: boolean;
  
  // Loading state handling
  showLoadingSpinner?: boolean;
  loadingComponent?: ReactNode;
}

export function PermissionGate({
  children,
  requiredPermission,
  anyOfPermissions,
  allOfPermissions,
  requiredRole,
  anyOfRoles,
  customCheck,
  fallback,
  redirectTo,
  showAccessDenied = false,
  showLoadingSpinner = true,
  loadingComponent,
}: PermissionGateProps) {
  const { 
    isAuthenticated, 
    isLoading, 
    isInitialized,
    user, 
    jwtPayload,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserRole
  } = useJWTAuth();

  // Show loading state while authentication is being initialized
  if (!isInitialized || isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    if (showLoadingSpinner) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Checking permissions...</span>
        </div>
      );
    }
    
    return null;
  }

  // If user is not authenticated, handle appropriately
  if (!isAuthenticated || !jwtPayload) {
    if (redirectTo && typeof window !== 'undefined') {
      window.location.href = redirectTo;
      return null;
    }
    
    if (showAccessDenied) {
      return <AccessDeniedMessage message="Please log in to access this content." />;
    }
    
    return fallback ? <>{fallback}</> : null;
  }

  // Check permissions using instant, synchronous methods
  let hasAccess = true;

  // Check required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    hasAccess = false;
  }

  // Check any of permissions (user needs at least one)
  if (anyOfPermissions && !hasAnyPermission(anyOfPermissions)) {
    hasAccess = false;
  }

  // Check all of permissions (user needs all)
  if (allOfPermissions && !hasAllPermissions(allOfPermissions)) {
    hasAccess = false;
  }

  // Check required role
  if (requiredRole && getUserRole() !== requiredRole) {
    hasAccess = false;
  }

  // Check any of roles
  if (anyOfRoles && !anyOfRoles.includes(getUserRole() as UserRole)) {
    hasAccess = false;
  }

  // Check custom permission logic
  if (customCheck && !customCheck(user, jwtPayload)) {
    hasAccess = false;
  }

  // If user doesn't have access, handle appropriately
  if (!hasAccess) {
    if (redirectTo && typeof window !== 'undefined') {
      window.location.href = redirectTo;
      return null;
    }
    
    if (showAccessDenied) {
      return <AccessDeniedMessage message="You don't have permission to access this content." />;
    }
    
    return fallback ? <>{fallback}</> : null;
  }

  // User has access - render children
  return <>{children}</>;
}

/**
 * Admin Permission Gate
 * 
 * Simplified component for admin-only content that replaces the complex AdminGuard.
 */
interface AdminGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

export function AdminGate({ children, fallback, showAccessDenied = true }: AdminGateProps) {
  return (
    <PermissionGate
      requiredPermission="has_admin_access"
      fallback={fallback}
      showAccessDenied={showAccessDenied}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * User Management Permission Gate
 * 
 * Component for content that requires user management permissions.
 */
interface UserManagementGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function UserManagementGate({ children, fallback }: UserManagementGateProps) {
  return (
    <PermissionGate
      requiredPermission="has_user_management_access"
      fallback={fallback}
      showAccessDenied={true}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Audit Access Permission Gate
 * 
 * Component for content that requires audit log access.
 */
interface AuditGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuditGate({ children, fallback }: AuditGateProps) {
  return (
    <PermissionGate
      requiredPermission="has_audit_access"
      fallback={fallback}
      showAccessDenied={true}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Role-Based Render Component
 * 
 * This component provides conditional rendering based on user roles.
 * It's useful for showing different content to different types of users.
 */
interface RoleBasedRenderProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleBasedRender({ allowedRoles, children, fallback }: RoleBasedRenderProps) {
  return (
    <PermissionGate
      anyOfRoles={allowedRoles}
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Feature Flag Component
 * 
 * This component provides feature flag functionality for gradual feature rollouts.
 * It uses permission-based logic but can be extended with other feature flag systems.
 */
interface FeatureFlagProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureFlag({ feature, children, fallback }: FeatureFlagProps) {
  const { jwtPayload } = useJWTAuth();
  
  // For now, we'll use permission-based feature flags
  // This can be extended to integrate with external feature flag services
  const hasFeatureAccess = () => {
    if (!jwtPayload) return false;
    
    // Map feature names to permissions
    switch (feature) {
      case 'advanced_analytics':
        return jwtPayload.permissions?.has_admin_access || false;
      case 'bulk_operations':
        return jwtPayload.permissions?.has_user_management_access || false;
      case 'data_export':
        return jwtPayload.permissions?.has_export_access || false;
      case 'emergency_access':
        return jwtPayload.permissions?.can_manage_emergencies || false;
      default:
        return false;
    }
  };

  return hasFeatureAccess() ? <>{children}</> : <>{fallback}</>;
}

/**
 * Conditional Render Component
 * 
 * This component provides flexible conditional rendering based on custom logic.
 */
interface ConditionalRenderProps {
  condition: (user: unknown, jwtPayload: JWTPayload | null) => boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ConditionalRender({ condition, children, fallback }: ConditionalRenderProps) {
  return (
    <PermissionGate
      customCheck={condition}
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Access Denied Message Component
 * 
 * Standardized component for displaying access denied messages.
 */
interface AccessDeniedMessageProps {
  message?: string;
  showContactInfo?: boolean;
}

function AccessDeniedMessage({ 
  message = "You don't have permission to access this content.",
  showContactInfo = true 
}: AccessDeniedMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
        <p className="text-red-700 mb-4">{message}</p>
        
        {showContactInfo && (
          <p className="text-sm text-red-600">
            If you believe this is an error, please contact your system administrator.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Permission Debug Component
 * 
 * This component is useful during development to see what permissions
 * the current user has. Should be removed in production.
 */
export function PermissionDebug() {
  const { jwtPayload, getUserRole, isAuthenticated } = useJWTAuth();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isAuthenticated || !jwtPayload) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg text-xs">
        <div className="font-bold mb-2">Permission Debug</div>
        <div>Status: Not authenticated</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg text-xs max-w-sm">
      <div className="font-bold mb-2">Permission Debug</div>
      <div><strong>Role:</strong> {getUserRole()}</div>
      <div><strong>User ID:</strong> {jwtPayload.user_id}</div>
      <div><strong>Email:</strong> {jwtPayload.email}</div>
      
      {jwtPayload.permissions && (
        <div className="mt-2">
          <div className="font-semibold">Permissions:</div>
          {Object.entries(jwtPayload.permissions).map(([key, value]) => (
            <div key={key} className="text-xs">
              {key}: {value ? '✅' : '❌'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Export all components
export default PermissionGate;