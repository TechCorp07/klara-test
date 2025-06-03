// src/app/page.tsx - IMPROVED VERSION
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { Spinner } from '@/components/ui/spinner';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // CRITICAL IMPROVEMENT: Only redirect after auth is fully initialized
    if (!isInitialized) {
      console.log('⏳ Auth not initialized yet, waiting...');
      return;
    }

    // IMPROVEMENT: Prevent multiple redirects
    if (isRedirecting) {
      console.log('🔄 Already redirecting, skipping...');
      return;
    }

    console.log('🏠 Home page deciding redirect:', {
      isAuthenticated,
      isInitialized,
      user: user ? { id: user.id, email: user.email, role: user.role } : null
    });

    // IMPROVEMENT: Add a small delay to prevent race conditions
    const redirectTimer = setTimeout(() => {
      setIsRedirecting(true);
      
      if (isAuthenticated && user) {
        console.log('✅ User is authenticated, redirecting to dashboard');
        router.replace('/dashboard'); // Use replace instead of push
      } else {
        console.log('❌ User not authenticated, redirecting to login');
        router.replace('/login'); // Use replace instead of push
      }
    }, 100); // Small delay to prevent race conditions

    // Cleanup function to prevent redirect if component unmounts
    return () => {
      clearTimeout(redirectTimer);
    };
  }, [isAuthenticated, isInitialized, router, isRedirecting, user]);

  // IMPROVEMENT: Better loading state with more specific messaging
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">
          {!isInitialized 
            ? 'Initializing...' 
            : isRedirecting 
              ? 'Redirecting...' 
              : 'Loading...'}
        </p>
      </div>
    </div>
  );
}