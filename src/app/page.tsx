// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { user, isAuthenticated, isInitialized, getUserRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🏠 Home page redirect logic:', { 
      isAuthenticated, 
      isInitialized, 
      hasUser: !!user, 
      userRole: user?.role 
    });
  
    if (isInitialized) {
      if (isAuthenticated && user) {
        const userRole = getUserRole();
        console.log(`✅ User authenticated as ${userRole}, redirecting to role-specific dashboard`);
        
        // Redirect to role-specific dashboard
        switch (userRole) {
          case 'patient':
            router.push('/dashboard/patient');
            break;
          case 'provider':
            router.push('/dashboard/provider');
            break;
          case 'admin':
            router.push('/dashboard/admin');
            break;
          case 'pharmco':
            router.push('/dashboard/pharmco');
            break;
          case 'researcher':
            router.push('/dashboard/researcher');
            break;
          case 'caregiver':
            router.push('/dashboard/caregiver');
            break;
          case 'compliance':
            router.push('/dashboard/compliance');
            break;
          default:
            // Fallback to generic dashboard for unknown roles
            console.warn(`❓ Unknown role ${userRole}, using generic dashboard`);
            router.push('/dashboard');
            break;
        }
      } else {
        console.log('❌ User not authenticated, redirecting to login');
        router.push('/login');
      }
    } else {
      console.log('⏳ Auth not initialized yet, waiting...');
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