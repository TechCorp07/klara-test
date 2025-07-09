// src/hooks/usePermissions.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { AdminPermissions } from '@/types/admin.types';

interface PermissionsContextType {
  permissions: AdminPermissions | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Enhanced error type that includes interceptor flags
interface EnhancedPermissionsError extends Error {
  isPermissionsError?: boolean;
  shouldUseFallback?: boolean;
  response?: {
    status: number;
    data: unknown;
  };
}

export const usePermissions = (): PermissionsContextType => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setPermissions(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the correct endpoint from your ENDPOINTS configuration
      const response = await apiClient.get(ENDPOINTS.USERS.PERMISSIONS);
      const permissionsData = response.data;

      // Create the permissions object based on user role and API response
      const userPermissions: AdminPermissions = {
        has_admin_access: permissionsData.has_admin_access || user.role === 'admin' || user.role === 'superadmin' || user.is_staff,
        has_user_management_access: permissionsData.has_user_management_access || user.role === 'admin' || user.role === 'superadmin',
        has_system_settings_access: permissionsData.has_system_settings_access || user.role === 'superadmin',
        has_audit_access: permissionsData.has_audit_access || user.role === 'admin' || user.role === 'superadmin' || user.role === 'compliance',
        has_compliance_access: permissionsData.has_compliance_access || user.role === 'compliance' || user.role === 'admin' || user.role === 'superadmin',
        has_export_access: permissionsData.has_export_access || user.role === 'admin' || user.role === 'superadmin',
        has_dashboard_access: permissionsData.has_dashboard_access || true, // All authenticated users can access dashboard
        has_compliance_reports_access: permissionsData.has_compliance_reports_access || user.role === 'compliance' || user.role === 'admin' || user.role === 'superadmin',
        user_role: user.role,
        is_superadmin: user.role === 'superadmin' || !!user.is_superuser,
      };

      setPermissions(userPermissions);
      console.log('✅ Permissions loaded successfully for user:', user.role);

    } catch (err: unknown) {
      console.warn('⚠️ Permissions API call failed, analyzing error...', err);

      // Check if this is the enhanced error from our interceptor
      const enhancedError = err as EnhancedPermissionsError;
      
      if (enhancedError.isPermissionsError && enhancedError.shouldUseFallback) {
        console.log('🛡️ Using fallback permissions due to interceptor recommendation');
        
        // The interceptor has identified this as a permissions-specific error
        // Use role-based fallback permissions as intended
        const fallbackPermissions = createFallbackPermissions(user);
        setPermissions(fallbackPermissions);
        
        // Don't set this as an error since we handled it gracefully
        setError(null);
        
      } else if (enhancedError.response?.status === 404) {
        console.warn('🔍 Permissions endpoint not found, using role-based permissions');
        
        // Backend endpoint doesn't exist yet, use role-based permissions
        const fallbackPermissions = createFallbackPermissions(user);
        setPermissions(fallbackPermissions);
        setError(null);
        
      } else if (enhancedError.response?.status === 401) {
        console.error('🔓 Authentication failed for permissions - this might indicate a serious auth issue');
        
        // This could indicate a broader authentication problem
        // Still provide fallback but also set an error
        const fallbackPermissions = createFallbackPermissions(user);
        setPermissions(fallbackPermissions);
        setError('Authentication issue detected while fetching permissions');
        
      } else {
        // Unknown error type, provide fallback and log for investigation
        console.error('❌ Unknown permissions error:', err);
        
        const fallbackPermissions = createFallbackPermissions(user);
        setPermissions(fallbackPermissions);
        setError('Permissions service temporarily unavailable');
      }
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Helper function to create role-based fallback permissions
  const createFallbackPermissions = (user: any): AdminPermissions => {
    return {
      has_admin_access: user.role === 'admin' || user.role === 'superadmin' || !!user.is_staff,
      has_user_management_access: user.role === 'admin' || user.role === 'superadmin',
      has_system_settings_access: user.role === 'superadmin',
      has_audit_access: user.role === 'admin' || user.role === 'superadmin' || user.role === 'compliance',
      has_compliance_access: user.role === 'compliance' || user.role === 'admin' || user.role === 'superadmin',
      has_export_access: user.role === 'admin' || user.role === 'superadmin',
      has_dashboard_access: true, // All authenticated users can access their dashboard
      has_compliance_reports_access: user.role === 'compliance' || user.role === 'admin' || user.role === 'superadmin',
      user_role: user.role,
      is_superadmin: user.role === 'superadmin' || !!user.is_superuser,
    };
  };

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const refetch = useCallback(async () => {
    await fetchPermissions();
  }, [fetchPermissions]);

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

// Create a custom hook for authenticated API calls
export const useAuthenticatedAPI = () => {
  const { user, isInitialized, isLoading } = useAuth();
  
  const makeAuthenticatedRequest = useCallback(async (requestFn: () => Promise<any>) => {
    // Wait for auth initialization
    if (!isInitialized || isLoading) {
      await new Promise((resolve) => {
        const checkAuth = () => {
          if (isInitialized && !isLoading) {
            resolve(void 0);
          } else {
            setTimeout(checkAuth, 50);
          }
        };
        checkAuth();
      });
    }
    
    // Only proceed if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    return requestFn();
  }, [user, isInitialized, isLoading]);
  
  return { makeAuthenticatedRequest };
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