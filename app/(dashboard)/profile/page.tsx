// src/app/(dashboard)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth/use-auth';
import { FormInput, FormButton, FormAlert } from '@/components/auth/common';
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
 * Profile page component.
 * 
 * This page allows users to view and update their profile information.
 * It adapts based on user role to display role-specific information.
 */
export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<User | null>(null);

  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    reset,
    control,
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
    } catch (error: any) {
      // Handle different types of errors
      if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error.message || 'Failed to update profile. Please try again.');
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your personal information and account settings
        </p>
      </div>

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
                  helperText="Email address cannot be changed. Contact support if you need to update your email."
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

      {/* Role-specific information section */}
      {user.role !== 'patient' && (
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
              {user.role === 'provider' && (
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

              {user.role === 'researcher' && (
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

              {user.role === 'pharmco' && (
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

              {/* Default professional information display for other roles */}
              {!['provider', 'researcher', 'pharmco'].includes(user.role) && (
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

      {/* Security settings section */}
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

      {/* HIPAA consent and privacy section for patients */}
      {user.role === 'patient' && (
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