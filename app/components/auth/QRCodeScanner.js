// File: /components/auth/QRCodeScanner.js

import { useState, useEffect } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/browser';
import { FaCamera, FaExclamationTriangle, FaCheck, FaSync } from 'react-icons/fa';

const QRCodeScanner = ({ onScan, onError }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [videoInputDevices, setVideoInputDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [reader, setReader] = useState(null);
  
  // Initialize the QR code reader
  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    
    const codeReader = new BrowserMultiFormatReader(hints);
    setReader(codeReader);
    
    // Get available video devices
    codeReader.listVideoInputDevices()
      .then((devices) => {
        setVideoInputDevices(devices);
        
        // Select the first device by default
        if (devices.length > 0) {
          setSelectedDeviceId(devices[0].deviceId);
        }
      })
      .catch((err) => {
        console.error('Error listing video devices:', err);
        setScanError('Unable to access camera. Please ensure camera permissions are granted.');
        if (onError) onError(err);
      });
    
    // Cleanup on unmount
    return () => {
      if (reader) {
        reader.reset();
      }
    };
  }, []);
  
  // Start scanning when device is selected
  useEffect(() => {
    if (!reader || !selectedDeviceId) return;
    
    const startScanning = async () => {
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
              // Ignore TypeError as it's thrown when no QR code is detected
              console.error('Error scanning QR code:', error);
            }
          }
        );
      } catch (err) {
        console.error('Error starting QR code scanner:', err);
        setScanError('Failed to start QR code scanner. Please try again.');
        setScanning(false);
        if (onError) onError(err);
      }
    };
    
    startScanning();
    
    // Cleanup on device change
    return () => {
      if (reader) {
        reader.reset();
      }
    };
  }, [selectedDeviceId, reader]);
  
  // Handle device selection change
  const handleDeviceChange = (e) => {
    setSelectedDeviceId(e.target.value);
  };
  
  // Handle retry
  const handleRetry = () => {
    setScanSuccess(false);
    setScanError(null);
    
    // Reset the reader and start scanning again
    if (reader) {
      reader.reset();
      
      // Small delay to ensure reset is complete
      setTimeout(() => {
        if (selectedDeviceId) {
          reader.decodeFromVideoDevice(
            selectedDeviceId,
            'qr-video',
            (result, error) => {
              if (result) {
                setScanSuccess(true);
                setScanning(false);
                
                if (onScan) onScan(result.getText());
                
                reader.reset();
              }
              
              if (error && !(error instanceof TypeError)) {
                console.error('Error scanning QR code:', error);
              }
            }
          );
        }
      }, 100);
    }
  };
  
  return (
    <div className="qr-scanner">
      <div className="mb-4">
        <label htmlFor="video-device" className="block text-sm font-medium text-gray-700 mb-1">
          Camera
        </label>
        <select
          id="video-device"
          value={selectedDeviceId}
          onChange={handleDeviceChange}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          disabled={scanning && !scanError}
        >
          {videoInputDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${videoInputDevices.indexOf(device) + 1}`}
            </option>
          ))}
          {videoInputDevices.length === 0 && (
            <option value="">No cameras available</option>
          )}
        </select>
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
          ></video>
          
          {/* Scanning overlay */}
          {scanning && !scanError && !scanSuccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30">
              <div className="animate-pulse mb-2">
                <FaCamera className="h-8 w-8 text-white" />
              </div>
              <p className="text-white text-sm font-medium">Scanning QR Code...</p>
            </div>
          )}
          
          {/* Success overlay */}
          {scanSuccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500 bg-opacity-30">
              <div className="mb-2">
                <FaCheck className="h-8 w-8 text-white" />
              </div>
              <p className="text-white text-sm font-medium">QR Code Scanned Successfully!</p>
            </div>
          )}
          
          {/* Error overlay */}
          {scanError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500 bg-opacity-30">
              <div className="mb-2">
                <FaExclamationTriangle className="h-8 w-8 text-white" />
              </div>
              <p className="text-white text-sm font-medium">{scanError}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaSync className="mr-1 h-4 w-4" />
                Retry
              </button>
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
