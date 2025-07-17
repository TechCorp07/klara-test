// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { user, isAuthenticated, isInitialized } = useAuth();
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
        console.log(`✅ User authenticated as ${user.role}, redirecting to dashboard`);
        router.push('/dashboard');
      } else {
        console.log('❌ User not authenticated, redirecting to login');
        router.push('/login');
      }
    } else {
      console.log('⏳ Auth not initialized yet, waiting...');
    }
  }, [isInitialized, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {!isInitialized ? 'Initializing...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}