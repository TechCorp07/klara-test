// src/app/page.tsx - FIXED to prevent continuous redirects
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { Spinner } from '@/components/ui/spinner';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuth();
  const [redirectStatus, setRedirectStatus] = useState<'waiting' | 'redirecting' | 'completed'>('waiting');
  const hasRedirectedRef = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirectedRef.current || redirectStatus === 'completed') {
      console.log('🔄 Already processed redirect, skipping...');
      return;
    }

    // Don't do anything until auth is fully initialized
    if (!isInitialized) {
      console.log('⏳ Auth not initialized yet, waiting...');
      return;
    }

    console.log('🏠 Home page evaluating redirect:', {
      isAuthenticated,
      isInitialized,
      user: user ? { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        emailVerified: user.email_verified,
        isApproved: user.is_approved 
      } : null,
      redirectStatus
    });

    // Mark that we're processing a redirect
    hasRedirectedRef.current = true;
    setRedirectStatus('redirecting');

    // 🔧 CRITICAL: Add a delay to ensure all auth checks are complete
    redirectTimeoutRef.current = setTimeout(() => {
      try {
        if (isAuthenticated && user) {
          console.log('✅ User is authenticated, redirecting to dashboard');
          router.replace('/dashboard');
        } else {
          console.log('❌ User not authenticated, redirecting to login');
          router.replace('/login');
        }
        setRedirectStatus('completed');
      } catch (error) {
        console.error('❌ Redirect error:', error);
        // Fallback - try again with login
        router.replace('/login');
        setRedirectStatus('completed');
      }
    }, 300); // Longer delay to ensure stability

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, isInitialized, router, user, redirectStatus]);

  // Show loading state while determining where to redirect
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">
          {!isInitialized 
            ? 'Initializing authentication...' 
            : redirectStatus === 'redirecting'
              ? 'Redirecting...' 
              : 'Loading...'}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-gray-400 space-y-1">
            <div>Initialized: {isInitialized.toString()}</div>
            <div>Authenticated: {isAuthenticated.toString()}</div>
            <div>Has User: {(!!user).toString()}</div>
            <div>Redirect Status: {redirectStatus}</div>
            <div>Has Redirected: {hasRedirectedRef.current.toString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}