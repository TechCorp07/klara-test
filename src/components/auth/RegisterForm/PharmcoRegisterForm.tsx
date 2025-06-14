// src/components/auth/RegisterForm/PharmcoRegisterForm.tsx
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

// Validation schema for pharmaceutical company registration
const pharmcoRegisterSchema = z.object({
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
  company_name: z
    .string()
    .min(1, 'Company name is required')
    .max(100, 'Company name cannot exceed 100 characters'),
  company_role: z
    .string()
    .min(1, 'Your role at the company is required'),
  regulatory_id: z
    .string()
    .min(1, 'Regulatory ID is required'),
  research_focus: z
    .string()
    .min(1, 'Research focus is required'),
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
  data_handling_agreement: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the data handling principles'),
});

// Match passwords
const pharmcoSchema = pharmcoRegisterSchema.refine(
  (data) => data.password === data.password_confirm,
  {
    message: "Passwords don't match",
    path: ['password_confirm'],
  }
);

// Type for form values
type PharmcoRegisterFormValues = z.infer<typeof pharmcoSchema>;

// Define company role options
const companyRoleOptions = [
  { value: '', label: 'Select your role' },
  { value: 'RESEARCHER', label: 'Researcher' },
  { value: 'CLINICAL_AFFAIRS', label: 'Clinical Affairs' },
  { value: 'REGULATORY_AFFAIRS', label: 'Regulatory Affairs' },
  { value: 'MEDICAL_AFFAIRS', label: 'Medical Affairs' },
  { value: 'DATA_SCIENTIST', label: 'Data Scientist' },
  { value: 'COMPLIANCE_OFFICER', label: 'Compliance Officer' },
  { value: 'EXECUTIVE', label: 'Executive' },
  { value: 'OTHER', label: 'Other' },
];

// Define research focus areas
const researchFocusAreas = [
  { value: '', label: 'Select primary research focus' },
  { value: 'RARE_DISEASES', label: 'Rare Diseases' },
  { value: 'ONCOLOGY', label: 'Oncology' },
  { value: 'NEUROLOGY', label: 'Neurology' },
  { value: 'CARDIOLOGY', label: 'Cardiology' },
  { value: 'IMMUNOLOGY', label: 'Immunology' },
  { value: 'ENDOCRINOLOGY', label: 'Endocrinology' },
  { value: 'PEDIATRICS', label: 'Pediatrics' },
  { value: 'GENETICS', label: 'Genetics' },
  { value: 'DRUG_DEVELOPMENT', label: 'Drug Development' },
  { value: 'CLINICAL_TRIALS', label: 'Clinical Trials' },
  { value: 'OTHER', label: 'Other' },
];

const PharmcoRegisterForm: React.FC = () => {
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
  } = useForm<PharmcoRegisterFormValues>({
    resolver: zodResolver(pharmcoSchema),
    defaultValues: {
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      company_name: '',
      company_role: '',
      regulatory_id: '',
      research_focus: '',
      phone_number: '',
      terms_accepted: false,
      hipaa_consent: false,
      data_handling_agreement: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: PharmcoRegisterFormValues) => {
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
        role: 'pharmco',
        company_name: data.company_name,
        company_role: data.company_role,
        regulatory_id: data.regulatory_id,
        research_focus: data.research_focus,
        phone_number: data.phone_number,
        terms_accepted: data.terms_accepted,
        hipaa_privacy_acknowledged: data.hipaa_consent, // Map hipaa_consent to hipaa_privacy_acknowledged
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
        Pharmaceutical Company Registration
      </h2>

      <FormAlert
        type="info"
        message="Please fill out the form below to create your pharmaceutical company account. After registration, your account will need to be approved by our administrative team before you can access the platform."
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
          label="Corporate Email Address"
          type="email"
          error={errors.email}
          autoComplete="email"
          required
          disabled={isSubmitting}
          helperText="Please use your company email address"
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

        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 pt-4">Company Information</h3>

        <FormInput
          id="company_name"
          label="Company Name"
          error={errors.company_name}
          required
          disabled={isSubmitting}
          {...register('company_name')}
        />

        <div className="mb-4">
          <label htmlFor="company_role" className="block text-sm font-medium text-gray-700 mb-1">
            Your Role at the Company<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="company_role"
            className={`
              block w-full px-4 py-2 rounded-md border 
              ${errors.company_role 
                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
            `}
            disabled={isSubmitting}
            {...register('company_role')}
          >
            {companyRoleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.company_role && (
            <p className="mt-1 text-sm text-red-600">{errors.company_role.message}</p>
          )}
        </div>

        <FormInput
          id="regulatory_id"
          label="Regulatory ID / Company Registration Number"
          error={errors.regulatory_id}
          required
          disabled={isSubmitting}
          helperText="Enter your FDA establishment identifier, EIN, or other regulatory registration number"
          {...register('regulatory_id')}
        />

        <div className="mb-4">
          <label htmlFor="research_focus" className="block text-sm font-medium text-gray-700 mb-1">
            Primary Research Focus<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="research_focus"
            className={`
              block w-full px-4 py-2 rounded-md border 
              ${errors.research_focus 
                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
            `}
            disabled={isSubmitting}
            {...register('research_focus')}
          >
            {researchFocusAreas.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.research_focus && (
            <p className="mt-1 text-sm text-red-600">{errors.research_focus.message}</p>
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
                and will comply with all HIPAA regulations
              </label>
              {errors.hipaa_consent && (
                <p className="mt-1 text-sm text-red-600">{errors.hipaa_consent.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <Controller
                name="data_handling_agreement"
                control={control}
                render={({ field }) => (
                  <input
                    id="data_handling_agreement"
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
              <label htmlFor="data_handling_agreement" className="font-medium text-gray-700">
                I agree to handle all data in accordance with healthcare data handling principles, 
                including de-identification of PHI when accessing research data, maintaining confidentiality,
                and only using data for approved purposes
              </label>
              {errors.data_handling_agreement && (
                <p className="mt-1 text-sm text-red-600">{errors.data_handling_agreement.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">Important Notice</h4>
          <p className="text-sm text-yellow-700">
            Pharmaceutical company access is limited to approved research and clinical purposes only. All data access
            will be audited, and misuse may result in termination of access privileges and potential legal action.
            You will be required to submit additional documentation to verify your company credentials before your account is approved.
          </p>
        </div>

        <div className="mt-6">
          <FormButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
          >
            Create Pharmaceutical Company Account
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

export default PharmcoRegisterForm;