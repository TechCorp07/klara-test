// src/components/permissions/PermissionGate.tsx

'use client';

import React, { ReactNode } from 'react';
import { useJWTAuth } from '@/lib/auth/use-auth';
import { UserRole } from '@/types/auth.types';

interface PermissionGateProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, ANY permission
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  fallback?: ReactNode;
  className?: string;
}

/**
 * Generic permission gate component
 * Updated to handle string permissions
 */
export function PermissionGate({ 
  children, 
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  requiredRole,
  requiredRoles,
  fallback = null,
  className 
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, getUserRole } = useJWTAuth();
  
  // Check single permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }
  
  // Check multiple permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
      
    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }
  
  // Check single role
  if (requiredRole) {
    const userRole = getUserRole();
    if (userRole !== requiredRole) {
      return <>{fallback}</>;
    }
  }
  
  // Check multiple roles
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = getUserRole();
    if (!userRole || !requiredRoles.includes(userRole)) {
      return <>{fallback}</>;
    }
  }
  
  return <div className={className}>{children}</div>;
}

/**
 * Admin-specific permission gate
 */
export function AdminGate({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate requiredPermission="has_admin_access" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * User management permission gate
 */
export function UserManagementGate({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate requiredPermission="has_user_management_access" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Audit access permission gate
 */
export function AuditGate({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate requiredPermission="has_audit_access" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Role-based rendering component
 */
interface RoleBasedRenderProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export function RoleBasedRender({ children, allowedRoles, fallback = null }: RoleBasedRenderProps) {
  return (
    <PermissionGate requiredRoles={allowedRoles} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Feature flag component (for future feature toggling)
 */
interface FeatureFlagProps {
  children: ReactNode;
  feature: string;
  enabled?: boolean;
  fallback?: ReactNode;
}

export function FeatureFlag({ children, feature, enabled = false, fallback = null }: FeatureFlagProps) {
  // For now, just use the enabled prop
  // Later this can be extended to check feature flags from backend
  if (!enabled) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Conditional render utility
 */
interface ConditionalRenderProps {
  children: ReactNode;
  condition: boolean;
  fallback?: ReactNode;
}

export function ConditionalRender({ children, condition, fallback = null }: ConditionalRenderProps) {
  return condition ? <>{children}</> : <>{fallback}</>;
}

/**
 * Permission debug component (development only)
 */
export function PermissionDebug() {
  const { user, jwtPayload } = useJWTAuth();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs max-w-xs">
      <h4 className="font-bold mb-2">🔐 Auth Debug</h4>
      <div className="space-y-1">
        <div>Role: {user?.role}</div>
        <div>Admin: {jwtPayload?.permissions?.can_access_admin ? '✅' : '❌'}</div>
        <div>Users: {jwtPayload?.permissions?.can_manage_users ? '✅' : '❌'}</div>
        <div>SuperAdmin: {jwtPayload?.permissions?.is_superadmin ? '✅' : '❌'}</div>
        <div>Staff: {jwtPayload?.permissions?.is_staff ? '✅' : '❌'}</div>
      </div>
    </div>
  );
}