// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { Spinner } from '@/components/ui/spinner';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Don't do anything until auth is fully initialized
    if (!isInitialized) {
      console.log('⏳ Auth not initialized yet, waiting...');
      return;
    }

    // Prevent multiple redirects
    if (hasRedirected) {
      console.log('🔄 Already redirected, skipping...');
      return;
    }

    console.log('🏠 Home page deciding redirect:', {
      isAuthenticated,
      isInitialized,
      user: user ? { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        emailVerified: user.email_verified,
        isApproved: user.is_approved 
      } : null
    });

    setHasRedirected(true);

    // Add a small delay to ensure all auth checks are complete
    const redirectTimer = setTimeout(() => {
      if (isAuthenticated && user) {
        console.log('✅ User is authenticated, redirecting to dashboard');
        router.replace('/dashboard');
      } else {
        console.log('❌ User not authenticated, redirecting to login');
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(redirectTimer);
  }, [isAuthenticated, isInitialized, router, user, hasRedirected]);

  // Show loading state while determining where to redirect
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">
          {!isInitialized 
            ? 'Initializing authentication...' 
            : hasRedirected 
              ? 'Redirecting...' 
              : 'Loading...'}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-gray-400">
            <div>Initialized: {isInitialized.toString()}</div>
            <div>Authenticated: {isAuthenticated.toString()}</div>
            <div>Has User: {(!!user).toString()}</div>
            <div>Has Redirected: {hasRedirected.toString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}