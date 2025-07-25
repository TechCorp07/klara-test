// src/app/(auth)/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        
        // Use the auth context logout method which handles everything
        await logout();
        
      } catch (error) {
        console.error('❌ Logout error:', error);
        // Even if logout fails, redirect to login
        router.replace('/login');
      }
    };

    // Small delay to ensure the component is mounted
    const timeoutId = setTimeout(performLogout, 100);
    
    return () => clearTimeout(timeoutId);
  }, [logout, router]);

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