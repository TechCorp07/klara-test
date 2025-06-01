// src/components/auth/RegisterForm/ResearcherRegisterForm.tsx
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

// Validation schema for researcher registration
const researcherRegisterSchema = z.object({
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
  institution: z
    .string()
    .min(1, 'Institution is required')
    .max(100, 'Institution name cannot exceed 100 characters'),
  research_area: z
    .string()
    .min(1, 'Research area is required'),
  qualifications: z
    .string()
    .min(1, 'Qualifications are required')
    .max(500, 'Qualifications cannot exceed 500 characters'),
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
  data_usage_consent: z
    .boolean()
    .refine((val) => val === true, 'You must accept the data usage terms'),
  irb_confirmation: z
    .boolean()
    .refine((val) => val === true, 'You must confirm IRB approval for human subject research'),
});

// Match passwords
const researcherSchema = researcherRegisterSchema.refine(
  (data) => data.password === data.password_confirm,
  {
    message: "Passwords don't match",
    path: ['password_confirm'],
  }
);

// Type for form values
type ResearcherRegisterFormValues = z.infer<typeof researcherSchema>;

// Define research areas for the dropdown
const researchAreas = [
  { value: '', label: 'Select a research area' },
  { value: 'RARE_DISEASES', label: 'Rare Diseases' },
  { value: 'CLINICAL_TRIALS', label: 'Clinical Trials' },
  { value: 'GENETICS', label: 'Genetics' },
  { value: 'PHARMACOLOGY', label: 'Pharmacology' },
  { value: 'EPIDEMIOLOGY', label: 'Epidemiology' },
  { value: 'BIOSTATISTICS', label: 'Biostatistics' },
  { value: 'HEALTH_OUTCOMES', label: 'Health Outcomes' },
  { value: 'DRUG_DEVELOPMENT', label: 'Drug Development' },
  { value: 'PATIENT_REGISTRIES', label: 'Patient Registries' },
  { value: 'BIOMARKER_RESEARCH', label: 'Biomarker Research' },
  { value: 'DIGITAL_HEALTH', label: 'Digital Health' },
  { value: 'OTHER', label: 'Other' },
];

const ResearcherRegisterForm: React.FC = () => {
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
  } = useForm<ResearcherRegisterFormValues>({
    resolver: zodResolver(researcherSchema),
    defaultValues: {
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      institution: '',
      research_area: '',
      qualifications: '',
      phone_number: '',
      terms_accepted: false,
      hipaa_consent: false,
      data_usage_consent: false,
      irb_confirmation: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: ResearcherRegisterFormValues) => {
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
        role: 'researcher',
        institution: data.institution,
        research_area: data.research_area,
        qualifications: data.qualifications,
        phone_number: data.phone_number,
        terms_accepted: data.terms_accepted,
        hipaa_privacy_acknowledged: data.hipaa_consent, 
      });

      // Show success message and mark registration as complete
      setSuccessMessage('Registration successful! Your account will be reviewed by our administrative team. You will receive an email once your account has been approved.');
      setRegistrationComplete(true);

      // Redirect to login page after a delay
      setTimeout(() => {
        router.push('/login');
      }, 5000);
    } catch (error: unknown) {
      if (error && typeof error === 'object') {
        const err = error as {
          response?: {
            data?: {
              detail?: string;
              field_errors?: Record<string, string[]>;
              error?: {
                message?: string;
                details?: Record<string, string[]>;
              };
            };
          };
          message?: string;
        };
    
        if (err.response?.data?.field_errors) {
          const fieldErrors = err.response.data.field_errors;
          const firstFieldWithError = Object.keys(fieldErrors)[0];
          const firstError = fieldErrors[firstFieldWithError]?.[0];
          setErrorMessage(firstError || 'Registration failed. Please check your information.');
        } 
        else if (err.response?.data?.detail) {
          setErrorMessage(err.response.data.detail);
        } 
        else if (err.response?.data?.error) {
          const validationErrors = err.response.data.error.details;
          if (validationErrors && typeof validationErrors === 'object') {
            const firstError = Object.values(validationErrors)[0];
            setErrorMessage(Array.isArray(firstError) ? firstError[0] : String(firstError));
          } else {
            setErrorMessage(
              err.response.data.error.message || 'Registration failed. Please try again.'
            );
          }
        } 
        else if (err.message) {
          setErrorMessage(err.message);
        } 
        else {
          setErrorMessage('An unexpected error occurred. Please try again later.');
        }
      } else {
        setErrorMessage('An unknown error occurred. Please try again later.');
      }
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

  // Main registration form
  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Healthcare Researcher Registration
      </h2>

      <FormAlert
        type="info"
        message="Please fill out the form below to create your researcher account. After registration, your account will need to be approved by our administrative team before you can access the platform."
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

        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 pt-4">Research Information</h3>

        <FormInput
          id="institution"
          label="Institution or Organization"
          error={errors.institution}
          required
          disabled={isSubmitting}
          {...register('institution')}
        />

        <div className="mb-4">
          <label htmlFor="research_area" className="block text-sm font-medium text-gray-700 mb-1">
            Primary Research Area<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="research_area"
            className={`
              block w-full px-4 py-2 rounded-md border 
              ${errors.research_area 
                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
            `}
            disabled={isSubmitting}
            {...register('research_area')}
          >
            {researchAreas.map((area) => (
              <option key={area.value} value={area.value}>
                {area.label}
              </option>
            ))}
          </select>
          {errors.research_area && (
            <p className="mt-1 text-sm text-red-600">{errors.research_area.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 mb-1">
            Qualifications & Research Background<span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="qualifications"
            rows={4}
            className={`
              block w-full px-4 py-2 rounded-md border 
              ${errors.qualifications 
                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
            `}
            placeholder="Describe your research experience, qualifications, current position, and any relevant publications or credentials"
            disabled={isSubmitting}
            {...register('qualifications')}
          />
          {errors.qualifications && (
            <p className="mt-1 text-sm text-red-600">{errors.qualifications.message}</p>
          )}
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

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <Controller
                name="data_usage_consent"
                control={control}
                render={({ field }) => (
                  <input
                    id="data_usage_consent"
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
              <label htmlFor="data_usage_consent" className="font-medium text-gray-700">
                I agree to use any accessed data solely for approved research purposes and will not attempt to re-identify any de-identified information
              </label>
              {errors.data_usage_consent && (
                <p className="mt-1 text-sm text-red-600">{errors.data_usage_consent.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <Controller
                name="irb_confirmation"
                control={control}
                render={({ field }) => (
                  <input
                    id="irb_confirmation"
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
              <label htmlFor="irb_confirmation" className="font-medium text-gray-700">
                I confirm that any research conducted using this platform will have appropriate IRB approval when required for human subjects research
              </label>
              {errors.irb_confirmation && (
                <p className="mt-1 text-sm text-red-600">{errors.irb_confirmation.message}</p>
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
            Create Researcher Account
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

export default ResearcherRegisterForm;