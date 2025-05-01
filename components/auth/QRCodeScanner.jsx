// components/auth/QRCodeScanner.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/browser';
import { FaCamera, FaExclamationTriangle, FaCheck, FaSync } from 'react-icons/fa';

/**
 * QR Code Scanner component with enhanced error handling and accessibility
 * @param {Object} props
 * @param {Function} props.onScan - Callback when a QR code is successfully scanned
 * @param {Function} props.onError - Callback when an error occurs
 * @param {boolean} props.autoStart - Whether to start scanning automatically 
 */
const QRCodeScanner = ({ onScan, onError, autoStart = true }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [videoInputDevices, setVideoInputDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [reader, setReader] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Initialize the QR code reader
  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    
    const codeReader = new BrowserMultiFormatReader(hints);
    setReader(codeReader);
    
    // Get available video devices
    const getVideoDevices = async () => {
      try {
        const devices = await codeReader.listVideoInputDevices();
        setVideoInputDevices(devices);
        
        // Select the first device by default
        if (devices.length > 0) {
          setSelectedDeviceId(devices[0].deviceId);
        }
      } catch (err) {
        console.error('Error listing video devices:', err);
        
        // Check if permission was denied
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionDenied(true);
          setScanError('Camera access denied. Please grant camera permissions to scan QR codes.');
        } else {
          setScanError('Unable to access camera. Please ensure camera permissions are granted.');
        }
        
        if (onError) onError(err);
      }
    };
    
    getVideoDevices();
    
    // Cleanup on unmount
    return () => {
      if (reader) {
        reader.reset();
      }
    };
  }, []);
  
  // Start scanning when device is selected and autoStart is true
  useEffect(() => {
    if (!reader || !selectedDeviceId || !autoStart) return;
    
    startScanning();
    
    // Cleanup on device change
    return () => {
      if (reader) {
        reader.reset();
      }
    };
  }, [selectedDeviceId, reader, autoStart]);
  
  // Start scanning function
  const startScanning = useCallback(async () => {
    if (!reader || !selectedDeviceId) return;
    
    try {
      setScanning(true);
      setScanSuccess(false);
      setScanError(null);
      
      // Start decoding from video device
      await reader.decodeFromVideoDevice(
        selectedDeviceId,
        'qr-video',
        (result, error) => {
          if (result) {
            // QR code detected
            setScanSuccess(true);
            setScanning(false);
            
            // Call the onScan callback with the result
            if (onScan) onScan(result.getText());
            
            // Reset the reader
            reader.reset();
          }
          
          if (error && !(error instanceof TypeError)) {
            // Ignore TypeErrors thrown when no QR code is detected
            console.error('Error scanning QR code:', error);
          }
        }
      );
    } catch (err) {
      console.error('Error starting QR code scanner:', err);
      
      // Handle permission errors
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setScanError('Camera access denied. Please grant camera permissions to scan QR codes.');
      } else {
        setScanError('Failed to start QR code scanner. Please try again.');
      }
      
      setScanning(false);
      if (onError) onError(err);
    }
  }, [reader, selectedDeviceId, onScan, onError]);
  
  // Handle device selection change
  const handleDeviceChange = (e) => {
    setSelectedDeviceId(e.target.value);
  };
  
  // Handle manual scan start
  const handleStartScan = () => {
    if (!scanning) {
      startScanning();
    }
  };
  
  // Handle retry
  const handleRetry = () => {
    setScanSuccess(false);
    setScanError(null);
    setPermissionDenied(false);
    
    // Reset the reader and start scanning again
    if (reader) {
      reader.reset();
      
      // Small delay to ensure reset is complete
      setTimeout(() => {
        startScanning();
      }, 100);
    }
  };
  
  return (
    <div className="qr-scanner">
      <div className="mb-4">
        <label htmlFor="video-device" className="block text-sm font-medium text-gray-700 mb-1">
          Camera
        </label>
        <div className="flex space-x-2">
          <select
            id="video-device"
            value={selectedDeviceId}
            onChange={handleDeviceChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            disabled={scanning && !scanError}
          >
            {videoInputDevices.length === 0 && (
              <option value="">No cameras available</option>
            )}
            {videoInputDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${videoInputDevices.indexOf(device) + 1}`}
              </option>
            ))}
          </select>
          
          {!autoStart && !scanning && !scanSuccess && !scanError && (
            <button
              type="button"
              onClick={handleStartScan}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={!selectedDeviceId || videoInputDevices.length === 0}
            >
              <FaCamera className="mr-2 h-4 w-4" />
              Start Scan
            </button>
          )}
        </div>
      </div>
      
      <div className="relative">
        {/* Video element for QR code scanning */}
        <div className={`relative overflow-hidden rounded-lg border-2 ${
          scanSuccess ? 'border-green-500' : 
          scanError ? 'border-red-500' : 
          'border-gray-300'
        }`}>
          <video
            id="qr-video"
            className="w-full h-64 object-cover"
            muted
            playsInline
            aria-label="QR code scanner camera view"
          ></video>
          
          {/* Scanning overlay */}
          {scanning && !scanError && !scanSuccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30">
              <div className="animate-pulse mb-2">
                <FaCamera className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <p className="text-white text-sm font-medium" aria-live="polite">Scanning QR Code...</p>
            </div>
          )}
          
          {/* Success overlay */}
          {scanSuccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500 bg-opacity-30">
              <div className="mb-2">
                <FaCheck className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <p className="text-white text-sm font-medium" aria-live="polite">QR Code Scanned Successfully!</p>
            </div>
          )}
          
          {/* Error overlay */}
          {scanError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500 bg-opacity-30">
              <div className="mb-2">
                <FaExclamationTriangle className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <p className="text-white text-sm font-medium" aria-live="assertive">{scanError}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                aria-label="Retry scanning"
              >
                <FaSync className="mr-1 h-4 w-4" aria-hidden="true" />
                Retry
              </button>
            </div>
          )}
          
          {/* Permission denied guidance */}
          {permissionDenied && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-md border border-yellow-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Camera access required</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Please follow these steps to enable camera access:</p>
                    <ol className="list-decimal pl-5 mt-1 space-y-1">
                      <li>Click the camera icon in your browser's address bar</li>
                      <li>Select "Allow" for camera access</li>
                      <li>Refresh the page</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="mt-2 text-sm text-gray-600">
          <p>Position the QR code within the camera view to scan.</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;