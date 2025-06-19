// src/components/auth/RegisterForm/PatientRegisterForm.tsx
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormInput, FormButton, FormAlert } from '../common';
import { useAuth } from '@/lib/auth/use-auth';
import { config } from '@/lib/config';

// UPDATED validation schema to match backend exactly
const patientRegisterSchema = z.object({
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
  // CRITICAL FIX: Changed to match backend expectation
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
  date_of_birth: z
    .string()
    .refine((dob) => {
      const date = new Date(dob);
      return !isNaN(date.getTime());
    }, 'Please enter a valid date of birth')
    .refine((dob) => {
      const date = new Date(dob);
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
      return date <= eighteenYearsAgo;
    }, 'You must be at least 18 years old to register'),
  phone_number: z
    .string()
    .min(10, 'Please enter a valid phone number')
    .max(15, 'Please enter a valid phone number')
    .regex(/^[0-9+\-\s()]*$/, 'Please enter a valid phone number'),
  terms_accepted: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),

  hipaa_privacy_acknowledged: z
    .boolean()
    .refine((val) => val === true, 'You must acknowledge the HIPAA Notice of Privacy Practices'),
});

// Match passwords validation
const patientSchema = patientRegisterSchema.refine(
  (data) => data.password === data.password_confirm,
  {
    message: "Passwords don't match",
    path: ['password_confirm'],
  }
);

type PatientRegisterFormValues = z.infer<typeof patientSchema>;

const PatientRegisterForm: React.FC = () => {
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PatientRegisterFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      date_of_birth: '',
      phone_number: '',
      terms_accepted: false,
      hipaa_privacy_acknowledged: false,
    },
  });

const onSubmit = async (data: PatientRegisterFormValues) => {
  try {
    setErrorMessage(null);
    setSuccessMessage(null);

    await registerUser({
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm, 
      first_name: data.first_name,
      last_name: data.last_name,
      role: 'patient',
      date_of_birth: data.date_of_birth,
      phone_number: data.phone_number,
      terms_accepted: data.terms_accepted,
      hipaa_privacy_acknowledged: data.hipaa_privacy_acknowledged,
    });

    setSuccessMessage('Registration successful! Your account will be reviewed by our administrative team. You will receive an email notification once your account has been approved.');
    setRegistrationComplete(true);

    setTimeout(() => {
      router.push('/approval-pending');
    }, 10000);
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
          
          // Handle email already exists specifically
          if (fieldErrors.email) {
            const emailError = Array.isArray(fieldErrors.email) ? fieldErrors.email[0] : fieldErrors.email;
            if (emailError.toLowerCase().includes('already exists') || emailError.toLowerCase().includes('already taken')) {
              errorMsg = 'An account with this email already exists. If you have previously registered, your account may be pending approval. Please check your email or contact support.';
            } else {
              errorMsg = emailError;
            }
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
        
        // Format 5: Check for any array of errors in top level
        else {
          const errorFields = Object.keys(responseData).filter(key => 
            Array.isArray(responseData[key]) && responseData[key] && (responseData[key] as unknown[]).length > 0
          );
          
          if (errorFields.length > 0) {
            const firstErrorField = errorFields[0];
            const fieldValue = responseData[firstErrorField];
            if (Array.isArray(fieldValue) && fieldValue.length > 0) {
              errorMsg = String(fieldValue[0]);
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

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Patient Registration
      </h2>

      <FormAlert
        type="info"
        message="Please fill out the form below to create your patient account. After registration, your account will need to be approved by our administrative team before you can access the platform."
        dismissible={false}
      />

      <FormAlert
        type="error"
        message={errorMessage}
        onDismiss={() => setErrorMessage(null)}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="date_of_birth"
            label="Date of Birth"
            type="date"
            error={errors.date_of_birth}
            required
            disabled={isSubmitting}
            {...register('date_of_birth')}
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
        </div>

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
            config.passwordRequiresSpecialChar ? ', and include a special character' : ''
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
                name="hipaa_privacy_acknowledged"
                control={control}
                render={({ field }) => (
                  <input
                    id="hipaa_privacy_acknowledged"
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
              <label htmlFor="hipaa_privacy_acknowledged" className="font-medium text-gray-700">
                I acknowledge that I have read and understand the{' '}
                <Link
                  href={config.hipaaNoticeUrl}
                  target="_blank"
                  className="text-blue-600 hover:text-blue-500"
                >
                  HIPAA Notice of Privacy Practices
                </Link>
              </label>
              {errors.hipaa_privacy_acknowledged && (
                <p className="mt-1 text-sm text-red-600">{errors.hipaa_privacy_acknowledged.message}</p>
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
            Create Account
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

export default PatientRegisterForm;