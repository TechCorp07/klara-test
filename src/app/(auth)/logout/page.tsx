// src/app/auth/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This page handles the /logout route that was causing 404 errors.
 * It immediately calls the logout API and redirects to login.
 */
export default function AuthLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('🚪 /logout route accessed, performing logout...');
        
        // Call the logout API endpoint
        await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('✅ Logout API called successfully');
      } catch (error) {
        console.error('❌ Logout API error:', error);
      } finally {
        // Always redirect to login regardless of API success/failure
        console.log('🔄 Redirecting to login page...');
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
        <p className="text-sm text-gray-400 mt-2">Please wait while we securely log you out.</p>
      </div>
    </div>
  );
}