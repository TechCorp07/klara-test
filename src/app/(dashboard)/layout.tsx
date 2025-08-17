// src/app/(dashboard)/layout.tsx
'use client';

import React, { ReactNode, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';
import { getImageUrl } from '@/lib/utils/image';

interface DashboardLayoutProps {
  children: ReactNode;
}

// Define navigation item interface
interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon?: string;
  permission?: string;
  show: boolean;
}

// Define quick action interface
interface QuickAction {
  id: string;
  name: string;
  description: string;
  href: string;
  icon?: string;
  permission?: string;
  priority: 'high' | 'medium' | 'low';
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading, isAuthenticated, user, hasPermission, getUserRole, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get user role and check permissions
  const userRole = getUserRole();
  const canViewDashboard = isAuthenticated && user && userRole;

  // Generate navigation based on user role and permissions
  const getNavigation = (): NavigationItem[] => {
    const navigation: NavigationItem[] = [];

    // Common navigation items
    navigation.push({
      id: 'dashboard',
      name: 'Dashboard',
      href: `/${userRole}`,
      icon: 'home',
      show: true
    });

    // Role-specific navigation
    if (userRole === 'admin') {
      navigation.push(
        {
          id: 'user-management',
          name: 'User Management',
          href: '/admin/users',
          icon: 'users',
          permission: 'can_manage_users',
          show: hasPermission('can_manage_users')
        },
        {
          id: 'approvals',
          name: 'Approvals',
          href: '/admin/approvals',
          icon: 'check-circle',
          permission: 'can_manage_users',
          show: hasPermission('can_manage_users')
        },
        {
          id: 'audit-logs',
          name: 'Audit Logs',
          href: '/admin/audit-logs',
          icon: 'file-text',
          permission: 'can_access_audit_logs',
          show: hasPermission('can_access_audit_logs')
        }
      );
    }

    if (userRole === 'patient') {
      navigation.push(
        {
          id: 'health-records',
          name: 'Health Records',
          href: '/patient/healthrecords',
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
          href: '/patient?tab=health',
          icon: 'pill',
          show: true
        }
      );
    }

    if (userRole === 'provider') {
      navigation.push(
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

    return navigation.filter(item => item.show);
  };

  // Generate quick actions based on user role
  const getQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = [];

    if (userRole === 'admin') {
      actions.push(
        {
          id: 'approve-users',
          name: 'Quick Approvals',
          description: 'Review pending user registrations',
          href: '/admin/approvals',
          icon: 'user-check',
          permission: 'can_manage_users',
          priority: 'high'
        },
        {
          id: 'system-health',
          name: 'System Health',
          description: 'Monitor system performance',
          href: '/admin/monitoring',
          icon: 'activity',
          permission: 'can_access_admin',
          priority: 'medium'
        }
      );
    }

    if (userRole === 'patient') {
      actions.push(
        {
          id: 'book-appointment',
          name: 'Book Appointment',
          description: 'Schedule a visit with your provider',
          href: '/patient/appointments/schedule',
          icon: 'calendar-plus',
          priority: 'high'
        },
        {
          id: 'log-medication',
          name: 'Log Medication',
          description: 'Record medication taken',
          href: '/patient?tab=health',
          icon: 'pill',
          priority: 'medium'
        },
        {
          id: "view_health_records",
          name: "Health Records",
          description: "View complete medical history",
          icon: "file-medical",
          href: "/patient/healthrecords",
          priority: "medium"
        }
      );
    }

    if (userRole === 'provider') {
      actions.push(
        {
          id: 'patient-records',
          name: 'Patient Records',
          description: 'Access patient medical records',
          href: '/provider/patients',
          icon: 'file-medical',
          permission: 'can_access_patient_data',
          priority: 'high'
        },
        {
          id: 'emergency-access',
          name: 'Emergency Access',
          description: 'Request emergency patient access',
          href: '/provider/emergency-access',
          icon: 'alert-triangle',
          permission: 'can_emergency_access',
          priority: 'high'
        }
      );
    }

    return actions.filter((action: QuickAction) => {
      if (action.permission) {
        return hasPermission(action.permission);
      }
      return true;
    });
  };

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

  if (!canViewDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Dashboard Access</h1>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to access any dashboard features.
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
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navigation = getNavigation();
  const quickActions = getQuickActions();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Klararety Healthcare
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item: NavigationItem) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className="text-gray-900 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                {/* Profile Avatar and User Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {user?.profile_image ? (
                      <img
                        src={getImageUrl(user.profile_image) || ''}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`flex items-center justify-center w-full h-full text-gray-400 ${user?.profile_image ? 'hidden' : ''}`}>
                      👤
                    </div>
                  </div>
                  <span className="text-sm text-gray-700">
                    {user?.first_name || user?.username} ({userRole})
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Quick Actions Bar (if any) */}
      {quickActions.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-800">Quick Actions:</span>
                {quickActions.slice(0, 3).map((action: QuickAction) => (
                  <a
                    key={action.id}
                    href={action.href}
                    className="text-blue-700 hover:text-blue-900 text-sm font-medium hover:underline"
                  >
                    {action.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}