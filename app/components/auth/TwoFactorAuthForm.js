// File: /components/auth/TwoFactorAuthForm.js

import { useState, useEffect } from 'react';
import QRCodeScanner from './QRCodeScanner';
import { FaLock, FaExclamationTriangle, FaQrcode, FaKeyboard, FaSync } from 'react-icons/fa';

const TwoFactorAuthForm = ({ 
  onVerify, 
  onCancel, 
  isSetup = false, 
  qrCodeUrl = null,
  secretKey = null,
  loading = false,
  error = null
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [useScanMode, setUseScanMode] = useState(false);
  const [scanError, setScanError] = useState(null);
  
  // Reset form when props change
  useEffect(() => {
    setVerificationCode('');
    setScanError(null);
  }, [isSetup, qrCodeUrl]);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      return;
    }
    
    if (onVerify) {
      onVerify(verificationCode);
    }
  };
  
  // Handle QR code scan
  const handleScan = (data) => {
    // Extract the OTP code from the scanned data
    // The format might vary, but typically it's a 6-digit number
    const codeMatch = data.match(/\b\d{6}\b/);
    
    if (codeMatch) {
      setVerificationCode(codeMatch[0]);
      
      // Auto-submit if we have a valid code
      if (onVerify) {
        onVerify(codeMatch[0]);
      }
    } else {
      setScanError('Invalid QR code format. Please try again or enter the code manually.');
    }
  };
  
  // Handle scan error
  const handleScanError = (err) => {
    console.error('QR code scan error:', err);
    setScanError('Failed to scan QR code. Please try again or enter the code manually.');
  };
  
  // Toggle between scan and manual entry modes
  const toggleScanMode = () => {
    setUseScanMode(!useScanMode);
    setScanError(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="rounded-full p-2 bg-blue-100 text-blue-600">
            <FaLock className="h-5 w-5" />
          </div>
          <h2 className="ml-3 text-lg font-medium text-gray-900">
            {isSetup ? 'Set Up Two-Factor Authentication' : 'Two-Factor Authentication'}
          </h2>
        </div>
      </div>
      
      <div className="px-6 py-4">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
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
        
        {scanError && (
          <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{scanError}</p>
              </div>
            </div>
          </div>
        )}
        
        {isSetup && qrCodeUrl && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code with your authenticator app to set up two-factor authentication.
            </p>
            
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <img src={qrCodeUrl} alt="QR Code for 2FA Setup" className="h-48 w-48" />
              </div>
            </div>
            
            {secretKey && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  If you can't scan the QR code, you can manually enter this key in your authenticator app:
                </p>
                
                <div className="bg-gray-100 px-4 py-2 rounded-md font-mono text-sm">
                  {secretKey}
                </div>
              </div>
            )}
          </div>
        )}
        
        {!isSetup && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Enter the verification code from your authenticator app to continue.
            </p>
          </div>
        )}
        
        {/* Toggle between scan and manual entry */}
        {!isSetup && (
          <div className="mb-4">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={toggleScanMode}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {useScanMode ? (
                  <>
                    <FaKeyboard className="mr-2 h-4 w-4 text-gray-500" />
                    Enter Code Manually
                  </>
                ) : (
                  <>
                    <FaQrcode className="mr-2 h-4 w-4 text-gray-500" />
                    Scan QR Code
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* QR Code Scanner */}
        {!isSetup && useScanMode ? (
          <div className="mb-6">
            <QRCodeScanner onScan={handleScan} onError={handleScanError} />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                maxLength={6}
                pattern="[0-9]*"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
              
              <div className="mt-2 flex justify-between items-center">
                <div className="flex">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-8 mx-1 rounded-full ${
                        index < verificationCode.length ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  ))}
                </div>
                
                {!isSetup && verificationCode.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setVerificationCode('')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex justify-between">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSync className="animate-spin mr-2 h-4 w-4" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuthForm;
