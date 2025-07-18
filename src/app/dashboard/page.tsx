// src/app/dashboard/page.tsx
'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRedirect() {
  const { user, isAuthenticated, isInitialized, getUserRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) {
      // Still initializing, wait
      return;
    }

    if (!isAuthenticated || !user) {
      // Not authenticated, redirect to login
      console.log('❌ User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    // Get user role and redirect to appropriate dashboard
    const userRole = getUserRole();
    console.log(`🎯 Redirecting ${userRole} to role-specific dashboard`);

    switch (userRole) {
      case 'patient':
        router.push('/patient');
        break;
      case 'provider':
        router.push('/provider');
        break;
      case 'admin':
        router.push('/admin');
        break;
      case 'pharmco':
        router.push('/pharmco');
        break;
      case 'researcher':
        router.push('/researcher');
        break;
      case 'caregiver':
        router.push('/caregiver');
        break;
      case 'compliance':
        router.push('/compliance');
        break;
      default:
        // Unknown role, redirect to a generic dashboard or login
        console.warn(`❓ Unknown user role: ${userRole}, redirecting to login`);
        router.push('/login');
        break;
    }
  }, [isInitialized, isAuthenticated, user, getUserRole, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {!isInitialized ? 'Initializing...' : 'Redirecting to your dashboard...'}
        </p>
        {isAuthenticated && user && (
          <p className="text-sm text-gray-500 mt-2">
            Welcome back, {user.first_name || user.email}!
          </p>
        )}
      </div>
    </div>
  );
}