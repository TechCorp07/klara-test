'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import TwoFactorAuthForm from '../../components/auth/TwoFactorAuthForm';

export default function LoginPage() {
  const { login, requiresTwoFactor, twoFactorUserId, verify2FA } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const onLoginSubmit = async (data) => {
    setLoading(true);
    
    try {
      const result = await login(data);
      
      if (result.requires2FA) {
        // 2FA required, form will update to show 2FA input
        toast.info('Please enter your two-factor authentication code.');
      } else if (result.success) {
        toast.success('Login successful!');
        
        // Get the callback URL or default to dashboard
        const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
        router.push(callbackUrl);
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.response) {
        // Get error message from response
        if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors[0];
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const onTwoFactorSubmit = async (token) => {
    setLoading(true);
    
    try {
      const result = await verify2FA(token);
      
      if (result.success) {
        toast.success('Login successful!');
        
        // Get the callback URL or default to dashboard
        const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
        router.push(callbackUrl);
      }
    } catch (error) {
      let errorMessage = 'Verification failed. Please check your code.';
      
      if (error.response && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">Klararety Health</h1>
          <h2 className="mt-2 text-xl font-semibold text-gray-800">Sign in to your account</h2>
        </div>
        
        {requiresTwoFactor ? (
          <TwoFactorAuthForm onSubmit={onTwoFactorSubmit} loading={loading} />
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onLoginSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    {...register('username', { required: 'Username is required' })}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    {...register('password', { required: 'Password is required' })}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
            
            <div className="text-center">
              <span className="text-sm">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Register here
                </Link>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
