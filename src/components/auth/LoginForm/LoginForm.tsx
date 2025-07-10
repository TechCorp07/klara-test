// src/components/auth/LoginForm/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, FormButton, FormAlert } from '../../ui/common';
import { useAuth } from '@/lib/auth/use-auth';
import { config } from '@/lib/config';

// Email and password validation schema
const loginSchema = z.object({
  username: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

// Type for the form values
type LoginFormValues = z.infer<typeof loginSchema>;


const LoginForm = () => {
  // Get the auth context
  const { login, verifyTwoFactor } = useAuth();

  // Get the router and search params
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the return URL from the query string (if any)
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  // State to track two-factor authentication flow
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [temporaryUserId, setTemporaryUserId] = useState<number | null>(null); // CRITICAL FIX: Store numeric user ID
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // State for form error and success messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize form validation with react-hook-form and zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Clear any previous error/success messages
      setErrorMessage(null);
      setSuccessMessage(null);
  
      // Submit login request - FIXED: Pass credentials as single object
      const response = await login({
        username: data.username,
        password: data.password
      });
  
      if (response.requires_2fa) {
        setTemporaryUserId(response.user.id);
        setRequiresTwoFactor(true);
        setSuccessMessage('Please enter the verification code from your authenticator app.');
      } else {
        // Successful login without 2FA - redirect to the return URL
        setSuccessMessage('Login successful! Redirecting...');
        
        // Short delay for the success message to be visible
        setTimeout(() => {
          router.push(returnUrl);
        }, 500);
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object') {
        const err = error as {
          response?: {
            data?: {
              detail?: string;
              field_errors?: Record<string, string[]>;
              non_field_errors?: string[];
            };
          };
          message?: string;
        };
  
        // Handle specific error messages from the backend
        if (err.response?.data?.detail) {
          setErrorMessage(err.response.data.detail);
        } else if (err.response?.data?.non_field_errors) {
          setErrorMessage(err.response.data.non_field_errors.join(', '));
        } else if (err.response?.data?.field_errors) {
          // Handle field-specific errors
          const fieldErrors = Object.values(err.response.data.field_errors).flat();
          setErrorMessage(fieldErrors.join(', '));
        } else if (err.message) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('An error occurred during login. Please try again.');
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!temporaryUserId) {
      setErrorMessage('Session error. Please try logging in again.');
      setRequiresTwoFactor(false);
      return;
    }
    
    try {
      // Clear any previous error/success messages
      setErrorMessage(null);
      setSuccessMessage(null);

      await verifyTwoFactor(temporaryUserId.toString(), twoFactorCode);
      
      // Successful 2FA verification - redirect to the return URL
      setSuccessMessage('Verification successful! Redirecting...');
      
      // Short delay for the success message to be visible
      setTimeout(() => {
        router.push(returnUrl);
      }, 500);
    } catch (error: unknown) {
      // Handle 2FA verification errors
      if (error && typeof error === 'object') {
        const err = error as {
          response?: {
            data?: {
              detail?: string;
              error?: { message?: string };
            };
          };
          message?: string;
        };
    
        if (err.response?.data?.detail) {
          setErrorMessage(err.response.data.detail);
        } else if (err.response?.data?.error) {
          setErrorMessage(
            err.response.data.error.message || 'Verification failed. Please try again.'
          );
        } else if (err.message) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('An unexpected error occurred during verification. Please try again.');
        }
      } else {
        setErrorMessage('An unknown error occurred during verification. Please try again.');
      }
    }    
  };

  // If in two-factor authentication flow, render the 2FA form
  if (requiresTwoFactor) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Two-Factor Authentication
        </h2>

        <FormAlert
          type="info"
          message="For your security, we need to verify your identity. Please enter the verification code from your authenticator app."
          dismissible={false}
        />

        <FormAlert
          type="success"
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />

        <FormAlert
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />

        <form onSubmit={handleTwoFactorSubmit} className="mt-4">
          <div className="mb-4">
            <label
              htmlFor="twoFactorCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Verification Code
            </label>
            <input
              id="twoFactorCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              aria-describedby="twoFactorCodeHelp"
            />
            <p id="twoFactorCodeHelp" className="mt-1 text-sm text-gray-500">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <div className="mt-6">
            <FormButton
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
            >
              Verify Code
            </FormButton>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setRequiresTwoFactor(false);
              setTemporaryUserId(null);
              setTwoFactorCode('');
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Otherwise, render the main login form
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Login to {config.appName}
      </h2>

      <FormAlert
        type="success"
        message={successMessage}
        onDismiss={() => setSuccessMessage(null)}
      />

      <FormAlert
        type="error"
        message={errorMessage}
        onDismiss={() => setErrorMessage(null)}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          id="username"
          label="Email Address"
          type="email"
          error={errors.username}
          autoComplete="email"
          required
          disabled={isSubmitting}
          {...register('username')}
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          error={errors.password}
          autoComplete="current-password"
          required
          disabled={isSubmitting}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <FormButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
          >
            Sign in
          </FormButton>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        <p>
          By signing in, you agree to our{' '}
          <Link href={config.termsUrl} className="text-blue-600 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href={config.privacyUrl} className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
        <p className="mt-1">
          This platform complies with{' '}
          <Link href={config.hipaaNoticeUrl} className="text-blue-600 hover:underline">
            HIPAA
          </Link>{' '}
          regulations
        </p>
      </div>
    </div>
  );
};

export default LoginForm;