// src/components/auth/ForgotPasswordForm/ForgotPasswordForm.tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { FormInput, FormButton, FormAlert } from '../common';
import { useAuth } from '@/lib/auth/use-auth';

// Validation schema for forgot password
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
});

// Type for form values
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/**
 * Forgot password form component.
 * 
 * This component handles the password reset request flow:
 * - Email validation
 * - Error handling
 * - Success feedback
 */
const ForgotPasswordForm: React.FC = () => {
  // Get auth context for password reset function
  const { requestPasswordReset } = useAuth();

  // Form state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [requestComplete, setRequestComplete] = useState(false);

  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      // Clear previous messages
      setErrorMessage(null);
      setSuccessMessage(null);

      // Submit password reset request
      const response = await requestPasswordReset(data.email);
      
      // Show success message and mark request as complete
      setSuccessMessage(response.detail || 'If your email is registered with us, you will receive a password reset link shortly.');
      setRequestComplete(true);
    } catch (error: any) {
      // For security reasons, we still show a success message even if the request fails
      // This prevents email enumeration attacks
      setSuccessMessage('If your email is registered with us, you will receive a password reset link shortly.');
      setRequestComplete(true);
      
      // Log error for debugging but don't show to user
      console.error('Error requesting password reset:', error);
    }
  };

  // If request is complete, show success message
  if (requestComplete) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Password Reset Request Sent
        </h2>

        <FormAlert
          type="success"
          message={successMessage}
          dismissible={false}
        />

        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-4">
            Please check your email for instructions on how to reset your password. If you don&apos;t receive an email within a few minutes, please check your spam folder.
          </p>
          
          <p className="text-sm text-gray-600">
            Remember to use the link in the email within 24 hours, as it will expire after that time for security reasons.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  // Main forgot password form
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Forgot Your Password?
      </h2>

      <p className="text-sm text-gray-600 mb-6">
        Enter your email address below, and we&apos;ll send you a link to reset your password.
      </p>

      <FormAlert
        type="error"
        message={errorMessage}
        onDismiss={() => setErrorMessage(null)}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          id="email"
          label="Email Address"
          type="email"
          error={errors.email}
          autoComplete="email"
          required
          disabled={isSubmitting}
          {...register('email')}
        />

        <div>
          <FormButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
          >
            Send Reset Link
          </FormButton>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remembered your password?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;