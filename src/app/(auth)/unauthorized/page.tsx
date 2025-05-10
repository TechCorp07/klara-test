// src/app/(auth)/unauthorized/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { AppLogo } from '@/components/ui/AppLogo';

/**
 * Unauthorized access page.
 * 
 * This page is displayed when a user tries to access a resource or page 
 * they don't have permission to view. It provides information about the error
 * and offers appropriate navigation options.
 */
export default function UnauthorizedPage() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <AppLogo size='lg' />
        </div>
        
        <div className="bg-white p-6 shadow-md rounded-lg text-center">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
              <svg 
                className="h-12 w-12 text-red-600" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v4m6 0a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>
          
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Unauthorized Access
          </h1>
          
          <p className="mt-3 text-gray-600">
            You do not have permission to access this page. This could be because:
          </p>
          
          <ul className="mt-4 text-left text-gray-600 pl-6 list-disc">
            <li className="mt-1">Your account role does not have the required permissions</li>
            <li className="mt-1">You are trying to access a restricted resource</li>
            <li className="mt-1">This feature requires additional authorization</li>
          </ul>
          
          <div className="mt-8 space-y-3">
            <p className="text-sm text-gray-500">
              {user ? (
                <>
                  You are currently logged in as <span className="font-semibold">{user.email}</span> with the role <span className="font-semibold capitalize">{user.role}</span>.
                </>
              ) : (
                'You are not currently logged in.'
              )}
            </p>
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dashboard
              </Link>
              
              <Link
                href="/support"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          <span>If you believe this is an error, please contact your system administrator.</span>
        </p>
      </div>
    </div>
  );
}