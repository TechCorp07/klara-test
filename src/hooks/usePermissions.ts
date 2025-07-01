// src/hooks/usePermissions.ts
'use client';

import { useState, useEffect, useContext } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { apiClient } from '@/lib/api/client';
import { AdminPermissions } from '@/types/admin.types';

interface PermissionsContextType {
  permissions: AdminPermissions | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePermissions = (): PermissionsContextType => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    if (!isAuthenticated || !user) {
      setPermissions(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user permissions from the API
      const response = await apiClient.get('/api/users/me/permissions/');
      const permissionsData = response.data;

      // Create the permissions object based on user role and specific permissions
      const userPermissions: AdminPermissions = {
        has_admin_access: permissionsData.has_admin_access || user.role === 'admin' || user.role === 'superadmin' || user.is_staff,
        has_user_management_access: permissionsData.has_user_management_access || user.role === 'admin' || user.role === 'superadmin',
        has_system_settings_access: permissionsData.has_system_settings_access || user.role === 'superadmin',
        has_audit_access: permissionsData.has_audit_access || user.role === 'admin' || user.role === 'superadmin' || user.role === 'compliance',
        has_compliance_access: permissionsData.has_compliance_access || user.role === 'compliance' || user.role === 'admin' || user.role === 'superadmin',
        has_export_access: permissionsData.has_export_access || user.role === 'admin' || user.role === 'superadmin',
        user_role: user.role,
        is_superadmin: user.role === 'superadmin' || user.is_superuser,
      };

      setPermissions(userPermissions);
    } catch (err: any) {
      console.error('Failed to fetch permissions:', err);
      
      // Fallback to basic role-based permissions if API fails
      if (user) {
        const fallbackPermissions: AdminPermissions = {
          has_admin_access: user.role === 'admin' || user.role === 'superadmin' || user.is_staff,
          has_user_management_access: user.role === 'admin' || user.role === 'superadmin',
          has_system_settings_access: user.role === 'superadmin',
          has_audit_access: user.role === 'admin' || user.role === 'superadmin' || user.role === 'compliance',
          has_compliance_access: user.role === 'compliance' || user.role === 'admin' || user.role === 'superadmin',
          has_export_access: user.role === 'admin' || user.role === 'superadmin',
          user_role: user.role,
          is_superadmin: user.role === 'superadmin' || user.is_superuser,
        };
        setPermissions(fallbackPermissions);
      } else {
        setError(err.response?.data?.detail || 'Failed to load permissions');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [user, isAuthenticated]);

  const refetch = async () => {
    await fetchPermissions();
  };

  return {
    permissions,
    loading,
    error,
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

// Default export for convenience
export default usePermissions;