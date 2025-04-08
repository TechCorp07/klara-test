// File: /app/profile/two-factor-setup/page.js

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { security } from '../../../lib/api';
import AuthenticatedLayout from '../../../components/layout/AuthenticatedLayout';
import TwoFactorAuthForm from '../../../components/auth/TwoFactorAuthForm';
import QRCode from 'qrcode.react';
import { FaLock, FaExclamationTriangle, FaCheck, FaInfoCircle, FaMobileAlt, FaQrcode } from 'react-icons/fa';
import Link from 'next/link';

// HIPAA compliance banner component
const HIPAABanner = () => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <FaLock className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">HIPAA Security Requirement</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              Two-factor authentication is recommended by HIPAA regulations to protect patient data.
              Setting up 2FA adds an extra layer of security to your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Setup steps component
const SetupSteps = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Enable 2FA', description: 'Turn on two-factor authentication' },
    { id: 2, name: 'Scan QR Code', description: 'Scan with authenticator app' },
    { id: 3, name: 'Verify Code', description: 'Enter code to confirm setup' },
    { id: 4, name: 'Complete', description: 'Setup complete' }
  ];
  
  return (
    <div className="mb-8">
      <nav aria-label="Progress">
        <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
          {steps.map((step) => (
            <li key={step.id} className="md:flex-1">
              <div className={`group pl-4 py-2 flex flex-col border-l-4 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4 ${
                step.id < currentStep
                  ? 'border-green-500'
                  : step.id === currentStep
                  ? 'border-blue-500'
                  : 'border-gray-200'
              }`}>
                <span className={`text-xs font-semibold tracking-wide uppercase ${
                  step.id < currentStep
                    ? 'text-green-600'
                    : step.id === currentStep
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`}>
                  Step {step.id}
                </span>
                <span className="text-sm font-medium">{step.name}</span>
                <span className="text-sm text-gray-500">{step.description}</span>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default function TwoFactorSetupPage() {
  const { user, setupTwoFactor, verifyTwoFactor, disableTwoFactor } = useAuth();
  const [loading, setLoading] = useState(true);
  const [setupStep, setSetupStep] = useState(1);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const checkTwoFactorStatus = async () => {
      try {
        const status = await security.getTwoFactorStatus();
        setTwoFactorEnabled(status.enabled);
        
        if (status.enabled) {
          setSetupStep(4);
        }
      } catch (error) {
        console.error('Error checking two-factor status:', error);
        setError('Failed to check two-factor authentication status. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    checkTwoFactorStatus();
  }, []);
  
  const handleEnableTwoFactor = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await setupTwoFactor();
      setQrCodeUrl(response.qr_code_url);
      setSecretKey(response.secret_key);
      setSetupStep(2);
    } catch (error) {
      console.error('Error enabling two-factor authentication:', error);
      setError('Failed to enable two-factor authentication. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyCode = async () => {
    setError(null);
    setLoading(true);
    
    try {
      await verifyTwoFactor(verificationCode);
      setTwoFactorEnabled(true);
      setSetupStep(4);
      setSuccess(true);
    } catch (error) {
      console.error('Error verifying two-factor code:', error);
      setError('Failed to verify code. Please ensure you entered the correct code from your authenticator app.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDisableTwoFactor = async () => {
    setError(null);
    setLoading(true);
    
    try {
      await disableTwoFactor();
      setTwoFactorEnabled(false);
      setSetupStep(1);
      setSuccess(false);
    } catch (error) {
      console.error('Error disabling two-factor authentication:', error);
      setError('Failed to disable two-factor authentication. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && setupStep === 1) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
        </div>
        
        {/* HIPAA Compliance Banner */}
        <HIPAABanner />
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaCheck className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Two-factor authentication has been successfully set up.</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Setup Steps */}
        <SetupSteps currentStep={setupStep} />
        
        {/* Step 1: Enable 2FA */}
        {setupStep === 1 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-blue-100 text-blue-600">
                  <FaMobileAlt className="h-5 w-5" />
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-900">Enable Two-Factor Authentication</h2>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Two-factor authentication adds an extra layer of security to your account by requiring a second verification step when logging in. This helps protect your account and patient data even if your password is compromised.
              </p>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaInfoCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Before you begin</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        You'll need to download and install an authenticator app on your mobile device, such as:
                      </p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Google Authenticator</li>
                        <li>Microsoft Authenticator</li>
                        <li>Authy</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleEnableTwoFactor}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enabling...' : 'Enable Two-Factor Authentication'}
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Scan QR Code */}
        {setupStep === 2 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-blue-100 text-blue-600">
                  <FaQrcode className="h-5 w-5" />
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-900">Scan QR Code</h2>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with your authenticator app to set up two-factor authentication.
              </p>
              
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-300 mb-4">
                  {qrCodeUrl ? (
                    <QRCode value={qrCodeUrl} size={200} />
                  ) : (
                    <div className="h-[200px] w-[200px] flex items-center justify-center bg-gray-100">
                      <FaQrcode className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  If you can't scan the QR code, you can manually enter this key in your authenticator app:
                </p>
                
                <div className="bg-gray-100 px-4 py-2 rounded-md font-mono text-sm mb-4">
                  {secretKey}
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setSetupStep(1)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                
                <button
                  type="button"
                  onClick={() => setSetupStep(3)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Verify Code */}
        {setupStep === 3 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-blue-100 text-blue-600">
                  <FaCheck className="h-5 w-5" />
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-900">Verify Code</h2>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Enter the verification code from your authenticator app to complete the setup.
              </p>
              
              <div className="mb-6">
                <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setSetupStep(2)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={loading || verificationCode.length !== 6}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify and Enable'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 4: Complete */}
        {setupStep === 4 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-green-100 text-green-600">
                  <FaCheck className="h-5 w-5" />
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-900">Two-Factor Authentication Enabled</h2>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaCheck className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Two-factor authentication is enabled</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Your account is now protected with an additional layer of security. You will be required to enter a verification code from your authenticator app when logging in.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaInfoCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Keep your authenticator app safe and accessible. If you lose access to your authenticator app, you may be locked out of your account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Link
                  href="/profile/security"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Security Settings
                </Link>
                
                <button
                  type="button"
                  onClick={handleDisableTwoFactor}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
