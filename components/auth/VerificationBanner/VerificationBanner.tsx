// src/components/auth/VerificationBanner/VerificationBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';

/**
 * Email verification banner component.
 * 
 * This component displays a persistent banner at the top of the page
 * for users who have not verified their email address, reminding them
 * to complete the verification process.
 */
export default function VerificationBanner() {
  const { user, requestEmailVerification } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  
  // Check if banner should be visible based on user's email verification status
  useEffect(() => {
    if (user && user.email_verified === false) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user]);
  
  // Handle requesting a new verification email
  const handleRequestVerification = async () => {
    try {
      setIsRequesting(true);
      await requestEmailVerification();
      setRequestSent(true);
      
      // Reset the request sent status after a delay
      setTimeout(() => {
        setRequestSent(false);
      }, 30000); // 30 seconds
    } catch (error) {
      console.error('Failed to request verification email:', error);
    } finally {
      setIsRequesting(false);
    }
  };
  
  // Don't render if banner should not be visible
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-yellow-100">
              <svg 
                className="h-6 w-6 text-yellow-700" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </span>
            <p className="ml-3 font-medium text-yellow-700 truncate">
              <span className="md:hidden">Verify your email address</span>
              <span className="hidden md:inline">
                Please verify your email address to access all features.
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            {requestSent ? (
              <div className="rounded-md bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800">
                Verification email sent!
              </div>
            ) : (
              <button
                onClick={handleRequestVerification}
                disabled={isRequesting}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                {isRequesting ? 'Sending...' : 'Resend Verification Email'}
              </button>
            )}
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="-mr-1 flex p-2 rounded-md hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600"
            >
              <span className="sr-only">Dismiss</span>
              <svg 
                className="h-6 w-6 text-yellow-700" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}