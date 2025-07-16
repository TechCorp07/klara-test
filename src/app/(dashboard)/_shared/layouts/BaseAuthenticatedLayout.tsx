// src/app/(dashboard)/_shared/layouts/BaseAuthenticatedLayout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useNavigationPermissions } from '@/hooks/useNavigationPermissions';

interface BaseAuthenticatedLayoutProps {
  children: React.ReactNode;
  requiredRole?: string[];
  showVerificationWarning?: boolean;
}

/**
 * Base authenticated layout using new JWT permission system
 */
export default function BaseAuthenticatedLayout({ 
  children, 
  requiredRole,
  showVerificationWarning = true 
}: BaseAuthenticatedLayoutProps) {
  const { user, logout, isLoading, isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { canAccess } = useNavigationPermissions();
  
  // State for user menu
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Authentication and role checks
  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      if (!user.is_approved && user.role !== 'admin') {
        router.push('/approval-pending');
        return;
      }

      if (!user.email_verified && showVerificationWarning) {
        // Could show a banner instead of redirecting
        console.warn('Email not verified for user:', user.email);
      }

      if (requiredRole && user.role && !requiredRole.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, user, router, requiredRole, showVerificationWarning]);
  
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
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // Define navigation items based on user role and permissions
  const getNavigationItems = () => {
    if (!user?.role) return [];

    const items = [
      // Role-specific dashboard links
      { 
        name: 'Dashboard', 
        href: `/${user.role}`, 
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
  
  // Show loading state
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to continue.</p>
          <Link 
            href="/login"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }
  
  // Get navigation items based on user role
  const navigationItems = getNavigationItems();
  
  // Simple navigation layout
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
              </h1>
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center text-sm rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {user.first_name?.[0] || user.username?.[0] || user.email[0].toUpperCase()}
                </div>
              </button>
              
              {isUserMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-gray-500">{user.email}</div>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {navigationItems.length > 0 && (
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Main content */}
      <main className="py-6">
        {children}
      </main>
    </div>
  );
}