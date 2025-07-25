// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { user, isAuthenticated, isInitialized, getUserRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated && user) {
        const userRole = getUserRole();
        // Redirect to role-specific dashboard
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
            // Fallback to generic dashboard for unknown roles
            console.warn(`❓ Unknown role ${userRole}, using generic dashboard`);
            router.push('/dashboard');
            break;
        }
      } else {
        router.push('/login');
      }
    }
  }, [isInitialized, isAuthenticated, user, getUserRole, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {!isInitialized ? 'Initializing...' : 'Redirecting...'}
        </p>
        {isAuthenticated && user && (
          <p className="text-sm text-gray-500 mt-2">
            Taking you to your {getUserRole()} dashboard...
          </p>
        )}
      </div>
    </div>
  );
}