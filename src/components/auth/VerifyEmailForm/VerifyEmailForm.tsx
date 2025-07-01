// src/components/auth/VerifyEmailForm/VerifyEmailForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FormButton, FormAlert } from '../../ui/common';
import { useAuth } from '@/lib/auth/use-auth';
import { Spinner } from '@/components/ui/spinner';

interface VerifyEmailFormProps {
  token?: string;
  email?: string;
}

interface APIError {
  response?: {
    data?: {
      detail?: string;
      error?: {
        message?: string;
      };
    };
  };
  message?: string;
}

/**
 * Email verification form component.
 * 
 * This component handles the email verification process:
 * - Automatically verifies email if token is provided in the URL
 * - Allows users to request a new verification email
 * - Shows appropriate success and error messages
 */
const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({ token: propToken, email: propEmail }) => {
  // Get auth context for verification functions
  const { verifyEmail, requestEmailVerification, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get token and email from props or URL params
  const token = propToken || searchParams.get('token') || '';
  const email = propEmail || searchParams.get('email') || user?.email || '';

  // State for form
  const [isVerifying, setIsVerifying] = useState(!!token);
  const [isRequesting, setIsRequesting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verificationComplete, setVerificationComplete] = useState(false);

  // Automatically verify email if token is provided
  useEffect(() => {
    if (token) {
      verifyEmailWithToken();
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to verify email with token
  const verifyEmailWithToken = async () => {
    if (!token) {
      setErrorMessage('Verification token is missing.');
      return;
    }

    try {
      setIsVerifying(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      // Submit verification request
      const response = await verifyEmail({ token, email });
      
      // Show success message
      setSuccessMessage(response.detail || 'Your email has been verified successfully!');
      setVerificationComplete(true);

      // If user is authenticated, redirect to dashboard after delay
      if (isAuthenticated) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        // If not authenticated, redirect to login after delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error: unknown) {
      const err = error as APIError;
      if (err.response?.data?.detail) {
        setErrorMessage(err.response.data.detail);
      } else if (err.response?.data?.error) {
        setErrorMessage(err.response.data.error.message || 'Email verification failed.');
      } else if (err.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred during email verification.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Function to request a new verification email
  const handleRequestVerification = async () => {
    try {
      setIsRequesting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      // Submit request for new verification email
      const response = await requestEmailVerification();
      
      // Show success message
      setSuccessMessage(response.detail || 'Verification email has been sent. Please check your inbox.');
    } catch (error: unknown) {
      const err = error as APIError;
      if (err.response?.data?.detail) {
        setErrorMessage(err.response.data.detail);
      } else if (err.response?.data?.error) {
        setErrorMessage(err.response.data.error.message || 'Failed to send verification email.');
      } else if (err.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred while requesting verification email.');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  // If verification is in progress, show spinner
  if (isVerifying) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Verifying Your Email
        </h2>
        <div className="flex justify-center mb-4">
          <Spinner size="lg" />
        </div>
        <p className="text-gray-600">
          Please wait while we verify your email address...
        </p>
      </div>
    );
  }

  // If verification is complete, show success message and redirect info
  if (verificationComplete) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Email Verified
        </h2>

        <FormAlert
          type="success"
          message={successMessage}
          dismissible={false}
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            {isAuthenticated
              ? 'You will be redirected to your dashboard in a few seconds...'
              : 'You will be redirected to the login page in a few seconds...'}
          </p>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Proceed to Login
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Main verification form for requesting new verification email
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Email Verification
      </h2>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              {token
                ? 'Invalid or expired verification token. Please request a new verification email.'
                : 'Your email address needs to be verified before you can access the system.'}
            </p>
          </div>
        </div>
      </div>

      <FormAlert
        type="error"
        message={errorMessage}
        onDismiss={() => setErrorMessage(null)}
      />

      <FormAlert
        type="success"
        message={successMessage}
        onDismiss={() => setSuccessMessage(null)}
      />

      <div className="mt-6">
        <p className="text-sm text-gray-600 mb-4">
          {user?.email
            ? `We need to verify your email address (${user.email}). If you haven't received the verification email, you can request a new one.`
            : 'We need to verify your email address. If you have not received the verification email, you can request a new one.'}
        </p>

        <FormButton
          type="button"
          variant="primary"
          fullWidth
          isLoading={isRequesting}
          onClick={handleRequestVerification}
        >
          Request Verification Email
        </FormButton>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already verified?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Return to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailForm;