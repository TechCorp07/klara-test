// src/app/(dashboard)/settings/password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { FormInput, FormButton, FormAlert } from '@/components/ui/common';
import { ArrowLeft, Lock, Eye, EyeOff, Shield, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

// Password validation schema
const passwordChangeSchema = z.object({
  current_password: z
    .string()
    .min(1, 'Current password is required'),
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirm_password: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine(
  (data) => data.new_password === data.confirm_password,
  {
    message: "Passwords don't match",
    path: ['confirm_password'],
  }
);

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

export default function PasswordChangePage() {
  const router = useRouter();
  const [isChanging, setIsChanging] = useState(false);
  const [changeComplete, setChangeComplete] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const newPassword = watch('new_password', '');

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };

    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    if (score <= 2) return { level: 'weak', color: 'red', text: 'Weak' };
    if (score <= 3) return { level: 'fair', color: 'yellow', text: 'Fair' };
    if (score <= 4) return { level: 'good', color: 'blue', text: 'Good' };
    return { level: 'strong', color: 'green', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const onSubmit = async (data: PasswordChangeFormValues) => {
    try {
      setIsChanging(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        current_password: data.current_password,
        new_password: data.new_password,
      });

      setSuccessMessage('Your password has been changed successfully.');
      setChangeComplete(true);
      reset();
      
      // Redirect back to settings after a delay
      setTimeout(() => {
        router.push('/settings?tab=security');
      }, 3000);
    } catch (error: unknown) {
        console.error('Password change error:', error);

    // Handle the error properly
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { 
        response?: { 
          status?: number; 
          data?: { 
            error?: string; 
            detail?: string; 
            message?: string; 
          }; 
        } 
      };
      
      if (axiosError.response?.data?.error) {
        setErrorMessage(axiosError.response.data.error);
      } else if (axiosError.response?.data?.detail) {
        setErrorMessage(axiosError.response.data.detail);
      } else if (axiosError.response?.data?.message) {
        setErrorMessage(axiosError.response.data.message);
      } else {
        setErrorMessage('Failed to change password. Please try again.');
      }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <Link
            href="/settings?tab=security"
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update your password to keep your account secure
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Alerts */}
        {(errorMessage || successMessage) && (
          <div className="mb-6">
            <FormAlert
              type={errorMessage ? 'error' : 'success'}
              message={errorMessage || successMessage || ''}
            />
          </div>
        )}

        {/* Password Change Form */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Current Password */}
              <div>
                <div className="relative">
                  <FormInput
                    label="Current Password"
                    id="current_password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    icon={<Lock className="w-4 h-4" />}
                    required
                    {...register('current_password')}
                    error={errors.current_password}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 pt-6 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <div className="relative">
                  <FormInput
                    id="new_password"
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    icon={<Lock className="w-4 h-4" />}
                    required
                    {...register('new_password')}
                    error={errors.new_password}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 pt-6 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 bg-${passwordStrength.color}-500`}
                            style={{
                              width: `${(Object.values({
                                length: newPassword.length >= 8,
                                uppercase: /[A-Z]/.test(newPassword),
                                lowercase: /[a-z]/.test(newPassword),
                                number: /[0-9]/.test(newPassword),
                                special: /[^a-zA-Z0-9]/.test(newPassword),
                              }).filter(Boolean).length / 5) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                      <span className={`text-sm font-medium text-${passwordStrength.color}-600`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <FormInput
                    id="confirm_password"
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    icon={<Lock className="w-4 h-4" />}
                    required
                    {...register('confirm_password')}
                    error={errors.confirm_password}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 pt-6 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Password Requirements</h4>
                <div className="space-y-2">
                  {[
                    { check: newPassword.length >= 8, text: 'At least 8 characters' },
                    { check: /[A-Z]/.test(newPassword), text: 'One uppercase letter' },
                    { check: /[a-z]/.test(newPassword), text: 'One lowercase letter' },
                    { check: /[0-9]/.test(newPassword), text: 'One number' },
                    { check: /[^a-zA-Z0-9]/.test(newPassword), text: 'One special character' },
                  ].map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          requirement.check ? 'text-green-500' : 'text-gray-300'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          requirement.check ? 'text-green-700' : 'text-gray-500'
                        }`}
                      >
                        {requirement.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Link
                  href="/settings?tab=security"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <FormButton
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  Change Password
                </FormButton>
              </div>
            </form>
          </div>
        </div>

        {/* Security Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Password Security Tips
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use a unique password that you don't use for other accounts</li>
                  <li>Consider using a password manager to generate and store strong passwords</li>
                  <li>Never share your password with anyone</li>
                  <li>Change your password if you suspect it has been compromised</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}