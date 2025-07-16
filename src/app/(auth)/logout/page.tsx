// src/app/(auth)/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Logout page component - Fixed endpoint calls
 * 
 * This page handles the /logout route and performs proper logout
 * by calling the correct API endpoints.
 */
export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('🚪 Logout page accessed, performing logout...');
        
        // Call the correct logout API endpoint
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log('✅ Logout API called successfully');
        } else {
          console.warn('⚠️ Logout API returned non-success status, but continuing');
        }
        
      } catch (error) {
        console.error('❌ Logout API error:', error);
        // Continue with redirect even if API fails
      } finally {
        // Always redirect to login regardless of API success/failure
        console.log('🔄 Redirecting to login page...');
        
        // Use replace to prevent back button issues
        router.replace('/login');
      }
    };

    // Small delay to ensure the component is mounted
    const timeoutId = setTimeout(performLogout, 100);
    
    return () => clearTimeout(timeoutId);
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-pulse mb-4">
          <div className="h-4 w-4 bg-blue-500 rounded-full mx-auto"></div>
        </div>
        <p className="text-gray-600">Signing out...</p>
        <p className="text-sm text-gray-400 mt-2">
          Please wait while we securely log you out.
        </p>
      </div>
    </div>
  );
}