// src/app/(dashboard)/_shared/layouts/PermissionBasedLayout.tsx
'use client';

import React, { ReactNode, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/types/auth.types';
import { PermissionGate } from '@/components/permissions/PermissionGate';

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  permission?: string;
  roles?: UserRole[];
  show: boolean;
  children?: NavigationItem[];
}

interface QuickAction {
  id: string;
  name: string;
  action: () => void;
  icon: string;
  permission?: string;
  roles?: UserRole[];
  show: boolean;
  variant: 'primary' | 'secondary' | 'danger';
}

interface PermissionBasedLayoutProps {
  children: ReactNode;
  title?: string;
  showNavigation?: boolean;
  showQuickActions?: boolean;
  customNavigation?: NavigationItem[];
  customQuickActions?: QuickAction[];
  headerActions?: ReactNode;
}

/**
 * Dynamic layout that adapts based on user permissions
 * This is the core layout for Phase 2 - Permission-Based Dashboard System
 */
export function PermissionBasedLayout({
  children,
  title,
  showNavigation = true,
  showQuickActions = true,
  customNavigation,
  customQuickActions,
  headerActions
}: PermissionBasedLayoutProps) {
  const { user, hasPermission, getUserRole } = useAuth();
  const userRole = getUserRole();

  // Generate navigation items based on permissions
  const navigationItems = useMemo(() => {
    if (customNavigation) return customNavigation;
    
    const items: NavigationItem[] = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        href: `/${userRole}`,
        icon: 'home',
        show: true
      },
      {
        id: 'users',
        name: 'User Management',
        href: '/admin/users',
        icon: 'users',
        permission: 'can_manage_users',
        roles: ['admin', 'superadmin'],
        show: hasPermission('can_manage_users')
      },
      {
        id: 'approvals',
        name: 'User Approvals',
        href: '/admin/approvals',
        icon: 'check-circle',
        permission: 'can_manage_users',
        roles: ['admin', 'superadmin'],
        show: hasPermission('can_manage_users')
      },
      {
        id: 'audit-logs',
        name: 'Audit Logs',
        href: '/admin/audit-logs',
        icon: 'file-text',
        permission: 'can_access_admin',
        roles: ['admin', 'superadmin'],
        show: hasPermission('can_access_admin')
      },
      {
        id: 'patient-data',
        name: 'Patient Data',
        href: '/admin/patient-data',
        icon: 'database',
        permission: 'can_access_patient_data',
        show: hasPermission('can_access_patient_data')
      },
      {
        id: 'research',
        name: 'Research Data',
        href: '/admin/research',
        icon: 'beaker',
        permission: 'can_access_research_data',
        show: hasPermission('can_access_research_data')
      },
      {
        id: 'monitoring',
        name: 'System Monitoring',
        href: '/admin/monitoring',
        icon: 'activity',
        permission: 'can_access_admin',
        roles: ['admin', 'superadmin'],
        show: hasPermission('can_access_admin')
      },
      {
        id: 'emergency',
        name: 'Emergency Access',
        href: '/admin/emergency',
        icon: 'alert-triangle',
        permission: 'can_emergency_access',
        show: hasPermission('can_emergency_access')
      },
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
    ];

    return items.filter(item => item.show);
  }, [userRole, hasPermission, customNavigation]);

  // Generate quick actions based on permissions
  const quickActions = useMemo(() => {
    if (customQuickActions) return customQuickActions;
    
    const actions: QuickAction[] = [
      {
        id: 'create-user',
        name: 'Create User',
        action: () => window.location.href = '/admin/users/create',
        icon: 'user-plus',
        permission: 'can_manage_users',
        variant: 'primary',
        show: hasPermission('can_manage_users')
      },
      {
        id: 'bulk-approve',
        name: 'Bulk Approve',
        action: () => window.location.href = '/admin/approvals?action=bulk',
        icon: 'check-square',
        permission: 'can_manage_users',
        variant: 'secondary',
        show: hasPermission('can_manage_users')
      },
      {
        id: 'generate-report',
        name: 'Generate Report',
        action: () => window.location.href = '/admin/reports',
        icon: 'file-download',
        permission: 'can_access_admin',
        variant: 'secondary',
        show: hasPermission('can_access_admin')
      },
      {
        id: 'emergency-access',
        name: 'Emergency Access',
        action: () => window.location.href = '/admin/emergency',
        icon: 'zap',
        permission: 'can_emergency_access',
        variant: 'danger',
        show: hasPermission('can_emergency_access')
      }
    ];

    return actions.filter(action => action.show);
  }, [hasPermission, customQuickActions]);

  const getIconComponent = (iconName: string) => {
    // Simple icon mapping - in production, use a proper icon library
    const iconMap: Record<string, string> = {
      'home': '🏠',
      'users': '👥',
      'check-circle': '✅',
      'file-text': '📄',
      'database': '💾',
      'beaker': '🧪',
      'activity': '📊',
      'alert-triangle': '⚠️',
      'user': '👤',
      'settings': '⚙️',
      'user-plus': '➕👤',
      'check-square': '☑️',
      'file-download': '⬇️📄',
      'zap': '⚡'
    };
    return iconMap[iconName] || '📄';
  };

  const getActionButtonClass = (variant: QuickAction['variant']) => {
    const baseClass = 'px-4 py-2 rounded-md text-sm font-medium transition-colors';
    switch (variant) {
      case 'primary':
        return `${baseClass} bg-blue-600 text-white hover:bg-blue-700`;
      case 'danger':
        return `${baseClass} bg-red-600 text-white hover:bg-red-700`;
      case 'secondary':
      default:
        return `${baseClass} bg-gray-200 text-gray-900 hover:bg-gray-300`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {title || `${userRole?.charAt(0).toUpperCase()}${userRole?.slice(1)} Dashboard`}
              </h1>
              {user && (
                <span className="text-sm text-gray-500">
                  Welcome, {user.first_name || user.username}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {headerActions}
              
              {/* Quick Actions */}
              {showQuickActions && quickActions.length > 0 && (
                <div className="flex items-center space-x-2">
                  {quickActions.slice(0, 3).map((action) => (
                    <PermissionGate
                      key={action.id}
                      requiredPermission={action.permission}
                      requiredRoles={action.roles}
                    >
                      <button
                        onClick={action.action}
                        className={getActionButtonClass(action.variant)}
                        title={action.name}
                      >
                        <span className="mr-1">{getIconComponent(action.icon)}</span>
                        {action.name}
                      </button>
                    </PermissionGate>
                  ))}
                </div>
              )}
              
              {/* User Menu */}
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {user?.first_name?.[0] || user?.username?.[0] || '?'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {showNavigation && navigationItems.length > 0 && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {navigationItems.map((item) => (
                <PermissionGate
                  key={item.id}
                  requiredPermission={item.permission}
                  requiredRoles={item.roles}
                >
                  <a
                    href={item.href}
                    className="flex items-center space-x-1 py-4 px-2 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 whitespace-nowrap"
                  >
                    <span>{getIconComponent(item.icon)}</span>
                    <span>{item.name}</span>
                  </a>
                </PermissionGate>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export default PermissionBasedLayout;