"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

/**
 * Constants for wearable device types
 * Each wearable has an id, name, logo path, and description
 */
const WEARABLE_TYPES = [
  { id: 'fitbit', name: 'Fitbit', logo: '/images/wearables/fitbit.png', description: 'Connect your Fitbit device to track steps, heart rate, sleep, and more.' },
  { id: 'apple_health', name: 'Apple Health', logo: '/images/wearables/apple-health.png', description: 'Sync data from your Apple Watch and Apple Health app.' },
  { id: 'garmin', name: 'Garmin', logo: '/images/wearables/garmin.png', description: 'Connect your Garmin device to track activities, heart rate, and sleep.' },
  { id: 'samsung_health', name: 'Samsung Health', logo: '/images/wearables/samsung-health.png', description: 'Sync data from your Samsung Galaxy Watch and Samsung Health app.' },
  { id: 'withings', name: 'Withings', logo: '/images/wearables/withings.png', description: 'Connect your Withings devices for weight, blood pressure, and activity tracking.' },
  { id: 'google_fit', name: 'Google Fit', logo: '/images/wearables/google-fit.png', description: 'Sync data from Google Fit and compatible devices.' },
  { id: 'oura', name: 'Oura Ring', logo: '/images/wearables/oura.png', description: 'Connect your Oura Ring to track sleep, readiness, and activity.' },
  { id: 'whoop', name: 'WHOOP', logo: '/images/wearables/whoop.png', description: 'Connect your WHOOP strap to track recovery, strain, and sleep.' }
];

/**
 * Client component for wearables page
 * Allows users to connect, manage, and sync wearable health devices
 */
export default function WearablesClient() {
  // Authentication context
  const { user } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [connectedWearables, setConnectedWearables] = useState([]);
  const [selectedWearable, setSelectedWearable] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch connected wearables on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // This would be replaced with actual API call
        // Simulating API response with setTimeout
        setTimeout(() => {
          setConnectedWearables([
            { id: 'fitbit', name: 'Fitbit', connected_at: '2023-04-10T14:30:00Z', last_sync: '2023-04-15T08:45:00Z', status: 'active' }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching connected wearables:', error);
        toast.error('Failed to load connected wearables');
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  /**
   * Event handler for wearable device selection
   */
  const handleWearableSelect = (e) => {
    setSelectedWearable(e.target.value);
  };

  /**
   * Event handler for connecting a wearable device
   */
  const handleConnect = async () => {
    if (!selectedWearable) {
      toast.warning('Please select a wearable device to connect');
      return;
    }

    setIsConnecting(true);
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const selectedWearableDetails = WEARABLE_TYPES.find(w => w.id === selectedWearable);
      
      // Check if already connected
      if (connectedWearables.some(w => w.id === selectedWearable)) {
        toast.info(`Your ${selectedWearableDetails.name} is already connected`);
      } else {
        // Add to connected wearables
        const newWearable = {
          id: selectedWearable,
          name: selectedWearableDetails.name,
          connected_at: new Date().toISOString(),
          last_sync: new Date().toISOString(),
          status: 'active'
        };
        
        setConnectedWearables([...connectedWearables, newWearable]);
        toast.success(`Successfully connected to ${selectedWearableDetails.name}`);
      }
      
      setSelectedWearable('');
    } catch (error) {
      console.error('Error connecting wearable:', error);
      toast.error('Failed to connect wearable device');
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Event handler for disconnecting a wearable device
   */
  const handleDisconnect = async (wearableId) => {
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove from connected wearables
      setConnectedWearables(connectedWearables.filter(w => w.id !== wearableId));
      
      const wearableName = WEARABLE_TYPES.find(w => w.id === wearableId)?.name;
      toast.success(`Successfully disconnected ${wearableName}`);
    } catch (error) {
      console.error('Error disconnecting wearable:', error);
      toast.error('Failed to disconnect wearable device');
    }
  };

  /**
   * Event handler for syncing data from a wearable device
   */
  const handleSync = async (wearableId) => {
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update last sync time
      setConnectedWearables(connectedWearables.map(w => {
        if (w.id === wearableId) {
          return { ...w, last_sync: new Date().toISOString() };
        }
        return w;
      }));
      
      const wearableName = WEARABLE_TYPES.find(w => w.id === wearableId)?.name;
      toast.success(`Successfully synced data from ${wearableName}`);
    } catch (error) {
      console.error('Error syncing wearable:', error);
      toast.error('Failed to sync wearable data');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Wearable Devices</h1>
        <p className="text-gray-600">Connect and manage your wearable health devices</p>
      </div>
      
      {/* Connect New Wearable Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Connect a New Wearable Device</h3>
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="w-full md:w-2/3">
            <label htmlFor="wearable-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Wearable Device
            </label>
            <select
              id="wearable-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={selectedWearable}
              onChange={handleWearableSelect}
              disabled={isConnecting}
            >
              <option value="">Select a wearable device...</option>
              {WEARABLE_TYPES.map((wearable) => (
                <option key={wearable.id} value={wearable.id}>
                  {wearable.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-1/3">
            <button
              type="button"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConnect}
              disabled={!selectedWearable || isConnecting}
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                'Connect Device'
              )}
            </button>
          </div>
        </div>
        
        {/* Selected Wearable Details */}
        {selectedWearable && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 text-lg font-semibold">
                  {WEARABLE_TYPES.find(w => w.id === selectedWearable)?.name.charAt(0)}
                </span>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">
                  {WEARABLE_TYPES.find(w => w.id === selectedWearable)?.name}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {WEARABLE_TYPES.find(w => w.id === selectedWearable)?.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Connected Wearables Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Connected Wearable Devices
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage your connected wearable devices and sync health data
          </p>
        </div>
        
        {loading ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <svg className="animate-spin mx-auto h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-500">Loading connected devices...</p>
          </div>
        ) : connectedWearables.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500">No wearable devices connected</p>
            <p className="mt-1 text-sm text-gray-500">Select a device above to connect your first wearable</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Connected Since
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sync
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {connectedWearables.map((wearable) => (
                  <tr key={wearable.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 text-lg font-semibold">
                            {wearable.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {wearable.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(wearable.connected_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(wearable.last_sync).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {wearable.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleSync(wearable.id)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Sync Now
                      </button>
                      <button
                        onClick={() => handleDisconnect(wearable.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Disconnect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Health Data Summary Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Health Data from Wearables
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Steps Today</h4>
            <p className="mt-1 text-3xl font-semibold text-gray-900">8,432</p>
            <div className="mt-1 flex items-center">
              <span className="text-green-500 text-sm font-medium">+12%</span>
              <span className="ml-1 text-sm text-gray-500">from yesterday</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Heart Rate</h4>
            <p className="mt-1 text-3xl font-semibold text-gray-900">72 bpm</p>
            <div className="mt-1 flex items-center">
              <span className="text-gray-500 text-sm">Resting</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Sleep</h4>
            <p className="mt-1 text-3xl font-semibold text-gray-900">7h 12m</p>
            <div className="mt-1 flex items-center">
              <span className="text-yellow-500 text-sm font-medium">-45m</span>
              <span className="ml-1 text-sm text-gray-500">from average</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Minutes</h4>
            <p className="mt-1 text-3xl font-semibold text-gray-900">42</p>
            <div className="mt-1 flex items-center">
              <span className="text-green-500 text-sm font-medium">+8</span>
              <span className="ml-1 text-sm text-gray-500">from yesterday</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            View Detailed Health Data
          </button>
        </div>
      </div>
      
      {/* Supported Devices Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Supported Wearable Devices
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WEARABLE_TYPES.map((wearable) => (
            <div key={wearable.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center h-12 mb-4">
                <div className="h-10 w-10 rounded-md bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 text-lg font-semibold">
                    {wearable.name.charAt(0)}
                  </span>
                </div>
              </div>
              <h4 className="text-center text-sm font-medium text-gray-900">{wearable.name}</h4>
              <p className="mt-2 text-xs text-gray-500 text-center">{wearable.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
