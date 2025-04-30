"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Client component for consent page
 */
export default function ConsentClient() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [consentGiven, setConsentGiven] = useState(user?.data_sharing_consent || false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleConsentChange = async () => {
    setIsLoading(true);
    
    try {
      // Update user profile with consent status
      await updateProfile({ data_sharing_consent: !consentGiven });
      setConsentGiven(!consentGiven);
      setShowConfirmation(true);
      toast.success(consentGiven 
        ? 'Community access consent has been revoked' 
        : 'Community access consent has been provided');
    } catch (error) {
      console.error('Consent update error:', error);
      toast.error('Failed to update consent settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form max-w-2xl">
        <div className="flex flex-col items-center">
          <Image 
            src="/images/klararety-logo.png" 
            alt="Klararety Logo" 
            width={250} 
            height={70} 
            className="auth-form-logo"
            priority
          />
          <h2 className="auth-form-title">Community Access Consent</h2>
          <p className="auth-form-subtitle">
            Manage your consent for participating in the Klararety healthcare community
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-primary-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-primary-800 mb-2">About the Klararety Community</h3>
            <p className="text-primary-700 mb-4">
              The Klararety Community is a space where patients, healthcare providers, and pharmaceutical representatives 
              can connect, share experiences, and discuss healthcare topics in a secure and private environment.
            </p>
            
            <h4 className="text-md font-medium text-primary-800 mb-2">What you can do in the community:</h4>
            <ul className="list-disc pl-5 space-y-1 text-primary-700 mb-4">
              <li>Connect with others who share similar health experiences</li>
              <li>Participate in discussions about treatments and care approaches</li>
              <li>Access educational resources shared by healthcare professionals</li>
              <li>Provide feedback on healthcare services and medications</li>
              <li>Join support groups for specific conditions</li>
            </ul>
            
            <h4 className="text-md font-medium text-primary-800 mb-2">Your privacy is protected:</h4>
            <ul className="list-disc pl-5 space-y-1 text-primary-700">
              <li>All community interactions comply with HIPAA regulations</li>
              <li>You control what personal information is visible to others</li>
              <li>You can revoke your consent at any time</li>
              <li>Your participation will not affect your healthcare services</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="community-consent"
                  name="community-consent"
                  type="checkbox"
                  checked={consentGiven}
                  onChange={handleConsentChange}
                  disabled={isLoading}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="community-consent" className="font-medium text-gray-700">
                  I consent to participate in the Klararety Community
                </label>
                <p className="text-gray-500">
                  By checking this box, you agree to share limited profile information with other community members 
                  and participate in community discussions. You can revoke this consent at any time.
                </p>
              </div>
            </div>

            {showConfirmation && (
              <div className={`mt-4 p-4 rounded-md ${consentGiven ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {consentGiven ? (
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${consentGiven ? 'text-green-800' : 'text-yellow-800'}`}>
                      {consentGiven 
                        ? 'You have successfully joined the Klararety Community' 
                        : 'You have opted out of the Klararety Community'}
                    </h3>
                    <div className={`mt-2 text-sm ${consentGiven ? 'text-green-700' : 'text-yellow-700'}`}>
                      <p>
                        {consentGiven 
                          ? 'You can now access community features and participate in discussions.' 
                          : 'You will not be able to access community features until you provide consent.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Link 
              href="/profile" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Back to Profile
            </Link>
            
            {consentGiven && (
              <Link 
                href="/community" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Community
              </Link>
            )}
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            <Link href="/dashboard" className="auth-form-link">
              Back to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}