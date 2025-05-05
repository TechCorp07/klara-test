"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { securityService } from '@/lib/services/securityService';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FaQrcode, FaCheck, FaTimes } from 'react-icons/fa';

/**
 * Client component for two-factor-setup page
 */
export default function TwoFactorSetupClient() {
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupError, setSetupError] = useState(null);
  const [setupSuccess, setSetupSuccess] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        setSetupError(null);
        
        // Request 2FA setup
        const response = await securityService.setup2FA();
        
        if (response.qr_code_url) {
          setQrCodeUrl(response.qr_code_url);
        } else {
          throw new Error('Failed to generate QR code for 2FA setup');
        }
      } catch (error) {
        console.error('Error setting up 2FA:', error);
        setSetupError(error.message || 'Failed to set up two-factor authentication. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    generateQRCode();
  }, [user]);
  
  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setSetupError('Please enter a valid 6-digit verification code');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSetupError(null);
      
      // Verify 2FA setup
      await securityService.verify2FA(verificationCode);
      
      setSetupSuccess(true);
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      setSetupError(error.message || 'Failed to verify two-factor authentication. Please check your code and try again.');
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
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Set Up Two-Factor Authentication</h1>
        </div>
        
        {setupSuccess ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                  <FaCheck className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Setup Complete!</h2>
                <p className="text-gray-600 mb-6">
                  Two-factor authentication has been successfully enabled for your account.
                </p>
                <Link
                  href="/patient/settings/security"
                  className="w-full px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to Security Settings
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              {setupError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <span className="block sm:inline">{setupError}</span>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                    <FaQrcode className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Scan QR Code</h2>
                  <p className="text-gray-600 mb-6 text-center">
                    Scan this QR code with your authenticator app to set up two-factor authentication.
                  </p>
                  
                  <div className="border border-gray-300 rounded-md p-4 mb-6">
                    <img src={qrCodeUrl} alt="QR Code for 2FA setup" className="h-48 w-48" />
                  </div>
                  
                  <div className="w-full mb-6">
                    <h3 className="text-lg font-medium mb-2">Setup Instructions</h3>
                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
                      <li>Download an authenticator app like Google Authenticator or Authy if you don't have one</li>
                      <li>Open the app and scan the QR code above</li>
                      <li>Enter the 6-digit verification code from the app below</li>
                    </ol>
                  </div>
                  
                  <form onSubmit={handleVerify} className="w-full">
                    <div className="mb-4">
                      <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        maxLength={6}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Link
                        href="/patient/settings/security"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        disabled={isSubmitting || verificationCode.length !== 6}
                        className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Verifying...' : 'Verify and Enable'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}