// src/app/(dashboard)/layout.tsx
'use client';

import React, { ReactNode, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useDashboardPermissions } from '@/hooks/dashboard/useDashboardPermissions';
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { Spinner } from '@/components/ui/spinner';
interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading, isAuthenticated, user, hasPermission, getUserRole } = useAuth();
  const { navigation, quickActions, canViewDashboard, userRole } = useDashboardPermissions();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Auth context handles redirect
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };
  
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
``
  if (!canViewDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Dashboard Access</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access any dashboard features.
          </p>
          <p className="text-sm text-gray-500">
            Role: {userRole} | Email: {user?.email}
          </p>
          <div className="mt-6">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getIconComponent = (iconName: string) => {
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
      'mail': '📧',
      'calendar': '📅',
      'file-medical': '🏥',
      'pill': '💊',
      'video': '📹',
      'user-group': '👥',
      'chart-line': '📈',
      'bar-chart': '📊'
    };
    return iconMap[iconName] || '📄';
  };

  const getQuickActionClass = (variant: string) => {
    const baseClass = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';
    switch (variant) {
      case 'primary':
        return `${baseClass} bg-blue-600 text-white hover:bg-blue-700`;
      case 'success':
        return `${baseClass} bg-green-600 text-white hover:bg-green-700`;
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
            {/* Left side - Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Klararety Healthcare
                </h1>
              </div>
              <div className="hidden md:block text-sm text-gray-500">
                {userRole?.charAt(0).toUpperCase()}{userRole?.slice(1)} Dashboard
              </div>
            </div>

            {/* Right side - User info and quick actions */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <div className="hidden lg:flex items-center space-x-2">
                  {quickActions.slice(0, 2).map((action) => (
                    <PermissionGate
                      key={action.id}
                      requiredPermission={action.permission}
                    >
                      <a
                        href={action.href}
                        className={getQuickActionClass(action.variant)}
                        title={action.name}
                      >
                        <span className="mr-1">{getIconComponent(action.icon)}</span>
                        <span className="hidden xl:inline">{action.name}</span>
                      </a>
                    </PermissionGate>
                  ))}
                </div>
              )}

              {/* Notifications - Permission-aware */}
              <PermissionGate requiredPermission="can_manage_users">
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <span className="text-lg">🔔</span>
                    {/* Notification badge */}
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      8
                    </span>
                  </button>
                </div>
              </PermissionGate>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-sm text-right">
                  <p className="font-medium text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {user?.first_name?.[0] || user?.username?.[0] || '?'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {navigation.length > 0 && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {navigation.map((item) => (
                <PermissionGate
                  key={item.id}
                  requiredPermission={item.permission}
                  requiredRoles={item.roles}
                >
                  <a
                    href={item.href}
                    className="flex items-center space-x-2 py-4 px-2 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 whitespace-nowrap transition-colors"
                  >
                    <span>{getIconComponent(item.icon)}</span>
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </PermissionGate>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Permission-aware content rendering */}
        <PermissionGate
          requiredRoles={[userRole!]}
          fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  Role Access Warning
                </h3>
                <p className="text-yellow-700">
                  You are accessing a dashboard that may not match your assigned role. 
                  Some features may be limited or unavailable.
                </p>
                <p className="text-sm text-yellow-600 mt-2">
                  Current role: {userRole} | Expected access level may differ
                </p>
              </div>
            </div>
          }
        >
          {children}
        </PermissionGate>
      </main>

      {/* Footer - Permission-aware */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2025 Klararety Healthcare Platform
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              {/* System status - Admin only */}
              <PermissionGate requiredPermission="can_access_admin">
                <span className="flex items-center space-x-2">
                  <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-600">System Healthy</span>
                </span>
              </PermissionGate>
              
              {/* Emergency access indicator */}
              <PermissionGate requiredPermission="can_emergency_access">
                <span className="text-orange-600 font-medium">
                  🚨 Emergency Access Available
                </span>
              </PermissionGate>
              
              {/* User session info */}
              <span className="text-gray-500">
                Last login: {new Date().toLocaleDateString()}
              </span>
              
              {/* Logout link */}
              <div className="mt-6">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}