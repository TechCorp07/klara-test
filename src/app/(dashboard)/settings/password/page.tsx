// src/app/(dashboard)/settings/password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { FormInput, FormButton, FormAlert } from '@/components/auth/common';
//import { useAuth } from '@/lib/auth/use-auth';
import { authService } from '@/lib/api/services/auth.service';
import { config } from '@/lib/config';

// Validation schema for password change
const passwordChangeSchema = z.object({
  current_password: z
    .string()
    .min(1, 'Current password is required'),
  new_password: z
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
  confirm_password: z
    .string()
    .min(1, 'Please confirm your new password'),
});

// Match new password and confirm password
const passwordSchema = passwordChangeSchema.refine(
  (data) => data.new_password === data.confirm_password,
  {
    message: "Passwords don't match",
    path: ['confirm_password'],
  }
);

// Type for form values
type PasswordChangeFormValues = z.infer<typeof passwordSchema>;

/**
 * Change password page component.
 * 
 * This page allows users to change their password securely, requiring:
 * - Current password verification
 * - New password that meets security requirements
 * - Password confirmation
 */
export default function ChangePasswordPage() {
  const router = useRouter();
  //const { isLoading } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [changeComplete, setChangeComplete] = useState(false);

  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: PasswordChangeFormValues) => {
    try {
      setIsChanging(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      // Call API to change password
      const response = await authService.changePassword(
        data.current_password,
        data.new_password,
        data.confirm_password
      );
      
      // Show success message
      setSuccessMessage('Your password has been changed successfully.');
      setChangeComplete(true);
      
      // Reset form
      reset();
      
      // Redirect back to settings after a delay
      setTimeout(() => {
        router.push('/settings');
      }, 3000);
    } catch (error: any) {
      // Handle different types of errors
      if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error.message || 'Failed to change password. Please try again.');
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update your password to maintain account security
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
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
          
          {changeComplete ? (
            <div className="text-center py-8">
              <svg 
                className="mx-auto h-12 w-12 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Password Changed</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your password has been updated successfully. You will be redirected to the settings page.
              </p>
              <div className="mt-6">
                <Link 
                  href="/settings"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Settings
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormInput
                id="current_password"
                label="Current Password"
                type="password"
                error={errors.current_password}
                autoComplete="current-password"
                required
                disabled={isChanging}
                {...register('current_password')}
              />
              
              <FormInput
                id="new_password"
                label="New Password"
                type="password"
                error={errors.new_password}
                autoComplete="new-password"
                required
                disabled={isChanging}
                helperText={`Password must be at least ${config.passwordMinLength} characters${
                  config.passwordRequiresUppercase ? ', include an uppercase letter' : ''
                }${config.passwordRequiresNumber ? ', include a number' : ''}${
                  config.passwordRequiresSpecialChar ? ', include a special character' : ''
                }.`}
                {...register('new_password')}
              />
              
              <FormInput
                id="confirm_password"
                label="Confirm New Password"
                type="password"
                error={errors.confirm_password}
                autoComplete="new-password"
                required
                disabled={isChanging}
                {...register('confirm_password')}
              />
              
              <div className="pt-5 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <Link
                    href="/settings"
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </Link>
                  
                  <FormButton
                    type="submit"
                    variant="primary"
                    isLoading={isChanging}
                  >
                    Change Password
                  </FormButton>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Password Security Tips</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <ul className="list-disc pl-5 space-y-1">
              <li>Use a unique password that you don&apos;t use for other accounts</li>
              <li>Include a mix of uppercase and lowercase letters, numbers, and special characters</li>
              <li>Avoid using easily guessable information like your name or birthday</li>
              <li>Consider using a password manager to generate and store strong passwords</li>
              <li>Change your password periodically to maintain security</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Additional security options - Two-factor authentication */}
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Two-Factor Authentication</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>For additional security, enable two-factor authentication for your account.</p>
              </div>
            </div>
            <div className="mt-5 sm:mt-0 sm:ml-6">
              <Link
                href="/two-factor"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage 2FA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}