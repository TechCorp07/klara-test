// src/app/(dashboard)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth';
import { FormInput, FormButton, FormAlert } from '@/components/ui/common';
import { Spinner } from '@/components/ui/spinner';
import { authService } from '@/lib/api/services/auth.service';
import { User, UserRole } from '@/types/auth.types';

// Validation schema for basic profile information
const profileSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  phone_number: z
    .string()
    .min(10, 'Please enter a valid phone number')
    .max(15, 'Please enter a valid phone number')
    .regex(/^[0-9+\-\s()]*$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

// Type for form values
type ProfileFormValues = z.infer<typeof profileSchema>;

/**
 * Profile page component with integrated verification features.
 * 
 * This page allows users to:
 * - View and update their profile information
 * - Verify their email address
 * - Verify their phone number with OTP
 * - Manage security settings
 */
export default function ProfilePage() {
  const { user, isLoading, requestEmailVerification, verifyEmail } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<User | null>(null);

  // Email verification states
  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);
  const [emailVerificationMessage, setEmailVerificationMessage] = useState<string | null>(null);
  const [emailVerificationError, setEmailVerificationError] = useState<string | null>(null);
  const [showEmailVerificationToken, setShowEmailVerificationToken] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState('');

  // Phone verification states
  const [phoneVerificationLoading, setPhoneVerificationLoading] = useState(false);
  const [phoneVerificationMessage, setPhoneVerificationMessage] = useState<string | null>(null);
  const [phoneVerificationError, setPhoneVerificationError] = useState<string | null>(null);
  const [showPhoneOTP, setShowPhoneOTP] = useState(false);
  const [phoneOTP, setPhoneOTP] = useState('');
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
    },
  });

  // Fetch user profile data when component mounts
  useEffect(() => {
    if (user) {
      setProfileData(user);
      setIsPhoneVerified(user.phone_verified || false); // Assume backend has this field
      
      // Set form default values
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number || '',
      });
    }
  }, [user, reset]);

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      // Call API to update profile
      const updatedUser = await authService.updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number || undefined,
      });
      
      // Update local state with response data
      setProfileData(updatedUser);
      
      // Show success message
      setSuccessMessage('Your profile has been updated successfully.');
    } catch (error: unknown) {
      // Handle errors similar to existing code
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as Record<string, unknown>).response === 'object'
      ) {
        const errResponse = (error as { response?: { data?: unknown } }).response;
    
        if (
          errResponse?.data &&
          typeof errResponse.data === 'object' &&
          errResponse.data !== null
        ) {
          const data = errResponse.data as Record<string, unknown>;
    
          if (typeof data.detail === 'string') {
            setErrorMessage(data.detail);
            return;
          }
    
          const errorData = data.error as Record<string, unknown> | undefined;
          const message = errorData?.message;
          if (typeof message === 'string') {
            setErrorMessage(message);
            return;
          }
    
          setErrorMessage('Failed to update profile. Please try again.');
          return;
        }
      }
    
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle email verification request
  const handleRequestEmailVerification = async () => {
    try {
      setEmailVerificationLoading(true);
      setEmailVerificationError(null);
      setEmailVerificationMessage(null);

      const response = await requestEmailVerification();
      setEmailVerificationMessage(response.detail || 'Verification email sent! Please check your inbox.');
      setShowEmailVerificationToken(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setEmailVerificationError(error.message);
      } else {
        setEmailVerificationError('Failed to send verification email. Please try again.');
      }
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  // Handle email verification with token
  const handleVerifyEmailToken = async () => {
    if (!emailVerificationToken.trim()) {
      setEmailVerificationError('Please enter the verification token from your email.');
      return;
    }

    try {
      setEmailVerificationLoading(true);
      setEmailVerificationError(null);

      const response = await verifyEmail({
        token: emailVerificationToken,
        email: user?.email
      });

      setEmailVerificationMessage(response.detail || 'Email verified successfully!');
      setShowEmailVerificationToken(false);
      setEmailVerificationToken('');
      
      // Update user data to reflect verification
      if (profileData) {
        setProfileData({ ...profileData, email_verified: true });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setEmailVerificationError(error.message);
      } else {
        setEmailVerificationError('Invalid verification token. Please try again.');
      }
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  // Handle phone verification OTP request
  const handleRequestPhoneOTP = async () => {
    if (!profileData?.phone_number) {
      setPhoneVerificationError('Please save your phone number first.');
      return;
    }

    try {
      setPhoneVerificationLoading(true);
      setPhoneVerificationError(null);
      setPhoneVerificationMessage(null);

      // Call API to send OTP (you'll need to implement this endpoint)
      const response = await authService.requestPhoneVerification(profileData.phone_number);
      setPhoneVerificationMessage(response.detail || 'OTP sent to your phone number!');
      setShowPhoneOTP(true);
      setOtpSentAt(Date.now());
    } catch (error: unknown) {
      if (error instanceof Error) {
        setPhoneVerificationError(error.message);
      } else {
        setPhoneVerificationError('Failed to send OTP. Please try again.');
      }
    } finally {
      setPhoneVerificationLoading(false);
    }
  };

  // Handle phone verification with OTP
  const handleVerifyPhoneOTP = async () => {
    if (!phoneOTP.trim()) {
      setPhoneVerificationError('Please enter the OTP sent to your phone.');
      return;
    }

    try {
      setPhoneVerificationLoading(true);
      setPhoneVerificationError(null);

      // Call API to verify OTP (you'll need to implement this endpoint)
      const response = await authService.verifyPhoneNumber({
        phone_number: profileData?.phone_number ?? '',
        otp: phoneOTP
      });

      setPhoneVerificationMessage(response.detail || 'Phone number verified successfully!');
      setShowPhoneOTP(false);
      setPhoneOTP('');
      setIsPhoneVerified(true);
      setOtpSentAt(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setPhoneVerificationError(error.message);
      } else {
        setPhoneVerificationError('Invalid OTP. Please try again.');
      }
    } finally {
      setPhoneVerificationLoading(false);
    }
  };

  // Get countdown for OTP resend
  const getOTPCountdown = (): number => {
    if (!otpSentAt) return 0;
    const elapsed = Date.now() - otpSentAt;
    const remaining = 60000 - elapsed; // 60 seconds
    return Math.max(0, Math.ceil(remaining / 1000));
  };

  // Get role name for display
  const getRoleName = (role?: UserRole) => {
    switch (role) {
      case 'patient':
        return 'Patient';
      case 'provider':
        return 'Healthcare Provider';
      case 'researcher':
        return 'Researcher';
      case 'pharmco':
        return 'Pharmaceutical Company';
      case 'caregiver':
        return 'Caregiver';
      case 'compliance':
        return 'Compliance Officer';
      case 'admin':
        return 'Administrator';
      case 'superadmin':
        return 'Super Administrator';
      default:
        return 'User';
    }
  };

  // If loading, show spinner
  if (isLoading || !profileData) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  const otpCountdown = getOTPCountdown();

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-semibold">
              {profileData.first_name?.[0]}{profileData.last_name?.[0]}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {profileData.first_name} {profileData.last_name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {getRoleName(profileData.role)}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <FormInput
                  id="first_name"
                  label="First Name"
                  error={errors.first_name}
                  required
                  disabled={isSaving}
                  {...register('first_name')}
                />
              </div>

              <div className="sm:col-span-3">
                <FormInput
                  id="last_name"
                  label="Last Name"
                  error={errors.last_name}
                  required
                  disabled={isSaving}
                  {...register('last_name')}
                />
              </div>

              <div className="sm:col-span-4">
                <FormInput
                  id="email"
                  label="Email Address"
                  type="email"
                  error={errors.email}
                  required
                  disabled={true} // Email cannot be changed
                  {...register('email')}
                  helperText="Email address cannot be changed. Use the verification section below to verify your email."
                />
              </div>

              <div className="sm:col-span-4">
                <FormInput
                  id="phone_number"
                  label="Phone Number"
                  type="tel"
                  error={errors.phone_number}
                  disabled={isSaving}
                  {...register('phone_number')}
                  helperText="Save your phone number first, then verify it using the verification section below."
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-5">
              <div className="flex justify-end">
                <FormButton
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  disabled={!isDirty}
                >
                  Save Changes
                </FormButton>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Verification Section */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Account Verification
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Verify your email address and phone number for enhanced security
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6 space-y-8">
          {/* Email Verification Section */}
          <div className="border-b border-gray-200 pb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-medium text-gray-900">Email Verification</h4>
                <p className="mt-1 text-sm text-gray-500">
                  {profileData.email_verified 
                    ? `Your email address (${profileData.email}) is verified`
                    : `Verify your email address (${profileData.email}) to secure your account`
                  }
                </p>
              </div>
              <div className="flex items-center">
                {profileData.email_verified ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Unverified
                  </span>
                )}
              </div>
            </div>

            {!profileData.email_verified && (
              <div className="space-y-4">
                <FormAlert
                  type="success"
                  message={emailVerificationMessage}
                  onDismiss={() => setEmailVerificationMessage(null)}
                />

                <FormAlert
                  type="error"
                  message={emailVerificationError}
                  onDismiss={() => setEmailVerificationError(null)}
                />

                {!showEmailVerificationToken ? (
                  <FormButton
                    type="button"
                    variant="primary"
                    isLoading={emailVerificationLoading}
                    onClick={handleRequestEmailVerification}
                  >
                    Send Verification Email
                  </FormButton>
                ) : (
                  <div className="space-y-4">
                    <FormInput
                      id="email_verification_token"
                      label="Verification Token"
                      placeholder="Enter the token from your email"
                      value={emailVerificationToken}
                      onChange={(e) => setEmailVerificationToken(e.target.value)}
                      helperText="Check your email for the verification token"
                    />
                    <div className="flex space-x-4">
                      <FormButton
                        type="button"
                        variant="primary"
                        isLoading={emailVerificationLoading}
                        onClick={handleVerifyEmailToken}
                      >
                        Verify Email
                      </FormButton>
                      <FormButton
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowEmailVerificationToken(false);
                          setEmailVerificationToken('');
                          setEmailVerificationError(null);
                        }}
                      >
                        Cancel
                      </FormButton>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Phone Verification Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-medium text-gray-900">Phone Verification</h4>
                <p className="mt-1 text-sm text-gray-500">
                  {profileData.phone_number
                    ? isPhoneVerified 
                      ? `Your phone number (${profileData.phone_number}) is verified`
                      : `Verify your phone number (${profileData.phone_number}) using SMS OTP`
                    : 'Add a phone number to enable verification'
                  }
                </p>
              </div>
              <div className="flex items-center">
                {profileData.phone_number ? (
                  isPhoneVerified ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Unverified
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    No Phone Number
                  </span>
                )}
              </div>
            </div>

            {profileData.phone_number && !isPhoneVerified && (
              <div className="space-y-4">
                <FormAlert
                  type="success"
                  message={phoneVerificationMessage}
                  onDismiss={() => setPhoneVerificationMessage(null)}
                />

                <FormAlert
                  type="error"
                  message={phoneVerificationError}
                  onDismiss={() => setPhoneVerificationError(null)}
                />

                {!showPhoneOTP ? (
                  <FormButton
                    type="button"
                    variant="primary"
                    isLoading={phoneVerificationLoading}
                    onClick={handleRequestPhoneOTP}
                  >
                    Send SMS OTP
                  </FormButton>
                ) : (
                  <div className="space-y-4">
                    <FormInput
                      id="phone_otp"
                      label="SMS OTP"
                      placeholder="Enter the 6-digit code"
                      value={phoneOTP}
                      onChange={(e) => setPhoneOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      helperText="Enter the 6-digit code sent to your phone"
                      maxLength={6}
                    />
                    <div className="flex space-x-4 items-center">
                      <FormButton
                        type="button"
                        variant="primary"
                        isLoading={phoneVerificationLoading}
                        onClick={handleVerifyPhoneOTP}
                        disabled={phoneOTP.length !== 6}
                      >
                        Verify Phone
                      </FormButton>
                      <FormButton
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPhoneOTP(false);
                          setPhoneOTP('');
                          setPhoneVerificationError(null);
                          setOtpSentAt(null);
                        }}
                      >
                        Cancel
                      </FormButton>
                      {otpCountdown > 0 ? (
                        <span className="text-sm text-gray-500">
                          Resend in {otpCountdown}s
                        </span>
                      ) : (
                        <FormButton
                          type="button"
                          variant="outline"
                          size="sm"
                          isLoading={phoneVerificationLoading}
                          onClick={handleRequestPhoneOTP}
                        >
                          Resend OTP
                        </FormButton>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Settings Section - Keep existing code */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Security Settings
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage your account security and authentication options
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-medium text-gray-900">Password</h4>
              <p className="mt-1 text-sm text-gray-500">
                Change your password to maintain account security
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => window.location.href = '/settings/password'}
            >
              Change Password
            </button>
          </div>

          <div className="pt-5 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="mt-1 text-sm text-gray-500">
                  {profileData.two_factor_enabled
                    ? 'Two-factor authentication is currently enabled'
                    : 'Add an extra layer of security to your account'}
                </p>
              </div>
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  profileData.two_factor_enabled
                    ? 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
                onClick={() => window.location.href = '/two-factor'}
              >
                {profileData.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific information section - Keep existing code */}
      {profileData.role !== 'patient' && (
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Professional Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your role-specific details and credentials
            </p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              {profileData.role === 'provider' && (
                <>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">License Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">XX-123456</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">NPI Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">1234567890</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Specialty</dt>
                    <dd className="mt-1 text-sm text-gray-900">Family Medicine</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Practice Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">Klararety Medical Group</dd>
                  </div>
                </>
              )}

              {profileData.role === 'researcher' && (
                <>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Institution</dt>
                    <dd className="mt-1 text-sm text-gray-900">University Medical Center</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Research Area</dt>
                    <dd className="mt-1 text-sm text-gray-900">Clinical Trials</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Qualifications</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      Ph.D. in Medical Research with 10+ years of experience in clinical trials and healthcare outcomes research.
                    </dd>
                  </div>
                </>
              )}

              {profileData.role === 'pharmco' && (
                <>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">Pharma Innovations Inc.</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900">Clinical Research Manager</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Regulatory ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">REG-987654</dd>
                  </div>
                </>
              )}

              {!['provider', 'researcher', 'pharmco'].includes(profileData.role) && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">
                    Professional information is available for this role but not displayed in this view.
                    Please contact support if you need to update your professional details.
                  </p>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* HIPAA consent and privacy section for patients - Keep existing code */}
      {profileData.role === 'patient' && (
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Privacy & Consent
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your privacy preferences and data sharing consent
            </p>
          </div>

          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium text-gray-900">HIPAA Authorization</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Review your HIPAA authorization and privacy settings
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Authorization
              </button>
            </div>

            <div className="pt-5 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-medium text-gray-900">Research Data Sharing</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Control how your de-identified data can be used for research purposes
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Manage Consent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}