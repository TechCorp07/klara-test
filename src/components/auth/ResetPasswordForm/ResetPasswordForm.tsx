// src/components/auth/ResetPasswordForm/ResetPasswordForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormInput, FormButton, FormAlert } from '../../ui/common';
import { useAuth } from '@/lib/auth/use-auth';
import { config } from '@/lib/config';

// Define the props interface
interface ResetPasswordFormProps {
  token?: string;
}

// Validation schema for password reset
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(config.passwordMinLength, `Password must be at least ${config.passwordMinLength} characters`)
    .refine(
      (password) => !config.passwordRequiresUppercase || /[A-Z]/.test(password),
      'Password must contain at least one uppercase letter'
    )
    .refine(
      (password) => !config.passwordRequiresNumber || /[0-9]/.test(password),
      'Password must contain at least one number'
    )
    .refine(
      (password) => !config.passwordRequiresSpecialChar || /[^a-zA-Z0-9]/.test(password),
      'Password must contain at least one special character'
    ),
  password_confirm: z
    .string()
    .min(1, 'Please confirm your password'),
});

// Match passwords
const resetSchema = resetPasswordSchema.refine(
  (data) => data.password === data.password_confirm,
  {
    message: "Passwords don't match",
    path: ['password_confirm'],
  }
);

// Type for form values
type ResetPasswordFormValues = z.infer<typeof resetSchema>;

/**
 * Reset password form component.
 * 
 * This component handles the password reset flow:
 * - New password validation
 * - Error handling
 * - Success feedback and redirection
 */
const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  // Get auth context for password reset function
  const { resetPassword } = useAuth();
  const router = useRouter();

  // Form state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetComplete, setResetComplete] = useState(false);
  const [isValidToken, setIsValidToken] = useState(!!token);

  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      password_confirm: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setErrorMessage('Reset token is missing. Please use the link from your email.');
      return;
    }

    try {
      // Clear previous messages
      setErrorMessage(null);
      setSuccessMessage(null);

      // Submit password reset
      const response = await resetPassword({
        token,
        password: data.password,
        password_confirm: data.password_confirm,
      });
      
      // Show success message and mark reset as complete
      setSuccessMessage(response.detail || 'Your password has been reset successfully!');
      setResetComplete(true);

      // Redirect to login page after a delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: unknown) {
      if (error && typeof error === 'object') {
        const err = error as {
          response?: { data?: { detail?: string; error?: { message?: string } } };
          message?: string;
        };
    
        if (err.response?.data?.detail) {
          const detail = err.response.data.detail;
          setErrorMessage(detail);
    
          // Check if token is invalid or expired
          if (
            typeof detail === 'string' &&
            (detail.toLowerCase().includes('invalid') || detail.toLowerCase().includes('expired'))
          ) {
            setIsValidToken(false);
          }
        } else if (err.response?.data?.error) {
          setErrorMessage(
            err.response.data.error.message || 'Password reset failed. Please try again.'
          );
        } else if (err.message) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('An unexpected error occurred. Please try again later.');
        }
      } else {
        setErrorMessage('An unknown error occurred. Please try again later.');
      }
    }    
  };

  // Check if token is present
  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setErrorMessage('Reset token is missing. Please use the link from your email.');
    }
  }, [token]);

  // If token is missing or invalid, show appropriate message
  if (!isValidToken) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Invalid Reset Link
        </h2>

        <FormAlert
          type="error"
          message="The password reset link is invalid or has expired. Please request a new one."
          dismissible={false}
        />

        <div className="mt-6 text-center">
          <Link
            href="/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  // If reset is complete, show success message
  if (resetComplete) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Password Reset Complete
        </h2>

        <FormAlert
          type="success"
          message={successMessage}
          dismissible={false}
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            You will be redirected to the login page in a few seconds...
          </p>
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Reset Your Password
      </h2>

      <p className="text-sm text-gray-600 mb-6">
        Please enter your new password below.
      </p>

      <FormAlert
        type="error"
        message={errorMessage}
        onDismiss={() => setErrorMessage(null)}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          id="password"
          label="New Password"
          type="password"
          error={errors.password}
          autoComplete="new-password"
          required
          disabled={isSubmitting}
          helperText={`Password must be at least ${config.passwordMinLength} characters${
            config.passwordRequiresUppercase ? ', include an uppercase letter' : ''
          }${config.passwordRequiresNumber ? ', include a number' : ''}${
            config.passwordRequiresSpecialChar ? ', include a special character' : ''
          }.`}
          {...register('password')}
        />

        <FormInput
          id="password_confirm"
          label="Confirm New Password"
          type="password"
          error={errors.password_confirm}
          autoComplete="new-password"
          required
          disabled={isSubmitting}
          {...register('password_confirm')}
        />

        <div>
          <FormButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
          >
            Reset Password
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

export default ResetPasswordForm;