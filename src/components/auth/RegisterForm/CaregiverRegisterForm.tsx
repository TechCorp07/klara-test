// src/components/auth/RegisterForm/CaregiverRegisterForm.tsx
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

// Validation schema for caregiver registration
const caregiverRegisterSchema = z.object({
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
  relationship_to_patient: z
    .string()
    .min(1, 'Relationship to patient is required'),
  caregiver_type: z
    .string()
    .min(1, 'Caregiver type is required'),
  patient_email: z
    .string()
    .email('Please enter a valid patient email address')
    .min(1, 'Patient email is required'),
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
  patient_authorization: z
    .boolean()
    .refine((val) => val === true, 'You must confirm that you have patient authorization'),
});

// Match passwords
const caregiverSchema = caregiverRegisterSchema.refine(
  (data) => data.password === data.password_confirm,
  {
    message: "Passwords don't match",
    path: ['password_confirm'],
  }
);

// Type for form values
type CaregiverRegisterFormValues = z.infer<typeof caregiverSchema>;


const relationshipOptions = [
  { value: '', label: 'Select relationship' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'SPOUSE', label: 'Spouse' },
  { value: 'CHILD', label: 'Child' },
  { value: 'SIBLING', label: 'Sibling' },
  { value: 'GRANDPARENT', label: 'Grandparent' },
  { value: 'GRANDCHILD', label: 'Grandchild' },
  { value: 'FRIEND', label: 'Friend' },
  { value: 'PROFESSIONAL_CAREGIVER', label: 'Professional Caregiver' },
  { value: 'LEGAL_GUARDIAN', label: 'Legal Guardian' },
  { value: 'HEALTHCARE_PROXY', label: 'Healthcare Proxy' },
  { value: 'OTHER_FAMILY', label: 'Other Family' },
  { value: 'OTHER', label: 'Other' },
];

const caregiverTypeOptions = [
  { value: '', label: 'Select caregiver type' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'FRIEND', label: 'Friend' },
  { value: 'LEGAL_GUARDIAN', label: 'Legal Guardian' },
  { value: 'HEALTHCARE_PROXY', label: 'Healthcare Proxy' },
  { value: 'OTHER', label: 'Other' },
];


const CaregiverRegisterForm: React.FC = () => {
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
  } = useForm<CaregiverRegisterFormValues>({
    resolver: zodResolver(caregiverSchema),
    defaultValues: {
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      relationship_to_patient: '',
      caregiver_type: '',
      patient_email: '',
      phone_number: '',
      terms_accepted: false,
      hipaa_consent: false,
      patient_authorization: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: CaregiverRegisterFormValues) => {
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
        role: 'caregiver',
        relationship_to_patient: data.relationship_to_patient,
        caregiver_type: data.caregiver_type,
        patient_email: data.patient_email,
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
        Caregiver Registration
      </h2>

      <FormAlert
        type="info"
        message="Please fill out the form below to create your caregiver account. After registration, your account will need to be approved by our administrative team before you can access the platform."
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

        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 pt-4">Patient Relationship Information</h3>

        <div className="mb-4">
          <label htmlFor="relationship_to_patient" className="block text-sm font-medium text-gray-700 mb-1">
            Relationship to Patient<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="relationship_to_patient"
            className={`
              block w-full px-4 py-2 rounded-md border 
              ${errors.relationship_to_patient 
                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
            `}
            disabled={isSubmitting}
            {...register('relationship_to_patient')}
          >
            {relationshipOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.relationship_to_patient && (
            <p className="mt-1 text-sm text-red-600">{errors.relationship_to_patient.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="caregiver_type" className="block text-sm font-medium text-gray-700 mb-1">
            Caregiver Type<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="caregiver_type"
            className={`
              block w-full px-4 py-2 rounded-md border 
              ${errors.caregiver_type 
                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
            `}
            disabled={isSubmitting}
            {...register('caregiver_type')}
          >
            {caregiverTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.caregiver_type && (
            <p className="mt-1 text-sm text-red-600">{errors.caregiver_type.message}</p>
          )}
        </div>

        <FormInput
          id="patient_email"
          label="Patient's Email Address"
          type="email"
          error={errors.patient_email}
          required
          disabled={isSubmitting}
          helperText="Enter the email address of the patient you are caring for"
          {...register('patient_email')}
        />

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
                and will comply with all regulations
              </label>
              {errors.hipaa_consent && (
                <p className="mt-1 text-sm text-red-600">{errors.hipaa_consent.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <Controller
                name="patient_authorization"
                control={control}
                render={({ field }) => (
                  <input
                    id="patient_authorization"
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
              <label htmlFor="patient_authorization" className="font-medium text-gray-700">
                I confirm that I have authorization from the patient to access their healthcare information
                and that I will provide documentation if requested
              </label>
              {errors.patient_authorization && (
                <p className="mt-1 text-sm text-red-600">{errors.patient_authorization.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">Important Notice</h4>
          <p className="text-sm text-yellow-700">
            As a caregiver, you will be granted access to sensitive health information. You are legally obligated to maintain the
            confidentiality of this information and use it only for patient care purposes. Unauthorized disclosure or misuse
            of patient information may result in termination of access and potential legal consequences.
          </p>
        </div>

        <div className="mt-6">
          <FormButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
          >
            Create Caregiver Account
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

export default CaregiverRegisterForm;