"use client";

import { useState } from 'react';

export default function ConnectDevice({ wearableTypes, onConnect, isPending }) {
  const [selectedWearable, setSelectedWearable] = useState('');
  
  const handleWearableSelect = (e) => {
    setSelectedWearable(e.target.value);
  };
  
  const handleConnect = async () => {
    if (!selectedWearable) {
      return;
    }
    
    try {
      // Just pass the device type id to the parent handler
      await onConnect(selectedWearable);
      
      // Only clear selection if not redirecting (for mobile apps)
      const selectedDevice = wearableTypes.find(w => w.id === selectedWearable);
      if (selectedDevice?.mobileOnly) {
        setSelectedWearable('');
      }
    } catch (error) {
      console.error('Error connecting device:', error);
    }
  };
  
  // Get device-specific connection details
  const getConnectionDetails = (deviceId) => {
    const device = wearableTypes.find(w => w.id === deviceId);
    if (!device) return null;
    
    if (device.mobileOnly) {
      return {
        type: 'mobile',
        buttonText: 'View Instructions',
        description: `This device requires our mobile app to sync data. ${device.description}`
      };
    } else if (device.oauth) {
      return {
        type: 'oauth',
        buttonText: 'Connect',
        description: device.description
      };
    }
    
    return {
      type: 'standard',
      buttonText: 'Connect',
      description: device.description
    };
  };
  
  const connectionDetails = selectedWearable ? getConnectionDetails(selectedWearable) : null;
  
  // Colors based on device type
  const getDeviceColor = (deviceId) => {
    const colorMap = {
      'fitbit': 'bg-blue-100 text-blue-600',
      'apple_health': 'bg-red-100 text-red-600',
      'garmin': 'bg-green-100 text-green-600',
      'samsung_health': 'bg-purple-100 text-purple-600',
      'withings': 'bg-gray-100 text-gray-600',
      'google_fit': 'bg-yellow-100 text-yellow-600',
      'oura': 'bg-indigo-100 text-indigo-600',
      'whoop': 'bg-teal-100 text-teal-600',
      'default': 'bg-blue-100 text-blue-600'
    };
    
    return colorMap[deviceId] || colorMap.default;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Connect a New Device</h2>
      
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="w-full md:w-2/3">
          <label htmlFor="wearable-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Wearable Device
          </label>
          <select
            id="wearable-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedWearable}
            onChange={handleWearableSelect}
            disabled={isPending}
          >
            <option value="">Select a wearable device...</option>
            {wearableTypes.map((wearable) => (
              <option key={wearable.id} value={wearable.id}>
                {wearable.name}
                {wearable.mobileOnly ? ' (Mobile App)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/3">
          <button
            type="button"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleConnect}
            disabled={!selectedWearable || isPending}
          >
            {isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : connectionDetails ? connectionDetails.buttonText : 'Connect Device'}
          </button>
        </div>
      </div>
      
      {/* Selected Wearable Details */}
      {selectedWearable && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <div className="flex items-start">
            <div className={`flex-shrink-0 h-10 w-10 rounded-md ${getDeviceColor(selectedWearable)} flex items-center justify-center`}>
              <span className="text-lg font-semibold">
                {wearableTypes.find(w => w.id === selectedWearable)?.name.charAt(0)}
              </span>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-900">
                {wearableTypes.find(w => w.id === selectedWearable)?.name}
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                {connectionDetails?.description}
              </p>
              
              {/* Special instructions for mobile apps */}
              {connectionDetails?.type === 'mobile' && (
                <ul className="mt-2 text-xs text-gray-600 space-y-1 list-disc pl-4">
                  <li>Download our mobile app from the App Store or Google Play</li>
                  <li>Log in with your account</li>
                  <li>Navigate to "Health Devices" in the app</li>
                  <li>Follow the in-app instructions to connect your device</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Supported Devices Section */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Supported Wearable Devices
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wearableTypes.map((wearable) => (
            <div 
              key={wearable.id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedWearable(wearable.id)}
            >
              <div className="flex items-center justify-center h-12 mb-4">
                <div className={`h-10 w-10 rounded-md ${getDeviceColor(wearable.id)} flex items-center justify-center`}>
                  <span className="text-lg font-semibold">
                    {wearable.name.charAt(0)}
                  </span>
                </div>
              </div>
              <h4 className="text-center text-sm font-medium text-gray-900">
                {wearable.name}
                {wearable.mobileOnly && (
                  <span className="ml-1 text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                    Mobile
                  </span>
                )}
              </h4>
              <p className="mt-2 text-xs text-gray-500 text-center line-clamp-2">{wearable.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}