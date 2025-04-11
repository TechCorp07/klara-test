"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * Reusable dashboard layout component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Dashboard content
 * @param {Array<string>} props.allowedRoles - Roles allowed to access this dashboard
 * @param {string} props.fallbackPath - Path to redirect to if user doesn't have required role
 * @param {Boolean} props.loading - Loading state
 * @param {Object} props.error - Error object
 */
const DashboardLayout = ({ 
  children, 
  allowedRoles = [], 
  fallbackPath = '/dashboard',
  loading = false,
  error = null
}) => {
  const { user, loading: authLoading } = useAuth();
  
  // Check if user has required role
  const hasRequiredRole = !allowedRoles.length || (user && allowedRoles.includes(user.role));
  
  // Handle redirect when user doesn't have required role
  useEffect(() => {
    if (!authLoading && user && !hasRequiredRole) {
      window.location.href = fallbackPath;
    }
  }, [user, authLoading, hasRequiredRole, fallbackPath]);
  
  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error.message || 'An error occurred while loading the dashboard.'}
              </p>
              {error.details && (
                <p className="mt-1 text-xs text-red-600">{error.details}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show unauthorized state
  if (!user) {
    return null; // AuthenticatedLayout will handle redirect to login
  }
  
  // Show dashboard content if user has required role
  return (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  );
};

export default DashboardLayout;
