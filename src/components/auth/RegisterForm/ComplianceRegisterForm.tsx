// src/components/auth/RegisterForm/ComplianceRegisterForm.tsx
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

// Validation schema for compliance officer registration
const complianceRegisterSchema = z.object({
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
  compliance_certification: z
    .string()
    .min(1, 'Certification information is required'),
  regulatory_experience: z
    .string()
    .min(1, 'Regulatory experience is required'),
  organization: z
    .string()
    .min(1, 'Organization name is required'),
  phone_number: z
    .string()
    .min(10, 'Please enter a valid phone number')
    .max(15, 'Please enter a valid phone number')
    .regex(/^[0-9+\-\s()]*$/, 'Please enter a valid phone number'),
  specialization_areas: z
    .string()
    .min(1, 'Specialization areas are required'),
  job_title: z
    .string()
    .min(1, 'Job title is required'),
  terms_accepted: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
  hipaa_consent: z
    .boolean()
    .refine((val) => val === true, 'You must acknowledge the HIPAA Notice of Privacy Practices'),
  confidentiality_agreement: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the confidentiality terms'),
});

// Match passwords
const complianceSchema = complianceRegisterSchema.refine(
  (data) => data.password === data.password_confirm,
  {
    message: "Passwords don't match",
    path: ['password_confirm'],
  }
);

// Type for form values
type ComplianceRegisterFormValues = z.infer<typeof complianceSchema>;

// Define certification types
const certificationTypes = [
  { value: '', label: 'Select a certification' },
  { value: 'CHPC', label: 'Certified in Healthcare Privacy Compliance (CHPC)' },
  { value: 'CHPS', label: 'Certified in Healthcare Privacy and Security (CHPS)' },
  { value: 'HCCA', label: 'Healthcare Compliance Association Certified (HCCA)' },
  { value: 'OTHER', label: 'Other' },
];

const specializationAreas = [
  { value: '', label: 'Select primary specialization' },
  { value: 'HIPAA', label: 'HIPAA' },
  { value: 'PRIVACY', label: 'Privacy' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'AUDIT', label: 'Audit' },
  { value: 'GENERAL', label: 'General' },
];

/**
 * Compliance Officer-specific registration form with validation.
 * 
 * This component handles the complete registration flow for compliance officers, including:
 * - Email, password, and personal information validation
 * - Compliance certifications and experience
 * - Specialization areas
 * - Organization details
 * - HIPAA and confidentiality agreements
 * - Error handling and user feedback
 */
const ComplianceRegisterForm: React.FC = () => {
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
  } = useForm<ComplianceRegisterFormValues>({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      compliance_certification: '',
      regulatory_experience: '',
      organization: '',
      phone_number: '',
      specialization_areas: '',
      job_title: '',
      terms_accepted: false,
      hipaa_consent: false,
      confidentiality_agreement: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: ComplianceRegisterFormValues) => {
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
        role: 'compliance',
        compliance_certification: data.compliance_certification,
        regulatory_experience: data.regulatory_experience,
        phone_number: data.phone_number,
        terms_accepted: data.terms_accepted,
        hipaa_privacy_acknowledged: data.hipaa_consent,
        organization: data.organization,
        job_title: data.job_title,
        specialization_areas: data.specialization_areas,
      });

      // Show success message and mark registration as complete
      setSuccessMessage('Registration successful! Your account will be reviewed by our administrative team. You will receive an email once your account has been approved.');
      setRegistrationComplete(true);

      setTimeout(() => {
        router.push('/approval-pending');
      }, 10000); // wait for 10 seconds and redirect to approval-pending
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
            compliance_certification?: string[] | string;
            regulatory_experience?: string[] | string;
            organization?: string[] | string;
            specialization_areas?: string[] | string;
            job_title?: string[] | string;
            confidentiality_agreement?: string[] | string;
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
              } else if (emailError.toLowerCase().includes('corporate') || emailError.toLowerCase().includes('professional')) {
                errorMsg = 'Please use a valid corporate or professional email address for compliance officer registration.';
              } else {
                errorMsg = emailError;
              }
            }
            // Handle compliance certification errors
            else if (fieldErrors.compliance_certification) {
              const certificationError = Array.isArray(fieldErrors.compliance_certification) ? fieldErrors.compliance_certification[0] : fieldErrors.compliance_certification;
              if (certificationError.toLowerCase().includes('invalid') || certificationError.toLowerCase().includes('not recognized')) {
                errorMsg = 'Please select a valid compliance certification. If you have a certification not listed, select "Other" and provide details in your regulatory experience.';
              } else if (certificationError.toLowerCase().includes('required')) {
                errorMsg = 'Compliance certification is required for compliance officer accounts. Please select your current certification.';
              } else {
                errorMsg = certificationError;
              }
            }
            // Handle regulatory experience errors
            else if (fieldErrors.regulatory_experience) {
              const experienceError = Array.isArray(fieldErrors.regulatory_experience) ? fieldErrors.regulatory_experience[0] : fieldErrors.regulatory_experience;
              if (experienceError.toLowerCase().includes('insufficient') || experienceError.toLowerCase().includes('too short')) {
                errorMsg = 'Please provide more detailed information about your regulatory and compliance experience, including specific HIPAA knowledge and relevant work history.';
              } else if (experienceError.toLowerCase().includes('experience')) {
                errorMsg = 'Regulatory experience description is required. Please describe your background in healthcare compliance and HIPAA regulations.';
              } else {
                errorMsg = experienceError;
              }
            }
            // Handle organization errors
            else if (fieldErrors.organization) {
              const organizationError = Array.isArray(fieldErrors.organization) ? fieldErrors.organization[0] : fieldErrors.organization;
              if (organizationError.toLowerCase().includes('not recognized') || organizationError.toLowerCase().includes('invalid')) {
                errorMsg = 'Please provide the full, official name of your healthcare organization, insurance company, or consulting firm.';
              } else {
                errorMsg = organizationError;
              }
            }
            // Handle specialization areas errors
            else if (fieldErrors.specialization_areas) {
              const specializationError = Array.isArray(fieldErrors.specialization_areas) ? fieldErrors.specialization_areas[0] : fieldErrors.specialization_areas;
              if (specializationError.toLowerCase().includes('required')) {
                errorMsg = 'Please select your primary area of compliance specialization.';
              } else {
                errorMsg = specializationError;
              }
            }
            // Handle job title errors
            else if (fieldErrors.job_title) {
              const jobTitleError = Array.isArray(fieldErrors.job_title) ? fieldErrors.job_title[0] : fieldErrors.job_title;
              if (jobTitleError.toLowerCase().includes('compliance') || jobTitleError.toLowerCase().includes('officer')) {
                errorMsg = 'Please provide a valid job title that reflects your compliance responsibilities and authority.';
              } else {
                errorMsg = jobTitleError;
              }
            }
            // Handle confidentiality agreement errors
            else if (fieldErrors.confidentiality_agreement) {
              const confidentialityError = Array.isArray(fieldErrors.confidentiality_agreement) ? fieldErrors.confidentiality_agreement[0] : fieldErrors.confidentiality_agreement;
              if (confidentialityError.toLowerCase().includes('required') || confidentialityError.toLowerCase().includes('agreement')) {
                errorMsg = 'Confidentiality agreement is required for compliance officer accounts. You must agree to maintain the confidentiality of all accessed data.';
              } else {
                errorMsg = confidentialityError;
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
          else if (responseData.compliance_certification) {
            const certificationError = Array.isArray(responseData.compliance_certification) ? responseData.compliance_certification[0] : responseData.compliance_certification;
            if (certificationError.toLowerCase().includes('invalid')) {
              errorMsg = 'Please select a valid compliance certification. If you have a certification not listed, select "Other".';
            } else {
              errorMsg = certificationError;
            }
          }
          else if (responseData.regulatory_experience) {
            const experienceError = Array.isArray(responseData.regulatory_experience) ? responseData.regulatory_experience[0] : responseData.regulatory_experience;
            if (experienceError.toLowerCase().includes('insufficient')) {
              errorMsg = 'Please provide more detailed information about your regulatory and compliance experience.';
            } else {
              errorMsg = experienceError;
            }
          }
          else if (responseData.organization) {
            const organizationError = Array.isArray(responseData.organization) ? responseData.organization[0] : responseData.organization;
            if (organizationError.toLowerCase().includes('not recognized')) {
              errorMsg = 'Please provide the full, official name of your healthcare organization.';
            } else {
              errorMsg = organizationError;
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
                // Special handling for critical compliance fields even in generic errors
                if (firstErrorField === 'compliance_certification') {
                  const certificationError = String(fieldValue[0]);
                  if (certificationError.toLowerCase().includes('invalid')) {
                    errorMsg = 'Please select a valid compliance certification.';
                  } else {
                    errorMsg = certificationError;
                  }
                } else if (firstErrorField === 'regulatory_experience') {
                  const experienceError = String(fieldValue[0]);
                  if (experienceError.toLowerCase().includes('insufficient')) {
                    errorMsg = 'Please provide more detailed information about your regulatory and compliance experience.';
                  } else {
                    errorMsg = experienceError;
                  }
                } else if (firstErrorField === 'confidentiality_agreement') {
                  errorMsg = 'Confidentiality agreement is required for compliance officer accounts.';
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
        Compliance Officer Registration
      </h2>

      <FormAlert
        type="info"
        message="Please fill out the form below to create your compliance officer account. After registration, your account will need to be approved by our administrative team before you can access the platform."
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

        <FormInput
          id="organization"
          label="Organization"
          error={errors.organization}
          required
          disabled={isSubmitting}
          helperText="Healthcare facility, insurance company, or consulting firm"
          {...register('organization')}
        />

        <FormInput
          id="job_title"
          label="Job Title"
          error={errors.job_title}
          required
          disabled={isSubmitting}
          {...register('job_title')}
        />

        <div className="mb-4">
          <label htmlFor="compliance_certification" className="block text-sm font-medium text-gray-700 mb-1">
            Compliance Certification<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="compliance_certification"
            className={`
              block w-full px-4 py-2 rounded-md border 
              ${errors.compliance_certification 
                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
            `}
            disabled={isSubmitting}
            {...register('compliance_certification')}
          >
            {certificationTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.compliance_certification && (
            <p className="mt-1 text-sm text-red-600">{errors.compliance_certification.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="specialization_areas" className="block text-sm font-medium text-gray-700 mb-1">
            Primary Area of Specialization<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="specialization_areas"
            className={`
              block w-full px-4 py-2 rounded-md border 
              ${errors.specialization_areas 
                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
            `}
            disabled={isSubmitting}
            {...register('specialization_areas')}
          >
            {specializationAreas.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.specialization_areas && (
            <p className="mt-1 text-sm text-red-600">{errors.specialization_areas.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="regulatory_experience" className="block text-sm font-medium text-gray-700 mb-1">
            Regulatory Experience<span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="regulatory_experience"
            rows={4}
            className={`
              block w-full px-4 py-2 rounded-md border 
              ${errors.regulatory_experience 
                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
            `}
            placeholder="Briefly describe your experience with healthcare compliance, HIPAA regulations, and related expertise"
            disabled={isSubmitting}
            {...register('regulatory_experience')}
          />
          {errors.regulatory_experience && (
            <p className="mt-1 text-sm text-red-600">{errors.regulatory_experience.message}</p>
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
                name="confidentiality_agreement"
                control={control}
                render={({ field }) => (
                  <input
                    id="confidentiality_agreement"
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
              <label htmlFor="confidentiality_agreement" className="font-medium text-gray-700">
                I agree to maintain the confidentiality of all patient and organizational data that I access 
                through this platform and to use such data solely for compliance monitoring purposes
              </label>
              {errors.confidentiality_agreement && (
                <p className="mt-1 text-sm text-red-600">{errors.confidentiality_agreement.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Compliance Officer Role</h4>
          <p className="text-sm text-blue-700">
            As a compliance officer, you will have access to audit logs, system reports, and user activities for the purpose of
            ensuring regulatory compliance. Your account will provide specialized tools for monitoring HIPAA compliance, reviewing audit trails,
            and generating compliance reports. All compliance monitoring activities will be logged for administrative review.
          </p>
        </div>

        <div className="mt-6">
          <FormButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
          >
            Create Compliance Officer Account
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

export default ComplianceRegisterForm;