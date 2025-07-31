// src/components/auth/HipaaConsentForm/HipaaConsentForm.tsx
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormButton, FormAlert } from '../../ui/common';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';

// Validation schema for HIPAA consent
const hipaaConsentSchema = z.object({
  hipaa_acknowledgment: z
    .boolean()
    .refine((val) => val === true, 'You must acknowledge the HIPAA Notice of Privacy Practices'),
  data_sharing_consent: z
    .boolean()
    .optional(),
  research_consent: z
    .boolean()
    .optional(),
  communication_consent: z
    .boolean()
    .optional(),
  electronic_signature: z
    .string()
    .min(1, 'Please type your full name as your electronic signature'),
});

// Type for form values
type HipaaConsentFormValues = z.infer<typeof hipaaConsentSchema>;

interface HipaaConsentFormProps {
  onComplete?: () => void;
  isInitialSetup?: boolean;
}

/**
 * HIPAA consent form component.
 * 
 * This component provides a comprehensive HIPAA consent form for patients, including:
 * - Acknowledgment of the Notice of Privacy Practices
 * - Data sharing preferences
 * - Research participation consent
 * - Communication preferences
 * - Electronic signature for consent validation
 */
export default function HipaaConsentForm({ onComplete, isInitialSetup = false }: HipaaConsentFormProps) {
  const { user, updateConsent } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [consentComplete, setConsentComplete] = useState(false);
  
  // Get patient name for form
  const patientName = user ? `${user.first_name} ${user.last_name}` : 'Patient';
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<HipaaConsentFormValues>({
    resolver: zodResolver(hipaaConsentSchema),
    defaultValues: {
      hipaa_acknowledgment: false,
      data_sharing_consent: false,
      research_consent: false,
      communication_consent: true,
      electronic_signature: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: HipaaConsentFormValues) => {
    console.log('🔍 [HipaaConsentForm] Form submission started:', {
      data,
      timestamp: new Date().toISOString()
    });

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      console.log('🔍 [HipaaConsentForm] Processing consent updates...');
      
      // Call APIs to update various consent types with valid backend consent types
      console.log('🔍 [HipaaConsentForm] Updating provider_access consent...');
      await updateConsent('provider_access', data.hipaa_acknowledgment);
      console.log('✅ [HipaaConsentForm] Provider access consent updated successfully');
      
      if (data.data_sharing_consent !== undefined) {
        console.log('🔍 [HipaaConsentForm] Updating data_sharing consent...');
        await updateConsent('data_sharing', data.data_sharing_consent);
        console.log('✅ [HipaaConsentForm] Data sharing consent updated successfully');
      }
      
      if (data.research_consent !== undefined) {
        console.log('🔍 [HipaaConsentForm] Updating research consent...');
        await updateConsent('research', data.research_consent);
        console.log('✅ [HipaaConsentForm] Research consent updated successfully');
      }
      
      if (data.communication_consent !== undefined) {
        console.log('🔍 [HipaaConsentForm] Updating communication consent (mapped to provider_access)...');
        await updateConsent('provider_access', data.communication_consent);
        console.log('✅ [HipaaConsentForm] Communication consent updated successfully');
      }
      
      console.log('✅ [HipaaConsentForm] All consent updates completed successfully');
      
      // Show success message
      setSuccessMessage('Your consent preferences have been saved successfully.');
      setConsentComplete(true);
      
      // Call onComplete callback if provided
      if (onComplete) {
        console.log('🔍 [HipaaConsentForm] Calling onComplete callback');
        onComplete();
      }
    } catch (error: unknown) {
      console.error('❌ [HipaaConsentForm] Form submission failed:', error);
      
      if (error && typeof error === 'object') {
        const err = error as {
          response?: {
            data?: {
              detail?: string;
              error?: { message?: string };
            };
          };
          message?: string;
        };
    
        console.error('❌ [HipaaConsentForm] Detailed error analysis:', {
          hasResponse: !!err.response,
          responseData: err.response?.data,
          errorMessage: err.message
        });

        if (err.response?.data?.detail) {
          setErrorMessage(err.response.data.detail);
        } else if (err.response?.data?.error) {
          setErrorMessage(
            err.response.data.error.message ||
            'Failed to update consent preferences. Please try again.'
          );
        } else if (err.message) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('An unexpected error occurred. Please try again later.');
        }
      } else {
        console.error('❌ [HipaaConsentForm] Unknown error type:', typeof error);
        setErrorMessage('An unknown error occurred. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
      console.log('🔍 [HipaaConsentForm] Form submission completed, isSubmitting set to false');
    }
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                HIPAA Authorization & Consent
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Please review and acknowledge the following privacy practices and consent preferences
              </p>
            </div>
            <div className="flex-shrink-0">
              <Image 
                className="h-16 w-auto" 
                src="/images/hipaa-badge.svg"
                alt="HIPAA Compliant"
                width = {64}
                height = {64}
              />
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
          
          {consentComplete ? (
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
              <h3 className="mt-2 text-lg font-medium text-gray-900">Consent Completed</h3>
              <p className="mt-1 text-sm text-gray-500">
                Thank you for reviewing and acknowledging our privacy practices.
                Your consent preferences have been saved.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg 
                      className="h-5 w-5 text-blue-400" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-blue-700">
                      This form is used to obtain your consent for how your health information is used and disclosed.
                      Please read it carefully before signing.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Notice of Privacy Practices</h4>
                <div className="h-64 overflow-y-auto p-4 bg-gray-50 rounded text-sm text-gray-700 mb-4">
                  <p className="mb-4">
                    <strong>THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.</strong>
                  </p>
                  
                  <p className="mb-2">Klararety Healthcare Platform is committed to protecting the privacy of your medical information. We are required by law to:</p>
                  <ul className="list-disc pl-5 mb-4">
                    <li>Maintain the privacy of your Protected Health Information (PHI)</li>
                    <li>Provide you with this Notice of our legal duties and privacy practices</li>
                    <li>Follow the terms of the Notice currently in effect</li>
                  </ul>
                  
                  <p className="mb-2"><strong>How We May Use and Disclose Medical Information About You:</strong></p>
                  
                  <p className="mb-2">We may use and disclose your PHI for the following purposes without your authorization:</p>
                  
                  <p className="mb-2"><strong>For Treatment:</strong> We may use medical information about you to provide you with medical treatment or services and to coordinate your care.</p>
                  
                  <p className="mb-2"><strong>For Payment:</strong> We may use and disclose your medical information so that treatment and services you receive may be billed to and payment may be collected from you, an insurance company, or a third party.</p>
                  
                  <p className="mb-2"><strong>For Health Care Operations:</strong> We may use and disclose your medical information for healthcare operations necessary to run our platform and ensure quality care.</p>
                  
                  <p className="mb-2">Additional uses and disclosures may include:</p>
                  <ul className="list-disc pl-5 mb-4">
                    <li>Public health activities</li>
                    <li>Health oversight activities</li>
                    <li>Legal proceedings</li>
                    <li>Law enforcement purposes</li>
                    <li>Research (with appropriate protocols)</li>
                    <li>To avert a serious threat to health or safety</li>
                  </ul>
                  
                  <p className="mb-2"><strong>Your Rights Regarding Your Medical Information:</strong></p>
                  <ul className="list-disc pl-5 mb-4">
                    <li>Right to inspect and copy your medical record</li>
                    <li>Right to request an amendment to your medical record</li>
                    <li>Right to an accounting of disclosures</li>
                    <li>Right to request restrictions on certain uses and disclosures</li>
                    <li>Right to request confidential communications</li>
                    <li>Right to a paper copy of this Notice</li>
                    <li>Right to be notified of a breach of unsecured PHI</li>
                  </ul>
                  
                  <p>For the complete Notice of Privacy Practices, please contact our Privacy Officer at privacy@klararety.com or visit our website.</p>
                </div>
                
                <div className="flex items-start mt-4">
                  <div className="flex items-center h-5">
                    <Controller
                      name="hipaa_acknowledgment"
                      control={control}
                      render={({ field }) => (
                        <input
                          id="hipaa_acknowledgment"
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
                    <label htmlFor="hipaa_acknowledgment" className="font-medium text-gray-700">
                      I acknowledge that I have received, read, and understand the Notice of Privacy Practices
                    </label>
                    {errors.hipaa_acknowledgment && (
                      <p className="mt-1 text-sm text-red-600">{errors.hipaa_acknowledgment.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Data Sharing & Consent Preferences</h4>
                
                <div className="space-y-4 mt-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <Controller
                        name="data_sharing_consent"
                        control={control}
                        render={({ field }) => (
                          <input
                            id="data_sharing_consent"
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
                      <label htmlFor="data_sharing_consent" className="font-medium text-gray-700">
                        Data Sharing with Healthcare Providers
                      </label>
                      <p className="text-gray-500">
                        I authorize Klararety to share my health information with my authorized healthcare providers for treatment purposes.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <Controller
                        name="research_consent"
                        control={control}
                        render={({ field }) => (
                          <input
                            id="research_consent"
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
                      <label htmlFor="research_consent" className="font-medium text-gray-700">
                        De-identified Research Data
                      </label>
                      <p className="text-gray-500">
                        I authorize Klararety to use my de-identified health information for research purposes to improve healthcare outcomes.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <Controller
                        name="communication_consent"
                        control={control}
                        render={({ field }) => (
                          <input
                            id="communication_consent"
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
                      <label htmlFor="communication_consent" className="font-medium text-gray-700">
                        Communications Consent
                      </label>
                      <p className="text-gray-500">
                        I consent to receive appointment reminders, healthcare notifications, and other communications via email or text message.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Electronic Signature</h4>
                
                <p className="text-sm text-gray-500 mb-4">
                  By typing my full name below, I am electronically signing this consent form and acknowledge that my electronic signature is legally binding, just as if I had signed a paper document.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="electronic_signature" className="block text-sm font-medium text-gray-700">
                      Full Name (as electronic signature) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="electronic_signature"
                      type="text"
                      className={`mt-1 block w-full rounded-md ${
                        errors.electronic_signature
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder={patientName}
                      disabled={isSubmitting}
                      {...register('electronic_signature')}
                    />
                    {errors.electronic_signature && (
                      <p className="mt-1 text-sm text-red-600">{errors.electronic_signature.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">
                      Date: {currentDate}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <FormButton
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  {isInitialSetup ? 'Complete Setup' : 'Save Consent Preferences'}
                </FormButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}