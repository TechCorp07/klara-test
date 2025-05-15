// src/app/contact/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { FormInput, FormButton, FormAlert } from '@/components/auth/common';
import { config } from '@/lib/config';
import { AppLogo } from '@/components/ui/AppLogo';

// Validation schema for contact form
const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9+\-\s()]*$/.test(val), 'Please enter a valid phone number'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject cannot exceed 200 characters'),
  category: z
    .string()
    .min(1, 'Please select a category'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message cannot exceed 2000 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const contactCategories = [
  { value: '', label: 'Select a category' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'account', label: 'Account Issues' },
  { value: 'billing', label: 'Billing Questions' },
  { value: 'appointment', label: 'Appointment Support' },
  { value: 'medical', label: 'Medical Questions' },
  { value: 'privacy', label: 'Privacy/Security Concerns' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'other', label: 'Other' },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      category: '',
      message: '',
    },
  });

  const onSubmit = async (_data: ContactFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      // In a real application, you would send this to your backend API
      // For now, we'll simulate the submission
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      // TODO: Replace with actual API call
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });

      setSuccessMessage('Thank you for your message. We will respond within 1-2 business days.');
      setFormSubmitted(true);
      reset();
    } catch (error) {
      setErrorMessage('Failed to send your message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (formSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <AppLogo size="lg" />
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully</h2>
            <p className="text-gray-600 mb-6">
              Thank you for contacting us. We&apos;ll review your message and respond within 1-2 business days.
            </p>
            <div className="space-y-4">
              <FormButton
                type="button"
                variant="primary"
                onClick={() => setFormSubmitted(false)}
              >
                Send Another Message
              </FormButton>
              <div>
                <Link href="/" className="text-blue-600 hover:text-blue-800">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8">
            <AppLogo size="lg" />
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">
            We&apos;re here to help. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Email</h3>
                    <p className="text-sm text-gray-600">
                      <a href={`mailto:${config.supportEmail}`} className="text-blue-600 hover:text-blue-800">
                        {config.supportEmail}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Phone</h3>
                    <p className="text-sm text-gray-600">
                      <a href="tel:+1-555-123-4567" className="text-blue-600 hover:text-blue-800">
                        +1 (312) 555-0124
                      </a>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Monday - Friday, 9am - 5pm EST</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Address</h3>
                    <p className="text-sm text-gray-600">
                      1452 East 53rd Street<br />
                      Chicago, IL 60615, USA
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency?</h2>
                <p className="text-sm text-gray-600 mb-4">
                  For urgent medical issues, please contact emergency services immediately at 911 or go to your nearest emergency room.
                </p>
                <p className="text-sm text-gray-600">
                  <a href="tel:911" className="text-red-600 font-semibold">
                    Call 911
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Send us a message</h2>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    id="name"
                    label="Full Name"
                    error={errors.name}
                    required
                    disabled={isSubmitting}
                    {...register('name')}
                  />

                  <FormInput
                    id="email"
                    label="Email Address"
                    type="email"
                    error={errors.email}
                    required
                    disabled={isSubmitting}
                    {...register('email')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    error={errors.phone}
                    disabled={isSubmitting}
                    {...register('phone')}
                  />

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      id="category"
                      className={`
                        block w-full px-4 py-2 rounded-md border 
                        ${errors.category 
                          ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                      `}
                      disabled={isSubmitting}
                      {...register('category')}
                    >
                      {contactCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                <FormInput
                  id="subject"
                  label="Subject"
                  error={errors.subject}
                  required
                  disabled={isSubmitting}
                  {...register('subject')}
                />

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message<span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className={`
                      block w-full px-4 py-2 rounded-md border 
                      ${errors.message 
                        ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                    `}
                    disabled={isSubmitting}
                    {...register('message')}
                  ></textarea>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Privacy Notice:</strong> Please do not include any personal health information (PHI) or sensitive medical details in your message. For medical concerns, please contact your healthcare provider directly.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <FormButton
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isSubmitting}
                  >
                    Send Message
                  </FormButton>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="px-6 py-4">
                <h3 className="text-base font-medium text-gray-900">How long does it take to get a response?</h3>
                <p className="mt-2 text-sm text-gray-600">
                  We typically respond to inquiries within 1-2 business days. For urgent matters, please call our support line.
                </p>
              </div>
              <div className="px-6 py-4">
                <h3 className="text-base font-medium text-gray-900">Can I discuss my medical condition here?</h3>
                <p className="mt-2 text-sm text-gray-600">
                  For privacy and security reasons, please do not include personal health information in your message. For medical questions, please contact your healthcare provider directly through the secure messaging system in your account.
                </p>
              </div>
              <div className="px-6 py-4">
                <h3 className="text-base font-medium text-gray-900">How do I reset my password?</h3>
                <p className="mt-2 text-sm text-gray-600">
                  You can reset your password by clicking the &quot;Forgot Password&quot; link on the login page. You&apos;ll receive an email with instructions to reset your password.
                </p>
              </div>
              <div className="px-6 py-4">
                <h3 className="text-base font-medium text-gray-900">Is this form secure?</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Yes, all communications through this contact form are encrypted and securely transmitted. However, please do not include sensitive health information in your message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}