"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { format } from 'date-fns';
import Link from 'next/link';
import { FaUserCircle, FaLock, FaMobileAlt, FaShieldAlt } from 'react-icons/fa';

export default function PatientSettingsPage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  
  // Set initial form values when user data is available
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number || '',
      });
    }
  }, [user, reset]);
  
  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      await updateProfile(data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.response && error.response.data) {
        // Format validation errors
        const responseData = error.response.data;
        
        if (typeof responseData === 'object') {
          const firstErrorKey = Object.keys(responseData)[0];
          if (firstErrorKey && responseData[firstErrorKey]) {
            errorMessage = `${firstErrorKey}: ${responseData[firstErrorKey][0]}`;
          }
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Patient Settings</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your account details</p>
            </div>
            
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  reset({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone_number: user.phone_number || '',
                  });
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
          </div>
          
          {editing ? (
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      id="first_name"
                      autoComplete="given-name"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      {...register('first_name', { required: 'First name is required' })}
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                    )}
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      id="last_name"
                      autoComplete="family-name"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      {...register('last_name', { required: 'Last name is required' })}
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                    )}
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="email"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                          message: 'Invalid email address',
                        }
                      })}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      id="phone_number"
                      autoComplete="tel"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      {...register('phone_number')}
                    />
                    {errors.phone_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.first_name} {user.last_name}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Username</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.username}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.phone_number || 'Not provided'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.role_display || user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Member since</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(user.date_joined), 'MMMM d, yyyy')}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
        
        {/* Security section */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Security</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your account security settings
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="rounded-full p-2 bg-blue-100 text-blue-500">
                      <FaLock className="h-5 w-5" />
                    </div>
                    <h4 className="ml-3 text-lg font-medium text-gray-900">Password</h4>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Change your password regularly to keep your account secure.
                  </p>
                  <Link 
                    href="/patient/settings/change-password"
                    className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Change Password
                  </Link>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="rounded-full p-2 bg-blue-100 text-blue-500">
                      <FaShieldAlt className="h-5 w-5" />
                    </div>
                    <h4 className="ml-3 text-lg font-medium text-gray-900">Two-Factor Authentication</h4>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {user.two_factor_enabled 
                      ? 'Two-factor authentication is enabled for your account.'
                      : 'Add an extra layer of security by enabling two-factor authentication.'}
                  </p>
                  <Link
                    href="/patient/settings/security"
                    className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Manage Security Settings
                  </Link>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="rounded-full p-2 bg-blue-100 text-blue-500">
                      <FaMobileAlt className="h-5 w-5" />
                    </div>
                    <h4 className="ml-3 text-lg font-medium text-gray-900">Community Consent</h4>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Manage your consent for participating in the healthcare community.
                  </p>
                  <Link
                    href="/patient/settings/consent"
                    className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Manage Consent Settings
                  </Link>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="rounded-full p-2 bg-blue-100 text-blue-500">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h4 className="ml-3 text-lg font-medium text-gray-900">Login History</h4>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Review your recent login activity for security purposes.
                  </p>
                  <Link
                    href="/patient/settings/security#login-history"
                    className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Login History
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Link
            href="/patient/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}