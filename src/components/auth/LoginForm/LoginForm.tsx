// src/components/auth/LoginForm/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, FormButton, FormAlert } from '../../ui/common';
import { useAuth } from '@/lib/auth';
import { Smartphone, Mail, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';

// Email and password validation schema
const loginSchema = z.object({
  username: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type VerificationMethod = 'authenticator' | 'email';

const LoginForm = () => {
  const { login, verifyTwoFactor, request2FAEmailBackup, verify2FAEmailBackup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  // Authentication flow states
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [temporaryUserId, setTemporaryUserId] = useState<number | null>(null);
  const [temporaryUserEmail, setTemporaryUserEmail] = useState<string>('');
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('authenticator');
  const [emailBackupRequested, setEmailBackupRequested] = useState(false);

  // Form inputs
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [emailBackupCode, setEmailBackupCode] = useState('');

  // UI states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Handle initial login form submission
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      const response = await login({
        username: data.username,
        password: data.password
      });

      if (response.requires_2fa) {
        setTemporaryUserId(response.user.id);
        setTemporaryUserEmail(response.user.email);
        setRequiresTwoFactor(true);
        setSuccessMessage('Please verify your identity to continue.');
      } else {
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          router.push(returnUrl);
        }, 500);
      }
    } catch (error) {
      handleAuthError(error);
    }
  };

  // Handle authenticator app 2FA verification
  const handleAuthenticatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!temporaryUserId) {
      setErrorMessage('Session error. Please try logging in again.');
      setRequiresTwoFactor(false);
      return;
    }

    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit code.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      
      await verifyTwoFactor(temporaryUserId, twoFactorCode);
      
      setSuccessMessage('Verification successful! Redirecting...');
      setTimeout(() => {
        router.push(returnUrl);
      }, 500);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle email backup code request
  const handleRequestEmailBackup = async () => {
    if (!temporaryUserId) {
      setErrorMessage('Session error. Please try logging in again.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await request2FAEmailBackup(temporaryUserId);
      setEmailBackupRequested(true);
      setVerificationMethod('email');
      setSuccessMessage(response.message);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle email backup verification
  const handleEmailBackupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!temporaryUserId) {
      setErrorMessage('Session error. Please try logging in again.');
      setRequiresTwoFactor(false);
      return;
    }

    if (!emailBackupCode || emailBackupCode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit code.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await verify2FAEmailBackup(temporaryUserId, emailBackupCode);
      
      setSuccessMessage('Verification successful! Redirecting...');
      setTimeout(() => {
        router.push(returnUrl);
      }, 500);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Centralized error handling
  const handleAuthError = (error: unknown) => {
    if (error && typeof error === 'object') {
      const err = error as {
        requires_approval?: boolean;
        role?: string;
        submitted_at?: string;
        redirect_to?: string;
        response?: {
          data?: {
            requires_approval?: boolean;
            role?: string;
            submitted_at?: string;
            redirect_to?: string;
            detail?: string;
            error?: string;
            error_type?: string;
          };
        };
        message?: string;
        error?: string;
        error_type?: string;
      };
      
      // Handle approval pending
      if (err.requires_approval || err.response?.data?.requires_approval) {
        const errorData = err.response?.data || err;
        const approvalUrl = errorData.redirect_to || 
          `/approval-pending?role=${errorData.role}&submitted=${encodeURIComponent(errorData.submitted_at || new Date().toISOString())}`;
        
        router.push(approvalUrl);
        return;
      }

      // Handle specific error types
      const errorType = err.error_type || err.response?.data?.error_type;
      const errorMsg = err.error || err.response?.data?.error || err.response?.data?.detail || err.message;

      switch (errorType) {
        case 'IP_BLACKLISTED':
          setErrorMessage('🚫 Your IP address has been temporarily blocked due to security concerns. Please contact support.');
          break;
        case 'RATE_LIMITED':
          setErrorMessage('⏰ Too many login attempts. Please wait a few minutes before trying again.');
          break;
        case 'ACCOUNT_LOCKED':
          setErrorMessage('🔒 Your account has been temporarily locked. Please contact support or try again later.');
          break;
        default:
          if (typeof errorMsg === 'string') {
            const detail = errorMsg.toLowerCase();
            if (detail.includes('invalid') && detail.includes('code')) {
              setErrorMessage('Invalid verification code. Please try again.');
            } else if (detail.includes('expired')) {
              setErrorMessage('Verification code has expired. Please request a new one.');
            } else {
              setErrorMessage(errorMsg);
            }
          } else {
            setErrorMessage('An unexpected error occurred. Please try again.');
          }
      }
    } else {
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  // Reset to login form
  const handleBackToLogin = () => {
    setRequiresTwoFactor(false);
    setTemporaryUserId(null);
    setTemporaryUserEmail('');
    setVerificationMethod('authenticator');
    setEmailBackupRequested(false);
    setTwoFactorCode('');
    setEmailBackupCode('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Switch verification method
  const handleSwitchMethod = (method: VerificationMethod) => {
    setVerificationMethod(method);
    setErrorMessage(null);
    setSuccessMessage(null);
    setTwoFactorCode('');
    setEmailBackupCode('');
  };

  // Render 2FA verification form
  if (requiresTwoFactor) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToLogin}
            className="flex items-center text-gray-500 hover:text-gray-700 mr-3"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            Two-Factor Authentication
          </h2>
        </div>

        {/* Alerts */}
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

        {/* Verification method selection */}
        {!emailBackupRequested && (
          <div className="mb-6">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleSwitchMethod('authenticator')}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  verificationMethod === 'authenticator'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Authenticator App
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMethod('email')}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  verificationMethod === 'email'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Backup
              </button>
            </div>
          </div>
        )}

        {/* Authenticator App Verification */}
        {verificationMethod === 'authenticator' && (
          <div>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Authenticator App Required</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Open your authenticator app and enter the 6-digit code.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAuthenticatorSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="twoFactorCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Verification Code
                </label>
                <input
                  id="twoFactorCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-center text-lg font-mono tracking-widest focus:ring-blue-500 focus:border-blue-500"
                  placeholder="000000"
                  autoComplete="one-time-code"
                  disabled={isSubmitting}
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <FormButton
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={twoFactorCode.length !== 6}
                className="w-full"
              >
                Verify Code
              </FormButton>
            </form>

            {/* Lost device option */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => handleSwitchMethod('email')}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Lost your device? Use email verification instead
              </button>
            </div>
          </div>
        )}

        {/* Email Backup Verification */}
        {verificationMethod === 'email' && (
          <div>
            {!emailBackupRequested ? (
              <div>
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Email Backup Verification</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        We'll send a verification code to your email address: {temporaryUserEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <FormButton
                  type="button"
                  variant="primary"
                  onClick={handleRequestEmailBackup}
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  Send Email Verification Code
                </FormButton>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleSwitchMethod('authenticator')}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Back to authenticator app
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-green-800 font-medium">Check Your Email</p>
                      <p className="text-sm text-green-700 mt-1">
                        We've sent a 6-digit code to {temporaryUserEmail}. The code expires in 10 minutes.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleEmailBackupSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="emailBackupCode"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Verification Code
                    </label>
                    <input
                      id="emailBackupCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={emailBackupCode}
                      onChange={(e) => setEmailBackupCode(e.target.value.replace(/\D/g, ''))}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-center text-lg font-mono tracking-widest focus:ring-blue-500 focus:border-blue-500"
                      placeholder="000000"
                      autoComplete="one-time-code"
                      disabled={isSubmitting}
                      required
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Enter the 6-digit code sent to your email
                    </p>
                  </div>

                  <FormButton
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    disabled={emailBackupCode.length !== 6}
                    className="w-full"
                  >
                    Verify Email Code
                  </FormButton>
                </form>

                <div className="mt-4 text-center space-y-2">
                  <button
                    type="button"
                    onClick={handleRequestEmailBackup}
                    className="text-sm text-blue-600 hover:text-blue-800 underline block mx-auto"
                    disabled={isSubmitting}
                  >
                    Resend email code
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMethod('authenticator')}
                    className="text-sm text-gray-600 hover:text-gray-800 underline block mx-auto"
                  >
                    Use authenticator app instead
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Render main login form
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Sign In
      </h2>

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
        <FormInput
          label="Email Address"
          id="username"
          type="email"
          required
          {...register('username')}
          error={errors.username}
          autoComplete="email"
        />

        <FormInput
          label="Password"
          id="password"
          type="password"
          required
          {...register('password')}
          error={errors.password}
          autoComplete="current-password"
        />

        <FormButton
          type="submit"
          variant="primary"
          isLoading={isFormSubmitting}
          className="w-full"
        >
          Sign In
        </FormButton>
      </form>

      <div className="mt-6 text-center space-y-2">
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Forgot your password?
        </Link>
        <div className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;