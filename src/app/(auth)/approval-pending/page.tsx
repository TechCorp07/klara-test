// src/app/(auth)/approval-pending/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormAlert, FormButton } from '@/components/auth/common';
import { useAuth } from '@/lib/auth/use-auth';
import { config } from '@/lib/config';
import { AppLogo } from '@/components/ui/AppLogo';

/**
 * Approval pending page component.
 * 
 * This page is shown to users who have registered but are awaiting administrator approval.
 * It provides information about the approval process and allows users to log out.
 */
export default function ApprovalPendingPage() {
  const { user, logout, isInitialized } = useAuth();
  const router = useRouter();
  
  // State for form actions
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Redirect users if they're not awaiting approval or not authenticated
  useEffect(() => {
    if (isInitialized) {
      // If user is not logged in, redirect to login
      if (!user) {
        router.push('/login');
        return;
      }
      
      // If user is approved, redirect to dashboard
      if (user.is_approved !== false) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isInitialized, user, router]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setErrorMessage(null);
      
      await logout();
      router.push('/login');
    } catch (error: any) {
      setErrorMessage('Failed to log out. Please try again.');
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  // Get user role for appropriate messaging
  const userRole = user?.role || '';
  
  // Define messages based on user role
  const approvalMessages = {
    provider: 'As a healthcare provider, we need to verify your credentials to ensure the security and integrity of our platform. This typically involves verifying your medical license, NPI number, and other professional information.',
    researcher: 'As a researcher, we need to verify your institutional affiliation and research credentials to ensure the security and integrity of our platform.',
    pharmco: 'As a pharmaceutical company representative, we need to verify your company credentials and regulatory information to ensure the security and integrity of our platform.',
    caregiver: 'As a caregiver, we need to verify your relationship to the patient and ensure you have appropriate authorization to access their information.',
    compliance: 'As a compliance officer, we need to verify your credentials and institutional affiliation to ensure the security and integrity of our platform.',
    default: 'We need to verify your information to ensure the security and integrity of our platform.',
  };
  
  // Get appropriate message for user role
  const approvalMessage = (approvalMessages as any)[userRole] || approvalMessages.default;
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <AppLogo size='lg' />
        </div>
        
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Account Pending Approval
          </h1>
          
          <FormAlert
            type="info"
            message="Your account registration has been received and is currently pending approval by our administrative team."
            dismissible={false}
          />
          
          {errorMessage && (
            <FormAlert
              type="error"
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
            />
          )}
          
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">What happens next?</h2>
              <p className="text-sm text-blue-800 mb-2">
                {approvalMessage}
              </p>
              <p className="text-sm text-blue-800">
                Once your information has been verified, you will receive an email notification at {user?.email} confirming that your account has been approved.
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">How long does it take?</h2>
              <p className="text-sm text-yellow-800">
                The approval process typically takes 1-3 business days. If you have not received approval within 5 business days, please contact our support team at {config.supportEmail}.
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <FormButton
              type="button"
              variant="primary"
              fullWidth
              isLoading={isLoggingOut}
              onClick={handleLogout}
            >
              Log Out
            </FormButton>
          </div>
          
          <div className="mt-4 text-center">
            <Link
              href={`mailto:${config.supportEmail}`}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Contact Support
            </Link>
          </div>
        </div>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          <span>Thank you for your patience as we verify your information.</span>
        </p>
      </div>
    </div>
  );
}