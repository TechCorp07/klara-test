// src/components/auth/RegisterForm/ProviderRegisterForm.tsx
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormInput, FormButton, FormAlert } from '../../ui/common';
import { useAuth } from '@/lib/auth/use-auth';
import { config } from '@/lib/config';

// Validation schema for provider registration
const providerRegisterSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
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
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters'),
  license_number: z
    .string()
    .min(1, 'License number is required')
    .max(50, 'License number cannot exceed 50 characters'),
  npi_number: z
    .string()
    .min(1, 'NPI number is required')
    .length(10, 'NPI number must be 10 digits')
    .regex(/^\d+$/, 'NPI number must contain only digits'),
  specialty: z
    .string()
    .min(1, 'Specialty is required'),
  practice_name: z
    .string()
    .min(1, 'Practice name is required'),
  practice_address: z
    .string()
    .min(1, 'Practice address is required'),
  phone_number: z
    .string()
    .min(10, 'Please enter a valid phone number')
    .max(15, 'Please enter a valid phone number')
    .regex(/^[0-9+\-\s()]*$/, 'Please enter a valid phone number'),
  terms_accepted: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
  hipaa_consent: z
    .boolean()
    .refine((val) => val === true, 'You must acknowledge the HIPAA Notice of Privacy Practices'),
  accepting_new_patients: z
    .boolean()
    .optional(),
});

// Match passwords
const providerSchema = providerRegisterSchema.refine(
  (data) => data.password === data.password_confirm,
  {
    message: "Passwords don't match",
    path: ['password_confirm'],
  }
);

// Type for form values
type ProviderRegisterFormValues = z.infer<typeof providerSchema>;

// Define specialties for the dropdown
const specialties = [
  { value: '', label: 'Select a specialty' },
  { value: 'RARE_DISEASE', label: 'Rare Disease' },
  { value: 'GENETICS', label: 'Genetics' },
  { value: 'NEUROLOGY', label: 'Neurology' },
  { value: 'ONCOLOGY', label: 'Oncology' },
  { value: 'CARDIOLOGY', label: 'Cardiology' },
  { value: 'ENDOCRINOLOGY', label: 'Endocrinology' },
  { value: 'IMMUNOLOGY', label: 'Immunology' },
  { value: 'PEDIATRICS', label: 'Pediatrics' },
  { value: 'INTERNAL_MEDICINE', label: 'Internal Medicine' },
  { value: 'FAMILY_MEDICINE', label: 'Family Medicine' },
  { value: 'OTHER', label: 'Other' },
];

/**
 * Provider-specific registration form with validation.
 * 
 * This component handles the complete registration flow for healthcare providers, including:
 * - Email, password, and personal information validation
 * - Professional credential validation
 * - Error handling
 * - Terms and privacy policy acceptance
 * - HIPAA consent
 */
const ProviderRegisterForm: React.FC = () => {
  // Get auth context for registration function
  const { register: registerUser } = useAuth();
  const router = useRouter();

  // Form state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProviderRegisterFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      license_number: '',
      npi_number: '',
      specialty: '',
      practice_name: '',
      practice_address: '',
      phone_number: '',
      terms_accepted: false,
      hipaa_consent: false,
      accepting_new_patients: true,
    },
  });

  // Handle form submission
  const onSubmit = async (data: ProviderRegisterFormValues) => {
    try {
      // Clear previous messages
      setErrorMessage(null);
      setSuccessMessage(null);

      // Submit registration request
      await registerUser({
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
        first_name: data.first_name,
        last_name: data.last_name,
        role: 'provider',
        license_number: data.license_number,
        npi_number: data.npi_number,
        specialty: data.specialty,
        practice_name: data.practice_name,
        practice_address: data.practice_address,
        phone_number: data.phone_number,
        terms_accepted: data.terms_accepted,
        hipaa_privacy_acknowledged: data.hipaa_consent, // Map hipaa_consent to hipaa_privacy_acknowledged
      });

      // Show success message and mark registration as complete
      setSuccessMessage('Registration successful! Your account will be reviewed by our administrative team. You will receive an email once your account has been approved.');
      setRegistrationComplete(true);

      setTimeout(() => {
        router.push('/approval-pending');
      }, 10000);// wait for 10 seconds and redirect to approval-pending
    } catch (error: unknown) {
      // Initialize error message
      let errorMsg = 'An unexpected error occurred. Please try again later.';
      
      // Define error type interface
      interface ApiError {
        response?: {
          data?: {
            detail?: string;
            field_errors?: Record<string, string[]>;
            error?: {
              message?: string;
              details?: Record<string, string[]>;
            };
            message?: string;
            email?: string[] | string;
            license_number?: string[] | string;
            npi_number?: string[] | string;
            specialty?: string[] | string;
            practice_name?: string[] | string;
            practice_address?: string[] | string;
            non_field_errors?: string[] | string;
            [key: string]: unknown;
          };
        };
        message?: string;
      }
      
      // Type guard for error objects
      if (error && typeof error === 'object') {
        const err = error as ApiError;
        
        // Handle Axios errors with response
        if (err.response?.data) {
          const responseData = err.response.data;
          
          // Format 1: field_errors (Django REST Framework style)
          if (responseData.field_errors && typeof responseData.field_errors === 'object') {
            const fieldErrors = responseData.field_errors;
            
            // Handle email errors
            if (fieldErrors.email) {
              const emailError = Array.isArray(fieldErrors.email) ? fieldErrors.email[0] : fieldErrors.email;
              if (emailError.toLowerCase().includes('already exists') || emailError.toLowerCase().includes('already taken')) {
                errorMsg = 'An account with this email already exists. If you have previously registered, your account may be pending approval. Please check your email or contact support.';
              } else {
                errorMsg = emailError;
              }
            }
            // Handle NPI number errors (uniqueness critical for providers)
            else if (fieldErrors.npi_number) {
              const npiError = Array.isArray(fieldErrors.npi_number) ? fieldErrors.npi_number[0] : fieldErrors.npi_number;
              if (npiError.toLowerCase().includes('already exists') || npiError.toLowerCase().includes('already taken') || npiError.toLowerCase().includes('unique')) {
                errorMsg = 'This NPI number is already registered with another provider account. Each NPI number can only be used once. Please verify your NPI number or contact support if you believe this is an error.';
              } else if (npiError.toLowerCase().includes('invalid') || npiError.toLowerCase().includes('format')) {
                errorMsg = 'Invalid NPI number format. NPI numbers must be exactly 10 digits. Please check your entry and try again.';
              } else {
                errorMsg = npiError;
              }
            }
            // Handle medical license number errors (uniqueness critical for providers)
            else if (fieldErrors.license_number) {
              const licenseError = Array.isArray(fieldErrors.license_number) ? fieldErrors.license_number[0] : fieldErrors.license_number;
              if (licenseError.toLowerCase().includes('already exists') || licenseError.toLowerCase().includes('already taken') || licenseError.toLowerCase().includes('unique')) {
                errorMsg = 'This medical license number is already registered with another provider account. Each license number can only be used once. Please verify your license number or contact support if you believe this is an error.';
              } else if (licenseError.toLowerCase().includes('invalid') || licenseError.toLowerCase().includes('format')) {
                errorMsg = 'Invalid medical license number format. Please check your license number and try again.';
              } else {
                errorMsg = licenseError;
              }
            }
            // Handle specialty errors
            else if (fieldErrors.specialty) {
              const specialtyError = Array.isArray(fieldErrors.specialty) ? fieldErrors.specialty[0] : fieldErrors.specialty;
              errorMsg = specialtyError;
            }
            // Handle practice name errors
            else if (fieldErrors.practice_name) {
              const practiceNameError = Array.isArray(fieldErrors.practice_name) ? fieldErrors.practice_name[0] : fieldErrors.practice_name;
              errorMsg = practiceNameError;
            }
            // Handle practice address errors
            else if (fieldErrors.practice_address) {
              const practiceAddressError = Array.isArray(fieldErrors.practice_address) ? fieldErrors.practice_address[0] : fieldErrors.practice_address;
              errorMsg = practiceAddressError;
            }
            // Handle other field errors
            else {
              const firstField = Object.keys(fieldErrors)[0];
              const firstError = fieldErrors[firstField];
              errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
            }
          }
          
          // Format 2: Simple detail message
          else if (responseData.detail) {
            errorMsg = responseData.detail;
          }
          
          // Format 3: Nested error object
          else if (responseData.error) {
            if (responseData.error.message) {
              errorMsg = responseData.error.message;
            } else if (responseData.error.details) {
              const details = responseData.error.details;
              const firstError = Object.values(details)[0];
              errorMsg = Array.isArray(firstError) ? firstError[0] : String(firstError);
            }
          }
          
          // Format 4: Direct error fields (some APIs return errors directly)
          else if (responseData.email) {
            const emailError = Array.isArray(responseData.email) ? responseData.email[0] : responseData.email;
            if (emailError.toLowerCase().includes('already exists')) {
              errorMsg = 'An account with this email already exists. If you have previously registered, your account may be pending approval. Please check your email or contact support.';
            } else {
              errorMsg = emailError;
            }
          }
          else if (responseData.npi_number) {
            const npiError = Array.isArray(responseData.npi_number) ? responseData.npi_number[0] : responseData.npi_number;
            if (npiError.toLowerCase().includes('already exists') || npiError.toLowerCase().includes('unique')) {
              errorMsg = 'This NPI number is already registered with another provider account. Each NPI number can only be used once. Please verify your NPI number or contact support if you believe this is an error.';
            } else {
              errorMsg = npiError;
            }
          }
          else if (responseData.license_number) {
            const licenseError = Array.isArray(responseData.license_number) ? responseData.license_number[0] : responseData.license_number;
            if (licenseError.toLowerCase().includes('already exists') || licenseError.toLowerCase().includes('unique')) {
              errorMsg = 'This medical license number is already registered with another provider account. Each license number can only be used once. Please verify your license number or contact support if you believe this is an error.';
            } else {
              errorMsg = licenseError;
            }
          }
          
          // Format 5: Check for any array of errors in top level
          else {
            const errorFields = Object.keys(responseData).filter(key => 
              Array.isArray(responseData[key]) && responseData[key] && (responseData[key] as unknown[]).length > 0
            );
            
            if (errorFields.length > 0) {
              const firstErrorField = errorFields[0];
              const fieldValue = responseData[firstErrorField];
              if (Array.isArray(fieldValue) && fieldValue.length > 0) {
                // Special handling for critical provider fields even in generic errors
                if (firstErrorField === 'npi_number') {
                  const npiError = String(fieldValue[0]);
                  if (npiError.toLowerCase().includes('already exists') || npiError.toLowerCase().includes('unique')) {
                    errorMsg = 'This NPI number is already registered with another provider account. Each NPI number can only be used once.';
                  } else {
                    errorMsg = npiError;
                  }
                } else if (firstErrorField === 'license_number') {
                  const licenseError = String(fieldValue[0]);
                  if (licenseError.toLowerCase().includes('already exists') || licenseError.toLowerCase().includes('unique')) {
                    errorMsg = 'This medical license number is already registered with another provider account. Each license number can only be used once.';
                  } else {
                    errorMsg = licenseError;
                  }
                } else {
                  errorMsg = String(fieldValue[0]);
                }
              }
            }
            // Format 6: Check for non_field_errors (common in Django)
            else if (responseData.non_field_errors) {
              const nonFieldErrors = responseData.non_field_errors;
              errorMsg = Array.isArray(nonFieldErrors) ? String(nonFieldErrors[0]) : String(nonFieldErrors);
            }
            // Format 7: Check for message field
            else if (responseData.message) {
              errorMsg = String(responseData.message);
            }
          }
        }
        
        // Handle network errors or errors without response
        else if (err.message) {
          // Common network errors
          if (err.message.includes('Network Error') || err.message.includes('fetch')) {
            errorMsg = 'Network error. Please check your connection and try again.';
          } else if (err.message.includes('timeout')) {
            errorMsg = 'Request timed out. Please try again.';
          } else {
            errorMsg = err.message;
          }
        }
        
        // Handle string errors
        else if (typeof error === 'string') {
          errorMsg = error;
        }
      }
      
      setErrorMessage(errorMsg);
    }
  };

  // If registration is complete, show success message and redirect info
  if (registrationComplete) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Registration Complete
        </h2>

        <FormAlert
          type="success"
          message={successMessage}
          dismissible={false}
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Your account is pending approval from our administrative team. You will receive an email notification once your account has been approved.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            You will be redirected to the approval pending page in <em>10</em> seconds...
          </p>
          <Link
            href="/approval-pending"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Proceed to Approval Pending
          </Link>
        </div>
      </div>
    );
  }

  // Main registration form
  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Healthcare Provider Registration
      </h2>

      <FormAlert
        type="info"
        message="Please fill out the form below to create your provider account. After registration, your account will need to be approved by our administrative team before you can access the platform."
        dismissible={false}
      />

      <FormAlert
        type="error"
        message={errorMessage}
        onDismiss={() => setErrorMessage(null)}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="first_name"
            label="First Name"
            error={errors.first_name}
            required
            disabled={isSubmitting}
            {...register('first_name')}
          />

          <FormInput
            id="last_name"
            label="Last Name"
            error={errors.last_name}
            required
            disabled={isSubmitting}
            {...register('last_name')}
          />
        </div>

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

        <FormInput
          id="phone_number"
          label="Phone Number"
          type="tel"
          error={errors.phone_number}
          autoComplete="tel"
          required
          disabled={isSubmitting}
          {...register('phone_number')}
        />

        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 pt-4">Professional Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="license_number"
            label="Medical License Number"
            error={errors.license_number}
            required
            disabled={isSubmitting}
            {...register('license_number')}
          />

          <FormInput
            id="npi_number"
            label="NPI Number"
            error={errors.npi_number}
            required
            disabled={isSubmitting}
            helperText="National Provider Identifier (10 digits)"
            {...register('npi_number')}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
            Specialty<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="specialty"
            className={`
              block w-full px-4 py-2 rounded-md border 
              ${errors.specialty 
                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
            `}
            disabled={isSubmitting}
            {...register('specialty')}
          >
            {specialties.map((specialty) => (
              <option key={specialty.value} value={specialty.value}>
                {specialty.label}
              </option>
            ))}
          </select>
          {errors.specialty && (
            <p className="mt-1 text-sm text-red-600">{errors.specialty.message}</p>
          )}
        </div>

        <FormInput
          id="practice_name"
          label="Practice Name"
          error={errors.practice_name}
          required
          disabled={isSubmitting}
          {...register('practice_name')}
        />

        <FormInput
          id="practice_address"
          label="Practice Address"
          error={errors.practice_address}
          required
          disabled={isSubmitting}
          {...register('practice_address')}
        />

        <div className="flex items-start mt-4">
          <div className="flex items-center h-5">
            <Controller
              name="accepting_new_patients"
              control={control}
              render={({ field }) => (
                <input
                  id="accepting_new_patients"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="accepting_new_patients" className="font-medium text-gray-700">
              I am accepting new patients
            </label>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 pt-4">Account Information</h3>

        <FormInput
          id="password"
          label="Password"
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
          label="Confirm Password"
          type="password"
          error={errors.password_confirm}
          autoComplete="new-password"
          required
          disabled={isSubmitting}
          {...register('password_confirm')}
        />

        <div className="mt-6 space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <Controller
                name="terms_accepted"
                control={control}
                render={({ field }) => (
                  <input
                    id="terms_accepted"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms_accepted" className="font-medium text-gray-700">
                I accept the{' '}
                <Link
                  href={config.termsUrl}
                  target="_blank"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href={config.privacyUrl}
                  target="_blank"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Privacy Policy
                </Link>
              </label>
              {errors.terms_accepted && (
                <p className="mt-1 text-sm text-red-600">{errors.terms_accepted.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <Controller
                name="hipaa_consent"
                control={control}
                render={({ field }) => (
                  <input
                    id="hipaa_consent"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="hipaa_consent" className="font-medium text-gray-700">
                I acknowledge that I have read and understand the{' '}
                <Link
                  href={config.hipaaNoticeUrl}
                  target="_blank"
                  className="text-blue-600 hover:text-blue-500"
                >
                  HIPAA Notice of Privacy Practices
                </Link>{' '}
                and will comply with all HIPAA regulations in my use of this platform
              </label>
              {errors.hipaa_consent && (
                <p className="mt-1 text-sm text-red-600">{errors.hipaa_consent.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <FormButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
          >
            Create Provider Account
          </FormButton>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ProviderRegisterForm;