"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import securityService from '@/lib/services/securityService';
import Link from 'next/link';
import { FaShieldAlt, FaHistory, FaMobileAlt, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Client component for security page
 */
export default function SecurityClient() {
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityError, setSecurityError] = useState(null);
  const [securitySuccess, setSecuritySuccess] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    // Initialize 2FA state from user data
    setTwoFactorEnabled(user.two_factor_enabled || false);
    
    // Fetch login history
    const fetchLoginHistory = async () => {
      try {
        setLoadingHistory(true);
        const response = await securityService.getLoginHistory();
        setLoginHistory(response.history || []);
      } catch (err) {
        console.error('Error fetching login history:', err);
        setSecurityError('Failed to load login history. Please try again later.');
      } finally {
        setLoadingHistory(false);
      }
    };
    
    fetchLoginHistory();
  }, [user]);
  
  const handleEnable2FA = async () => {
    try {
      setIsSubmitting(true);
      setSecurityError(null);
      
      // Request 2FA setup
      const response = await securityService.setup2FA();
      
      if (response.qr_code_url) {
        setQrCodeUrl(response.qr_code_url);
        setShowQRCode(true);
      } else {
        throw new Error('Failed to generate QR code for 2FA setup');
      }
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      setSecurityError(error.message || 'Failed to set up two-factor authentication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVerify2FA = async () => {
    try {
      setIsSubmitting(true);
      setSecurityError(null);
      
      // Verify 2FA setup
      await securityService.verify2FA(verificationCode);
      
      setTwoFactorEnabled(true);
      setShowQRCode(false);
      setVerificationCode('');
      setSecuritySuccess('Two-factor authentication has been enabled successfully.');
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSecuritySuccess(null);
      }, 5000);
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      setSecurityError(error.message || 'Failed to verify two-factor authentication. Please check your code and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDisable2FA = async () => {
    try {
      setIsSubmitting(true);
      setSecurityError(null);
      
      // Disable 2FA
      await securityService.disable2FA();
      
      setTwoFactorEnabled(false);
      setSecuritySuccess('Two-factor authentication has been disabled.');
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSecuritySuccess(null);
      }, 5000);
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      setSecurityError(error.message || 'Failed to disable two-factor authentication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Account Security</h1>
          <Link 
            href="/patient/settings"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Settings
          </Link>
        </div>
        
        {securitySuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{securitySuccess}</span>
          </div>
        )}
        
        {securityError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{securityError}</span>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">Password Management</h2>
                  <p className="text-gray-600">Update your password regularly to keep your account secure</p>
                </div>
              </div>
              
              <Link
                href="/patient/settings/change-password"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Change Password
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <FaShieldAlt className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
                  <p className="text-gray-600">Add an extra layer of security to your account</p>
                </div>
              </div>
              
              {twoFactorEnabled ? (
                <button
                  onClick={handleDisable2FA}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Disabling...' : 'Disable 2FA'}
                </button>
              ) : (
                <button
                  onClick={handleEnable2FA}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enabling...' : 'Enable 2FA'}
                </button>
              )}
            </div>
            
            {showQRCode && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-medium mb-4">Set Up Two-Factor Authentication</h3>
                  
                  <div className="mb-4">
                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
                      <li>Download an authenticator app like Google Authenticator or Authy</li>
                      <li>Scan the QR code below with the app</li>
                      <li>Enter the 6-digit verification code from the app</li>
                    </ol>
                  </div>
                  
                  <div className="border border-gray-300 rounded-md p-4 mb-6">
                    <img src={qrCodeUrl} alt="QR Code for 2FA setup" className="h-48 w-48" />
                  </div>
                  
                  <div className="w-full max-w-xs">
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Code
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleVerify2FA}
                        disabled={isSubmitting || verificationCode.length !== 6}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {twoFactorEnabled && !showQRCode && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaShieldAlt className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Two-factor authentication is enabled. Your account has an extra layer of security.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {!twoFactorEnabled && !showQRCode && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Two-factor authentication is not enabled. We strongly recommend enabling this feature to protect your account.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div id="login-history" className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <FaHistory className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold">Login History</h2>
                <p className="text-gray-600">Recent account activity</p>
              </div>
            </div>
            
            {loadingHistory ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : loginHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Device
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loginHistory.map((login) => (
                      <tr key={login.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(login.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {login.ip_address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaMobileAlt className="mr-2 text-gray-400" />
                            {login.device}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            login.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {login.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">No login history available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}