"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Link from 'next/link';
import TwoFactorAuthForm from '@/components/auth/TwoFactorAuthForm';

/**
 * Client component for two-factor page
 */
export default function TwoFactorClient() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [setupStep, setSetupStep] = useState('initial'); // initial, qrcode, verification, complete
  const { user, setup2FA, confirm2FA } = useAuth();

  // Check if user already has 2FA enabled
  useEffect(() => {
    if (user?.two_factor_enabled) {
      setIsSetupComplete(true);
      setSetupStep('complete');
    }
  }, [user]);

  const handleStartSetup = async () => {
    setIsLoading(true);
    try {
      const result = await setup2FA();
      setQrCodeUrl(result.qr_code_url);
      setSecretKey(result.secret);
      setSetupStep('qrcode');
    } catch (error) {
      console.error('2FA setup error:', error);
      toast.error('Failed to set up two-factor authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (code) => {
    setIsLoading(true);
    try {
      await confirm2FA(code);
      setIsSetupComplete(true);
      setSetupStep('complete');
      toast.success('Two-factor authentication has been enabled successfully');
    } catch (error) {
      console.error('2FA verification error:', error);
      toast.error('Failed to verify code. Please make sure you entered the correct code from your authenticator app.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSetupStep('initial');
    setQrCodeUrl('');
    setSecretKey('');
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="flex flex-col items-center">
          <Image 
            src="/images/klararety-logo.png" 
            alt="Klararety Logo" 
            width={250} 
            height={70} 
            className="auth-form-logo"
            priority
          />
          <h2 className="auth-form-title">Two-Factor Authentication</h2>
          <p className="auth-form-subtitle">
            Enhance your account security with two-factor authentication
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {setupStep === 'initial' && !isSetupComplete && (
            <div>
              <div className="bg-primary-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-primary-800 mb-2">Why use two-factor authentication?</h3>
                <p className="text-primary-700 mb-4">
                  Two-factor authentication adds an extra layer of security to your account. In addition to your password, 
                  you'll need a code from your authenticator app to sign in.
                </p>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-primary-700">Protect your healthcare data from unauthorized access</p>
                </div>
                <div className="flex items-start space-x-4 mt-2">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-primary-700">Prevent unauthorized changes to your medical records</p>
                </div>
                <div className="flex items-start space-x-4 mt-2">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-primary-700">Comply with healthcare security best practices</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">How it works</h3>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700 mb-6">
                  <li>Download Google Authenticator or another authenticator app on your mobile device</li>
                  <li>Scan the QR code that will be displayed on the next screen</li>
                  <li>Enter the 6-digit code from the authenticator app to verify setup</li>
                  <li>You'll need to enter a new code each time you sign in</li>
                </ol>

                <button
                  type="button"
                  onClick={handleStartSetup}
                  disabled={isLoading}
                  className="auth-form-button"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Setting up...
                    </span>
                  ) : (
                    'Set Up Two-Factor Authentication'
                  )}
                </button>
              </div>
            </div>
          )}

          {setupStep === 'qrcode' && (
            <TwoFactorAuthForm
              isSetup={true}
              qrCodeUrl={qrCodeUrl}
              secretKey={secretKey}
              onVerify={handleVerifyCode}
              onCancel={handleCancel}
              loading={isLoading}
            />
          )}

          {setupStep === 'complete' && (
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-green-800">Two-factor authentication is enabled</h3>
                  <div className="mt-2 text-green-700">
                    <p>Your account is now protected with two-factor authentication. You'll need to enter a verification code from your authenticator app each time you sign in.</p>
                  </div>
                  <div className="mt-4">
                    <Link href="/settings" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      Back to Settings
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
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