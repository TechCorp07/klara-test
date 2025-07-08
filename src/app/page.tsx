// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { Spinner } from '@/components/ui/spinner';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuth();

  useEffect(() => {
    // Only proceed once auth is fully initialized
    if (!isInitialized) {
      console.log('⏳ Auth not initialized yet, waiting...');
      return;
    }

    console.log('🏠 Home page redirect logic:', {
      isAuthenticated,
      isInitialized,
      hasUser: !!user,
      userRole: user?.role
    });

    // Simple, direct redirect logic
    if (isAuthenticated && user) {
      console.log('✅ User authenticated, redirecting to dashboard');
      router.replace('/dashboard');
    } else {
      console.log('❌ User not authenticated, redirecting to login');
      router.replace('/login');
    }
  }, [isAuthenticated, isInitialized, user, router]);

  // Show simple loading state
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">
          {!isInitialized 
            ? 'Initializing...' 
            : isAuthenticated 
              ? 'Redirecting to dashboard...'
              : 'Redirecting to login...'
          }
        </p>
      </div>
    </div>
  );
}