// src/components/auth/TwoFactorForm/TwoFactorForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { FormInput, FormButton, FormAlert } from '../common';
import { useAuth } from '@/lib/auth/use-auth';
import { config } from '@/lib/config';
import Image from 'next/image';

// Validation schema for 2FA verification code (setup flow)
const twoFactorCodeSchema = z.object({
  code: z
    .string()
    .min(6, 'Please enter a valid verification code')
    .max(6, 'Please enter a valid verification code')
    .regex(/^\d+$/, 'Verification code must contain only digits'),
});

// FIXED: Separate validation schema for disabling 2FA (requires password)
const disableTwoFactorSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .min(config.passwordMinLength, `Password must be at least ${config.passwordMinLength} characters`),
});

// Type for setup/verification form values
type TwoFactorCodeFormValues = z.infer<typeof twoFactorCodeSchema>;

// FIXED: Type for disable 2FA form values
type DisableTwoFactorFormValues = z.infer<typeof disableTwoFactorSchema>;

/**
 * FIXED: Two-factor authentication form component with proper disable flow
 * 
 * Key fixes:
 * - Separate form schemas for setup vs disable flows
 * - Disable 2FA now asks for password (not verification code)
 * - Proper backend field name handling for setup response
 */
const TwoFactorForm: React.FC = () => {
  // Get auth context for 2FA functions
  const { setupTwoFactor, confirmTwoFactor, disableTwoFactor, user } = useAuth();

  // State for form
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  
  // State for 2FA setup
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);
  const [setupStarted, setSetupStarted] = useState(false);

  // Check if 2FA is already enabled
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Form for 2FA setup/verification
  const {
    register: registerSetup,
    handleSubmit: handleSetupSubmit,
    formState: { errors: setupErrors, isSubmitting: isSetupSubmitting },
  } = useForm<TwoFactorCodeFormValues>({
    resolver: zodResolver(twoFactorCodeSchema),
    defaultValues: {
      code: '',
    },
  });

  // FIXED: Separate form for disabling 2FA (password-based)
  const {
    register: registerDisable,
    handleSubmit: handleDisableSubmit,
    reset: resetDisableForm,
    formState: { errors: disableErrors },
  } = useForm<DisableTwoFactorFormValues>({
    resolver: zodResolver(disableTwoFactorSchema),
    defaultValues: {
      password: '',
    },
  });

  // Check if 2FA is already enabled when component mounts
  useEffect(() => {
    if (user?.two_factor_enabled) {
      setIs2FAEnabled(true);
    }
  }, [user]);

  // Function to start 2FA setup
  const handleSetupStart = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      // Call API to get 2FA setup info
      const response = await setupTwoFactor();
      
      // FIXED: Use correct field names from backend response
      setSecret(response.secret_key);  // Backend returns 'secret_key'
      setQrCodeUrl(response.qr_code);  // Backend returns 'qr_code' (base64 data)
      setSetupStarted(true);
    } 
    catch (error: unknown) {
      if (error && typeof error === 'object') {
        const err = error as {
          response?: { data?: { detail?: string; error?: { message?: string } } };
          message?: string;
        };
        if (err.response?.data?.detail) {
          setErrorMessage(err.response.data.detail);
        } else if (err.response?.data?.error) {
          setErrorMessage(
            err.response.data.error.message || 'Failed to start 2FA setup. Please try again.'
          );
        } else if (err.message) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('An unexpected error occurred. Please try again later.');
        }
      } else {
        setErrorMessage('An unknown error occurred. Please try again later.');
      }
    }    
    finally {
      setIsLoading(false);
    }
  };

  // Function to verify and complete 2FA setup
  const onSetupSubmit = async (data: TwoFactorCodeFormValues) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      // Call API to confirm 2FA setup
      const response = await confirmTwoFactor(data.code);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Two-factor authentication has been successfully enabled for your account.');
        setSetupComplete(true);
        setIs2FAEnabled(true);
      } else {
        setErrorMessage('Verification failed. Please check your code and try again.');
      }
    } 
    catch (error: unknown) {
      if (error && typeof error === 'object') {
        const err = error as {
          response?: { data?: { detail?: string; error?: { message?: string } } };
          message?: string;
        };
    
        if (err.response?.data?.detail) {
          setErrorMessage(err.response.data.detail);
        } else if (err.response?.data?.error) {
          setErrorMessage(
            err.response.data.error.message || 'Failed to verify 2FA setup. Please try again.'
          );
        } else if (err.message) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('An unexpected error occurred. Please try again later.');
        }
      } else {
        setErrorMessage('An unknown error occurred. Please try again later.');
      }
    }    
  };

  // FIXED: Function to disable 2FA using password
  const onDisableSubmit = async (data: DisableTwoFactorFormValues) => {
    try {
      setIsDisabling(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      // FIXED: Call API to disable 2FA with password (not verification code)
      const response = await disableTwoFactor(data.password);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Two-factor authentication has been successfully disabled for your account.');
        setIs2FAEnabled(false);
        setSetupStarted(false);
        setSetupComplete(false);
        resetDisableForm(); // Clear the password field
      } else {
        setErrorMessage('Failed to disable 2FA. Please check your password and try again.');
      }
    } catch (error: unknown) {
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
    
        if (err.response?.data?.detail) {
          setErrorMessage(err.response.data.detail);
        } else if (err.response?.data?.error) {
          setErrorMessage(
            err.response.data.error.message || 'Failed to disable 2FA. Please try again.'
          );
        } else if (err.message) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('An unexpected error occurred. Please try again later.');
        }
      } else {
        setErrorMessage('An unknown error occurred. Please try again later.');
      }
    } finally {
      setIsDisabling(false);
    }
  };

  // FIXED: If 2FA is enabled, show disable form with password field
  if (is2FAEnabled && !setupComplete) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Disable Two-Factor Authentication
        </h2>

        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            Two-factor authentication is currently enabled for your account.
          </p>
        </div>

        <FormAlert
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />

        <FormAlert
          type="success"
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />

        {/* FIXED: Form now asks for password instead of verification code */}
        <form onSubmit={handleDisableSubmit(onDisableSubmit)} className="space-y-6">
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">Security Confirmation Required</h3>
            <p className="text-sm text-yellow-700">
              To disable two-factor authentication, please enter your current account password.
              This helps ensure that only you can make changes to your security settings.
            </p>
          </div>

          <FormInput
            id="password"
            label="Current Password"
            type="password"
            error={disableErrors.password}
            autoComplete="current-password"
            required
            disabled={isDisabling}
            helperText="Enter your current account password to confirm this action"
            {...registerDisable('password')}
          />

          <div>
            <FormButton
              type="submit"
              variant="danger"
              fullWidth
              isLoading={isDisabling}
            >
              Disable Two-Factor Authentication
            </FormButton>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/settings"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Back to Settings
          </Link>
        </div>
      </div>
    );
  }

  // If setup is complete, show success message
  if (setupComplete) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Two-Factor Authentication Setup Complete
        </h2>

        <FormAlert
          type="success"
          message={successMessage}
          dismissible={false}
        />

        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-4">
            Your account is now protected with two-factor authentication. You will need to enter a verification code from your authenticator app each time you log in.
          </p>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">Important</h3>
            <p className="text-sm text-yellow-700">
              Please make sure to keep your recovery codes in a safe place. If you lose access to your authenticator app, you will need these codes to regain access to your account.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/settings"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Settings
          </Link>
        </div>
      </div>
    );
  }

  // If setup has started, show QR code and verification form
  if (setupStarted) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Set Up Two-Factor Authentication
        </h2>

        <FormAlert
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 1: Scan QR Code</h3>
          <p className="text-sm text-gray-600 mb-4">
            Scan this QR code with your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator).
          </p>
          
          <div className="flex justify-center mb-4">
            <div className="p-2 bg-white border rounded-md shadow-sm">
              {/* FIXED: QR code is now base64 data from backend */}
              <Image
                src={qrCodeUrl}
                alt="QR Code for Two-Factor Authentication"
                className="w-48 h-48"
                width={192}
                height={192}
              />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Manual setup code:</p>
            <p className="text-sm font-mono bg-gray-100 p-2 rounded border border-gray-300 break-all">
              {secret}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              If you can&apos;t scan the QR code, you can manually enter this code into your authenticator app.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 2: Verify Setup</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enter the 6-digit verification code from your authenticator app to complete the setup.
          </p>
          
          <form onSubmit={handleSetupSubmit(onSetupSubmit)} className="space-y-6">
            <FormInput
              id="code"
              label="Verification Code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              error={setupErrors.code}
              autoComplete="one-time-code"
              required
              disabled={isSetupSubmitting}
              {...registerSetup('code')}
            />

            <div>
              <FormButton
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isSetupSubmitting}
              >
                Verify and Enable
              </FormButton>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setSetupStarted(false)}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Cancel Setup
          </button>
        </div>
      </div>
    );
  }

  // Initial state - show setup information and start button
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Two-Factor Authentication
      </h2>

      <FormAlert
        type="error"
        message={errorMessage}
        onDismiss={() => setErrorMessage(null)}
      />

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Enhance Your Account Security</h3>
        <p className="text-sm text-gray-600 mb-4">
          Two-factor authentication adds an extra layer of security to your account by requiring a verification code from your phone in addition to your password.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-1">How it works:</h4>
          <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
            <li>Set up an authenticator app on your phone (like Google Authenticator, Authy, or Microsoft Authenticator)</li>
            <li>Scan the QR code or enter the setup key into your app</li>
            <li>Enter the verification code from your app to complete setup</li>
            <li>For future logins, you&apos;ll need to provide a code from your app</li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <h4 className="text-sm font-semibold text-yellow-800 mb-1">Important:</h4>
          <p className="text-sm text-yellow-700">
            You&apos;ll need access to your authenticator app every time you log in. Make sure to save your recovery codes in case you lose your device.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <FormButton
          type="button"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          onClick={handleSetupStart}
        >
          Set Up Two-Factor Authentication
        </FormButton>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/settings"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Back to Settings
        </Link>
      </div>
    </div>
  );
};

export default TwoFactorForm;