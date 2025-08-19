// src/app/(dashboard)/two-factor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { FormInput, FormButton, FormAlert } from '@/components/ui/common';
import { Spinner } from '@/components/ui/spinner';
import { 
  ArrowLeft, 
  Shield, 
  Smartphone, 
  Key, 
  Copy, 
  CheckCircle2, 
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

interface TwoFactorData {
  enabled: boolean;
  qr_code?: string;
  secret_key?: string;
  backup_codes?: string[];
  recovery_codes_remaining?: number;
}

export default function TwoFactorPage() {
  const { user, refreshToken, disableTwoFactor } = useAuth();
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'status' | 'setup' | 'verify' | 'disable'>('status');
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    loadTwoFactorStatus();
  }, []);

  const loadTwoFactorStatus = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const response = await apiClient.get(ENDPOINTS.AUTH.SETUP_2FA);
      setTwoFactorData(response.data as TwoFactorData);
      
      if ((response.data as TwoFactorData).enabled) {
        setStep('status');
      }
    } catch (error) {
      console.error('Failed to load 2FA status:', error);
      setErrorMessage('Failed to load two-factor authentication status');
    } finally {
      setIsLoading(false);
    }
  };

  const startSetup = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      
      const response = await apiClient.post(ENDPOINTS.AUTH.SETUP_2FA);
      setTwoFactorData(response.data as TwoFactorData);
      setStep('setup');
      await refreshToken(); // Refresh user data
    } catch (error) {
      console.error('Failed to start 2FA setup:', error);
      setErrorMessage('Failed to start two-factor authentication setup');
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!verificationCode) {
      setErrorMessage('Please enter the verification code');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      
      const response = await apiClient.post(ENDPOINTS.AUTH.CONFIRM_2FA, {
        token: verificationCode
      });
      
      setTwoFactorData(response.data as TwoFactorData);
      setSuccessMessage('Two-factor authentication enabled successfully');
      setStep('status');
      await refreshToken(); // Refresh user data
    } catch (error) {
      console.error('Failed to verify 2FA:', error);

      let errorMessage = 'Invalid verification code. Please try again.';
      
      // Type-safe error handling
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: {
              detail?: string;
              error?: string;
              message?: string;
            };
          };
        };
        
        if (axiosError.response?.status && axiosError.response.status >= 400) {
          const errorData = axiosError.response.data;
          
          if (errorData?.detail) {
            errorMessage = errorData.detail;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          }
        }
      }
      
      setErrorMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const disable2FA = async () => {
    if (!verificationCode) {
      setErrorMessage('Please enter a verification code to disable 2FA');
      return;
    }

    if (verificationCode.length !== 6) {
      setErrorMessage('Verification code must be 6 digits');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      
      await disableTwoFactor(verificationCode); // Use the auth provider function
      
      setTwoFactorData({ enabled: false });
      setSuccessMessage('Two-factor authentication disabled successfully');
      setStep('status');
      setVerificationCode('');
      await refreshToken(); // Refresh user data
    } catch (error: unknown) {
      console.error('Failed to disable 2FA:', error);
      
      let errorMessage = 'Invalid verification code. Please try again.';
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as Error).message;
      }
      
      setErrorMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const copySecret = () => {
    if (twoFactorData?.secret_key) {
      navigator.clipboard.writeText(twoFactorData.secret_key);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <Link
            href="/settings?tab=security"
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
            <p className="mt-1 text-sm text-gray-600">
              Add an extra layer of security to your account
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Alerts */}
        {(errorMessage || successMessage) && (
          <div className="mb-6">
            <FormAlert
              type={errorMessage ? 'error' : 'success'}
              message={errorMessage || successMessage || ''}
            />
          </div>
        )}

        {/* Status View */}
        {step === 'status' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className={`w-8 h-8 ${twoFactorData?.enabled ? 'text-green-500' : 'text-gray-400'}`} />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-500">
                    {twoFactorData?.enabled 
                      ? 'Your account is protected with 2FA' 
                      : 'Secure your account with 2FA'}
                  </p>
                </div>
              </div>

              {twoFactorData?.enabled ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-700">Two-factor authentication is enabled</span>
                  </div>
                  
                  {twoFactorData.recovery_codes_remaining !== undefined && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            You have {twoFactorData.recovery_codes_remaining} recovery codes remaining.
                            Make sure to store them safely.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <FormButton
                      variant="danger"
                      onClick={() => setStep('disable')}
                    >
                      Disable 2FA
                    </FormButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Two-factor authentication adds an extra layer of security to your account. 
                    You'll need your phone or authentication app to sign in.
                  </p>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Benefits of 2FA:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Protects against password-only attacks</li>
                      <li>• Required for HIPAA compliance in healthcare</li>
                      <li>• Provides audit trails for sensitive data access</li>
                      <li>• Reduces risk of unauthorized PHI access</li>
                    </ul>
                  </div>

                  <FormButton
                    variant="primary"
                    onClick={startSetup}
                    isLoading={isProcessing}
                  >
                    Enable Two-Factor Authentication
                  </FormButton>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Setup View */}
        {step === 'setup' && twoFactorData && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Set Up Authenticator App
              </h3>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Scan this QR code with your authenticator app (like Google Authenticator, 
                    Authy, or Microsoft Authenticator):
                  </p>
                  
                  {twoFactorData.qr_code && (
                    <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                      <img 
                        src={twoFactorData.qr_code}
                        alt="QR Code for 2FA setup"
                        className="w-48 h-48"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or enter this secret key manually:
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono">
                      {twoFactorData.secret_key}
                    </code>
                    <button
                      onClick={copySecret}
                      className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      {copiedSecret ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <FormInput
                    id="verification-code-setup"
                    label="Enter the 6-digit code from your app"
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    icon={<Key className="w-4 h-4" />}
                  />
                </div>

                <div className="flex space-x-3">
                  <FormButton
                    variant="primary"
                    onClick={verifyAndEnable}
                    isLoading={isProcessing}
                    disabled={verificationCode.length !== 6}
                  >
                    Verify and Enable
                  </FormButton>
                  
                  <FormButton
                    variant="secondary"
                    onClick={() => setStep('status')}
                  >
                    Cancel
                  </FormButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disable View */}
        {step === 'disable' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Disable Two-Factor Authentication
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-red-800">Warning</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Disabling two-factor authentication will make your account less secure. 
                        This is not recommended for healthcare accounts handling PHI.
                      </p>
                    </div>
                  </div>
                </div>
                <FormInput
                  id="verification-code-disable"
                  label="Enter a verification code from your authenticator app"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  icon={<Key className="w-4 h-4" />}
                />

                <div className="flex space-x-3">
                  <FormButton
                    variant="danger"
                    onClick={disable2FA}
                    isLoading={isProcessing}
                    disabled={verificationCode.length !== 6}
                  >
                    Disable 2FA
                  </FormButton>
                  
                  <FormButton
                    variant="secondary"
                    onClick={() => setStep('status')}
                  >
                    Cancel
                  </FormButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <Smartphone className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Recommended Authenticator Apps
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Google Authenticator (iOS, Android)</li>
                  <li>Microsoft Authenticator (iOS, Android)</li>
                  <li>Authy (iOS, Android, Desktop)</li>
                  <li>1Password (iOS, Android, Desktop)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}