"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingComponent from '@/components/ui/LoadingComponent';

/**
 * This page redirects to the current user's patient profile
 */
export default function PatientProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (user && user.id) {
      router.push(`/patient/profile/${user.id}`);
    }
  }, [user, router]);
  
  return <LoadingComponent />;
}