// src/app/(dashboard)/_shared/layouts/BaseAuthenticatedLayout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { AuthGuard } from '@/lib/auth/guards/auth-guard';
import { Spinner } from '@/components/ui/spinner';
import { AppLogo } from '@/components/ui/AppLogo';
import { useNavigationPermissions } from '@/hooks/useNavigationPermissions';
import { useLayout, LayoutProvider } from './LayoutContext';
import NotificationCenter from '../components/NotificationCenter';

interface BaseAuthenticatedLayoutProps {
  children: React.ReactNode;
  requiredRole?: string[];
  showVerificationWarning?: boolean;
}

/**
 * Base authenticated layout component that provides common functionality
 * for all role-specific dashboards including authentication, navigation,
 * and responsive design.
 */
function BaseAuthenticatedLayoutInner({ 
  children, 
  requiredRole,
  showVerificationWarning = true 
}: BaseAuthenticatedLayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { canAccess } = useNavigationPermissions();
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    toggleSidebar, 
    theme,
    notifications,
    emergencyAlerts,
    isOnline 
  } = useLayout();
  
  // State for user menu
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Authentication and role checks
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (!user.is_approved && user.role !== 'admin') {
        router.push('/auth/pending-approval');
        return;
      }

      if (!user.email_verified) {
        router.push('/auth/verify-email');
        return;
      }

      if (requiredRole && user.role && !requiredRole.includes(user.role)) {
        router.push('/dashboard/unauthorized');
        return;
      }
    }
  }, [isLoading, user, router, requiredRole]);
  
  // Handle user menu toggle
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsUserMenuOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (!user?.role) return [];

    const items = [
      // Role-specific dashboard links
      { 
        name: 'Dashboard', 
        href: `/dashboard/${user.role}`, 
        icon: 'home', 
        show: true 
      },
      
      // Common items for all users
      { name: 'Profile', href: '/profile', icon: 'user', show: canAccess.profile },
      { name: 'Settings', href: '/settings', icon: 'settings', show: canAccess.settings },
      { name: 'Messages', href: '/messages', icon: 'mail', show: canAccess.messages },
      
      // Healthcare items
      { name: 'Health Records', href: '/health-records', icon: 'file-text', show: canAccess.healthRecords },
      { name: 'Appointments', href: '/appointments', icon: 'calendar', show: canAccess.appointments },
      { name: 'Telemedicine', href: '/telemedicine', icon: 'video', show: canAccess.telemedicine },
      { name: 'Medications', href: '/medications', icon: 'package', show: canAccess.medications },
      
      // Research items
      { name: 'Research', href: '/research', icon: 'layers', show: canAccess.research },
      { name: 'Clinical Trials', href: '/clinical-trials', icon: 'activity', show: canAccess.clinicalTrials },
      
      // Compliance items
      { name: 'Audit Logs', href: '/audit-logs', icon: 'shield', show: canAccess.auditLogs },
      { name: 'Compliance Reports', href: '/compliance-reports', icon: 'clipboard', show: canAccess.complianceReports },
      
      // Admin items
      { name: 'User Management', href: '/users', icon: 'users', show: canAccess.userManagement },
      { name: 'Approvals', href: '/approvals', icon: 'check-square', show: canAccess.approvals },
      { name: 'System Settings', href: '/system-settings', icon: 'sliders', show: canAccess.systemSettings },
    ];

    // Return only items that should be shown for this user
    return items.filter(item => item.show);
  };
  
  // Get navigation items based on user role
  const navigationItems = getNavigationItems();
  
  // Render icon based on icon name
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'user':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'settings':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'mail':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'file-text':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'clipboard':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'video':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'users':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'package':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'layers':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'activity':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'shield':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'check-square':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'sliders':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) {
      const segments = pathname.split('/');
      if (segments.length === 3) {
        // /dashboard/role format
        const role = segments[2];
        switch (role) {
          case 'patient': return 'Patient Dashboard';
          case 'provider': return 'Provider Dashboard';
          case 'researcher': return 'Researcher Dashboard';
          case 'pharmco': return 'Pharmaceutical Dashboard';
          case 'caregiver': return 'Caregiver Dashboard';
          case 'compliance': return 'Compliance Dashboard';
          case 'admin': return 'Admin Dashboard';
          default: return 'Dashboard';
        }
      }
    }
    
    return pathname === '/dashboard'
      ? 'Dashboard'
      : pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Dashboard';
  };
  
  // Check for identity verification warning (patients only)
  const shouldShowVerificationWarning = 
    showVerificationWarning && 
    user?.role === 'patient' && 
    user?.profile?.days_until_verification_required !== null &&
    user?.profile?.days_until_verification_required <= 7;
  
  // If loading, show spinner
  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Verification Warning Banner */}
        {shouldShowVerificationWarning && (
          <div className="bg-yellow-600 text-white px-4 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <p className="text-sm">
                ⚠️ Identity verification required within {user?.profile?.days_until_verification_required} days
              </p>
              <button 
                onClick={() => router.push('/dashboard/patient/verify-identity')}
                className="bg-yellow-700 hover:bg-yellow-800 px-3 py-1 rounded text-sm font-medium"
              >
                Verify Now
              </button>
            </div>
          </div>
        )}

        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-red-600 text-white px-4 py-2">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-sm">
                🔴 You are currently offline. Some features may not be available.
              </p>
            </div>
          </div>
        )}

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
            <Link href={`/dashboard/${user.role}`} className="flex items-center">
              <AppLogo size='sm' />
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">Klararety</span>
            </Link>
          </div>
          
          <nav className="mt-5 px-2 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)} // Close mobile sidebar on navigation
                >
                  <span className={`mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {renderIcon(item.icon)}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Sidebar footer with user info */}
          <div className="absolute bottom-0 w-full border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:ring-offset-gray-800"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top header */}
          <div className="sticky top-0 z-10 flex h-16 bg-white dark:bg-gray-800 shadow">
            <button
              type="button"
              className="px-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex items-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {getPageTitle()}
                </h1>
              </div>
              
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                {/* Emergency alerts (for compliance/admin) */}
                {emergencyAlerts > 0 && (user?.role === 'compliance' || user?.role === 'admin') && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm font-medium">{emergencyAlerts}</span>
                  </div>
                )}

                {/* Notifications */}
                <NotificationCenter />
                
                {/* Profile dropdown */}
                <div className="ml-3 relative">
                  <div>
                    <button
                      type="button"
                      className="max-w-xs rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:ring-offset-gray-800"
                      id="user-menu"
                      aria-expanded="false"
                      aria-haspopup="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUserMenu();
                      }}
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </div>
                    </button>
                  </div>
                  
                  {/* User menu dropdown */}
                  {isUserMenuOpen && (
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 py-1"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        role="menuitem"
                      >
                        Your Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        role="menuitem"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        role="menuitem"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Page content */}
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function BaseAuthenticatedLayout(props: BaseAuthenticatedLayoutProps) {
  return (
    <AuthGuard>
      <LayoutProvider>
        <BaseAuthenticatedLayoutInner {...props} />
      </LayoutProvider>
    </AuthGuard>
  );
}