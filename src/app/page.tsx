// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { Spinner } from '@/components/ui/spinner';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isInitialized && !isRedirecting) {
      setIsRedirecting(true);
      
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isInitialized, router, isRedirecting]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}