// src/app/(dashboard)/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { AuthGuard } from '@/lib/auth/guards/auth-guard';
import { Spinner } from '@/components/ui/spinner';
import { AppLogo } from '@/components/ui/AppLogo';
//import { config } from '@/lib/config';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Common layout for all dashboard pages.
 * 
 * This layout provides:
 * - Authentication protection via AuthGuard
 * - A responsive sidebar navigation
 * - Header with user information and logout
 * - Role-specific navigation based on the user's role
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // State for mobile navigation
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Handle sidebar toggle for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
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
  const getNavigationItems = (role?: string) => {
    // Common navigation items for all roles
    const commonItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'home' },
      { name: 'Profile', href: '/profile', icon: 'user' },
      { name: 'Settings', href: '/settings', icon: 'settings' },
      { name: 'Messages', href: '/messages', icon: 'mail' },
      { name: 'Support', href: '/contact', icon: 'life-buoy' },
    ];
    
    // Role-specific navigation items
    const roleItems: Record<string, Array<{ name: string; href: string; icon: string }>> = {
      patient: [
        { name: 'My Health Records', href: '/health-records', icon: 'file-text' },
        { name: 'Appointments', href: '/appointments', icon: 'calendar' },
        { name: 'Prescriptions', href: '/prescriptions', icon: 'clipboard' },
        { name: 'Telemedicine', href: '/telemedicine', icon: 'video' },
      ],
      provider: [
        { name: 'My Patients', href: '/patients', icon: 'users' },
        { name: 'Appointments', href: '/appointments', icon: 'calendar' },
        { name: 'Medical Records', href: '/medical-records', icon: 'file-text' },
        { name: 'Telemedicine', href: '/telemedicine', icon: 'video' },
      ],
      researcher: [
        { name: 'Research Projects', href: '/research', icon: 'layers' },
        { name: 'Data Analysis', href: '/data-analysis', icon: 'bar-chart' },
        { name: 'Clinical Trials', href: '/clinical-trials', icon: 'activity' },
      ],
      pharmco: [
        { name: 'Medications', href: '/medications', icon: 'package' },
        { name: 'Clinical Trials', href: '/clinical-trials', icon: 'activity' },
        { name: 'Market Analysis', href: '/market-analysis', icon: 'trending-up' },
      ],
      caregiver: [
        { name: 'My Patients', href: '/patients', icon: 'users' },
        { name: 'Health Records', href: '/health-records', icon: 'file-text' },
        { name: 'Appointments', href: '/appointments', icon: 'calendar' },
        { name: 'Medications', href: '/medications', icon: 'package' },
      ],
      compliance: [
        { name: 'Audit Logs', href: '/audit-logs', icon: 'shield' },
        { name: 'Compliance Reports', href: '/compliance-reports', icon: 'clipboard' },
        { name: 'User Management', href: '/users', icon: 'users' },
      ],
      admin: [
        { name: 'User Management', href: '/users', icon: 'users' },
        { name: 'Approvals', href: '/approvals', icon: 'check-square' },
        { name: 'Audit Logs', href: '/audit-logs', icon: 'shield' },
        { name: 'System Settings', href: '/system-settings', icon: 'sliders' },
      ],
      superadmin: [
        { name: 'User Management', href: '/users', icon: 'users' },
        { name: 'Approvals', href: '/approvals', icon: 'check-square' },
        { name: 'Audit Logs', href: '/audit-logs', icon: 'shield' },
        { name: 'System Settings', href: '/system-settings', icon: 'sliders' },
        { name: 'API Management', href: '/api-management', icon: 'code' },
      ],
    };
    
    // Return common items plus role-specific items
    return [
      ...commonItems,
      ...(role && roleItems[role] ? roleItems[role] : []),
    ];
  };
  
  // Get navigation items based on user role
  const navigationItems = getNavigationItems(user?.role);
  
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
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100">
        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center">
              <AppLogo size='sm' />
              <span className="ml-2 text-xl font-semibold text-gray-900">Klararety</span>
            </Link>
          </div>
          
          <nav className="mt-5 px-2 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {renderIcon(item.icon)}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top header */}
          <div className="sticky top-0 z-10 flex h-16 bg-white shadow">
            <button
              type="button"
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
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
                <h1 className="text-2xl font-semibold text-gray-900">
                  {/* Extract page title from pathname */}
                  {pathname === '/dashboard'
                    ? 'Dashboard'
                    : pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </h1>
              </div>
              
              <div className="ml-4 flex items-center md:ml-6">
                {/* Notifications */}
                <button
                  type="button"
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">View notifications</span>
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
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>
                
                {/* Profile dropdown */}
                <div className="ml-3 relative">
                  <div>
                    <button
                      type="button"
                      className="max-w-xs rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      id="user-menu"
                      aria-expanded="false"
                      aria-haspopup="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUserMenu();
                      }}
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </div>
                    </button>
                  </div>
                  
                  {/* User menu dropdown */}
                  {isUserMenuOpen && (
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Your Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
    </AuthGuard>
  );
}