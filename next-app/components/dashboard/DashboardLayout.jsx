"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';
import LoadingComponent from '@/components/ui/LoadingComponent';
import ErrorComponent from '@/components/ui/ErrorComponent';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * Unified dashboard layout that handles role-based access control,
 * loading states, error handling, and page structure
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Dashboard content
 * @param {string} props.title - Dashboard title
 * @param {string} props.subtitle - Dashboard subtitle (defaults to welcome message with user's name)
 * @param {Array<string>} props.allowedRoles - Roles allowed to access this dashboard
 * @param {string} props.fallbackPath - Path to redirect to if user doesn't have required role
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.error - Error object
 * @param {string} props.actionLabel - Label for action button
 * @param {string} props.actionUrl - URL for action button
 * @param {Function} props.onActionClick - Click handler for action button
 * @param {string} props.backUrl - URL for back button
 * @param {string} props.backLabel - Label for back button
 */
const DashboardLayout = ({ 
  children, 
  title,
  subtitle,
  allowedRoles = [], 
  fallbackPath = '/dashboard',
  loading = false,
  error = null,
  actionLabel,
  actionUrl,
  onActionClick,
  backUrl,
  backLabel = 'Back'
}) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Check if user has required role
  const hasRequiredRole = !allowedRoles.length || (user && allowedRoles.includes(user.role));
  
  // Handle redirect when user doesn't have required role
  useEffect(() => {
    if (!authLoading && user && !hasRequiredRole) {
      toast.error('You do not have permission to access this page');
      router.push(fallbackPath);
    }
  }, [user, authLoading, hasRequiredRole, fallbackPath, router]);
  
  // Show loading state
  if (authLoading || loading) {
    return <LoadingComponent variant="spinner" size="large" fullHeight message="Loading dashboard..." />;
  }
  
  // Show error state
  if (error) {
    return (
      <ErrorComponent 
        error={error} 
        variant="alert" 
        severity="error" 
        action={
          <button
            onClick={() => router.refresh()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Retry
          </button>
        }
      />
    );
  }
  
  // Show unauthorized state
  if (!user) {
    return null; // AuthenticatedLayout will handle redirect to login
  }
  
  // Generate default subtitle if not provided
  const defaultSubtitle = user ? `Welcome back, ${user.first_name || user.email || 'User'}!` : '';
  
  // Show dashboard content if user has required role
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          {title && <h1 className="text-3xl font-bold">{title}</h1>}
          {(subtitle || defaultSubtitle) && (
            <p className="text-gray-600">{subtitle || defaultSubtitle}</p>
          )}
        </div>
        
        <div className="flex space-x-3">
          {backUrl && (
            <Link
              href={backUrl}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {backLabel}
            </Link>
          )}
          
          {(actionLabel && (actionUrl || onActionClick)) && (
            actionUrl ? (
              <Link
                href={actionUrl}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {actionLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={onActionClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {actionLabel}
              </button>
            )
          )}
        </div>
      </div>
      
      {/* Dashboard Content */}
      {children}
    </div>
  );
};

export default DashboardLayout;