// src/hooks/dashboard/useDashboardPermissions.ts
'use client';

import { useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/types/auth.types';

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  permission?: string;
  roles?: UserRole[];
  show: boolean;
  badge?: string | number;
}

interface QuickAction {
  id: string;
  name: string;
  href: string;
  icon: string;
  permission?: string;
  variant: 'primary' | 'secondary' | 'danger' | 'success';
  show: boolean;
}

interface DashboardPermissions {
  navigation: NavigationItem[];
  quickActions: QuickAction[];
  canViewDashboard: boolean;
  userRole: UserRole | null;
}

/**
 * Simplified dashboard permission hook
 */
export function useDashboardPermissions(): DashboardPermissions {
  const { hasPermission, getUserRole } = useAuth();
  const userRole = getUserRole();

  // Generate navigation items based on user role and permissions
  const navigation = useMemo((): NavigationItem[] => {
    const items: NavigationItem[] = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        href: `/${userRole}`,
        icon: 'home',
        show: true
      }
    ];

    // Admin-specific navigation
    if (userRole === 'admin' || userRole === 'superadmin') {
      items.push(
        {
          id: 'users',
          name: 'User Management',
          href: '/admin/users',
          icon: 'users',
          permission: 'can_manage_users',
          show: hasPermission('can_manage_users')
        },
        {
          id: 'approvals',
          name: 'User Approvals',
          href: '/admin/approvals',
          icon: 'check-circle',
          permission: 'can_manage_users',
          show: hasPermission('can_manage_users'),
          badge: 8 // This would come from API
        },
        {
          id: 'audit-logs',
          name: 'Audit Logs',
          href: '/admin/audit-logs',
          icon: 'file-text',
          permission: 'can_access_admin',
          show: hasPermission('can_access_admin')
        },
        {
          id: 'monitoring',
          name: 'System Monitoring',
          href: '/admin/monitoring',
          icon: 'activity',
          permission: 'can_access_admin',
          show: hasPermission('can_access_admin')
        }
      );
    }

    // Patient-specific navigation
    if (userRole === 'patient') {
      items.push(
        {
          id: 'health-records',
          name: 'Health Records',
          href: '/patient/health-records',
          icon: 'file-medical',
          show: true
        },
        {
          id: 'appointments',
          name: 'Appointments',
          href: '/patient/appointments',
          icon: 'calendar',
          show: true
        },
        {
          id: 'medications',
          name: 'Medications',
          href: '/patient/medications',
          icon: 'pill',
          show: true
        }
      );
    }

    // Provider-specific navigation
    if (userRole === 'provider') {
      items.push(
        {
          id: 'patients',
          name: 'My Patients',
          href: '/provider/patients',
          icon: 'users',
          permission: 'can_access_patient_data',
          show: hasPermission('can_access_patient_data')
        },
        {
          id: 'appointments',
          name: 'Appointments',
          href: '/provider/appointments',
          icon: 'calendar',
          show: true
        }
      );
    }

    // Emergency access navigation (if available)
    if (hasPermission('can_emergency_access')) {
      items.push({
        id: 'emergency',
        name: 'Emergency Access',
        href: '/admin/emergency',
        icon: 'alert-triangle',
        permission: 'can_emergency_access',
        show: true
      });
    }

    // Common navigation for all authenticated users
    items.push(
      {
        id: 'profile',
        name: 'Profile',
        href: '/profile',
        icon: 'user',
        show: true
      },
      {
        id: 'settings',
        name: 'Settings',
        href: '/settings',
        icon: 'settings',
        show: true
      }
    );

    return items.filter(item => item.show);
  }, [userRole, hasPermission]);

  // Generate quick actions based on permissions
  const quickActions = useMemo((): QuickAction[] => {
    const actions: QuickAction[] = [];

    // Admin quick actions
    if (hasPermission('can_manage_users')) {
      actions.push(
        {
          id: 'create-user',
          name: 'Create User',
          href: '/admin/users/create',
          icon: 'user-plus',
          permission: 'can_manage_users',
          variant: 'primary',
          show: true
        },
        {
          id: 'bulk-approve',
          name: 'Bulk Approve',
          href: '/admin/approvals?action=bulk',
          icon: 'check-square',
          permission: 'can_manage_users',
          variant: 'success',
          show: true
        }
      );
    }

    if (hasPermission('can_access_admin')) {
      actions.push({
        id: 'generate-report',
        name: 'Generate Report',
        href: '/admin/reports',
        icon: 'file-download',
        permission: 'can_access_admin',
        variant: 'secondary',
        show: true
      });
    }

    if (hasPermission('can_emergency_access')) {
      actions.push({
        id: 'emergency-access',
        name: 'Emergency Access',
        href: '/admin/emergency',
        icon: 'zap',
        permission: 'can_emergency_access',
        variant: 'danger',
        show: true
      });
    }

    // Patient quick actions
    if (userRole === 'patient') {
      actions.push(
        {
          id: 'schedule-appointment',
          name: 'Schedule Appointment',
          href: '/patient/appointments/schedule',
          icon: 'calendar-plus',
          variant: 'primary',
          show: true
        },
        {
          id: 'view-records',
          name: 'View Records',
          href: '/patient/health-records',
          icon: 'file-medical',
          variant: 'secondary',
          show: true
        }
      );
    }

    // Provider quick actions
    if (userRole === 'provider') {
      actions.push(
        {
          id: 'add-patient',
          name: 'Add Patient',
          href: '/provider/patients/add',
          icon: 'user-plus',
          variant: 'primary',
          show: true
        },
        {
          id: 'create-appointment',
          name: 'Create Appointment',
          href: '/provider/appointments/create',
          icon: 'calendar-plus',
          variant: 'secondary',
          show: true
        }
      );
    }

    return actions.filter(action => action.show);
  }, [hasPermission, userRole]);

  return {
    navigation,
    quickActions,
    canViewDashboard: !!userRole,
    userRole
  };
}

export default useDashboardPermissions;