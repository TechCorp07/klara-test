// src/hooks/usePermissions.ts
'use client';

import { useAuth } from '@/lib/auth/use-auth';
import { AdminPermissions } from '@/types/admin.types';

interface PermissionsContextType {
  permissions: AdminPermissions | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePermissions = (): PermissionsContextType => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // If user data includes permissions, use those directly
  const permissions = user?.permissions || null;

  // Loading state matches auth loading state
  const loading = isLoading || (!isAuthenticated && !user);

  // No separate API call needed - permissions come with user data
  const refetch = async () => {
    // Permissions will be refetched when user data is refetched
    console.log('Permissions will refresh with next user data fetch');
  };

  return {
    permissions,
    loading,
    error: null, // No API call = no API errors
    refetch,
  };
};

// Helper hooks for specific permission checks
export const useAdminAccess = () => {
  const { permissions, loading } = usePermissions();
  return {
    hasAccess: permissions?.has_admin_access || false,
    loading,
  };
};

export const useUserManagementAccess = () => {
  const { permissions, loading } = usePermissions();
  return {
    hasAccess: permissions?.has_user_management_access || false,
    loading,
  };
};

export const useSystemSettingsAccess = () => {
  const { permissions, loading } = usePermissions();
  return {
    hasAccess: permissions?.has_system_settings_access || false,
    loading,
  };
};

export const useAuditAccess = () => {
  const { permissions, loading } = usePermissions();
  return {
    hasAccess: permissions?.has_audit_access || false,
    loading,
  };
};

export const useComplianceAccess = () => {
  const { permissions, loading } = usePermissions();
  return {
    hasAccess: permissions?.has_compliance_access || false,
    loading,
  };
};

export const useExportAccess = () => {
  const { permissions, loading } = usePermissions();
  return {
    hasAccess: permissions?.has_export_access || false,
    loading,
  };
};

export const useSuperAdminAccess = () => {
  const { permissions, loading } = usePermissions();
  return {
    hasAccess: permissions?.is_superadmin || false,
    loading,
  };
};

// Permission checker utility functions
export const checkPermission = (
  permissions: AdminPermissions | null,
  requiredPermission: keyof AdminPermissions
): boolean => {
  if (!permissions) return false;
  return permissions[requiredPermission] as boolean;
};

export const checkAnyPermission = (
  permissions: AdminPermissions | null,
  requiredPermissions: (keyof AdminPermissions)[]
): boolean => {
  if (!permissions) return false;
  return requiredPermissions.some(permission => permissions[permission] as boolean);
};

export const checkAllPermissions = (
  permissions: AdminPermissions | null,
  requiredPermissions: (keyof AdminPermissions)[]
): boolean => {
  if (!permissions) return false;
  return requiredPermissions.every(permission => permissions[permission] as boolean);
};

// Role-based permission checks
export const hasRoleAccess = (
  userRole: string | undefined,
  allowedRoles: string[]
): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

export const isAdminUser = (permissions: AdminPermissions | null): boolean => {
  return checkPermission(permissions, 'has_admin_access');
};

export const isSuperAdminUser = (permissions: AdminPermissions | null): boolean => {
  return checkPermission(permissions, 'is_superadmin');
};

export const canManageUsers = (permissions: AdminPermissions | null): boolean => {
  return checkPermission(permissions, 'has_user_management_access');
};

export const canAccessAuditLogs = (permissions: AdminPermissions | null): boolean => {
  return checkPermission(permissions, 'has_audit_access');
};

export const canManageSystemSettings = (permissions: AdminPermissions | null): boolean => {
  return checkPermission(permissions, 'has_system_settings_access');
};

export const canAccessCompliance = (permissions: AdminPermissions | null): boolean => {
  return checkPermission(permissions, 'has_compliance_access');
};

export const canExportData = (permissions: AdminPermissions | null): boolean => {
  return checkPermission(permissions, 'has_export_access');
};

// Permission-based navigation guards
export const getAccessibleAdminRoutes = (permissions: AdminPermissions | null): string[] => {
  const routes: string[] = [];

  if (checkPermission(permissions, 'has_admin_access')) {
    routes.push('/dashboard/admin');
  }

  if (checkPermission(permissions, 'has_user_management_access')) {
    routes.push('/dashboard/admin/users', '/dashboard/admin/approvals');
  }

  if (checkPermission(permissions, 'has_audit_access')) {
    routes.push('/dashboard/admin/audit-logs');
  }

  if (checkPermission(permissions, 'has_compliance_access')) {
    routes.push('/dashboard/admin/compliance');
  }

  if (checkPermission(permissions, 'has_system_settings_access')) {
    routes.push('/dashboard/admin/system-settings');
  }

  if (checkPermission(permissions, 'has_admin_access')) {
    routes.push('/dashboard/admin/monitoring', '/dashboard/admin/reports');
  }

  return routes;
};

// Default export
export default usePermissions;