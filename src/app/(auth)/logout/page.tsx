// src/app/auth/logout/page.tsx - Simple redirect to correct logout endpoint
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthLogoutRedirect() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Always redirect to login regardless of success/failure
        router.replace('/login');
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-4 w-4 bg-blue-500 rounded-full mx-auto mb-4"></div>
        </div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
}
