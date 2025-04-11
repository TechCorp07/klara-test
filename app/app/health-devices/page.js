"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wearables } from '@/lib/services/wearablesService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

export default function HealthDevicesPage() {
  const { user } = useAuth();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });
  const queryClient = useQueryClient();
  
  // Fetch wearable devices
  const { data: devices, isLoading, error } = useQuery({
    queryKey: ['wearableDevices', user?.id],
    queryFn: () => wearables.getWearableDevices(user?.id),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load connected devices');
      console.error('Error fetching devices:', error);
    }
  });
  
  // Fetch Withings profile
  const { data: withingsProfile } = useQuery({
    queryKey: ['withingsProfile'],
    queryFn: () => wearables.getWithingsProfile(),
    enabled: !!user,
    onError: (error) => {
      console.error('Error fetching Withings profile:', error);
      // Don't show error toast as this might be a normal state (not connected yet)
    }
  });
  
  // Fetch wearable data for selected device
  const { data: deviceData, isLoading: isDataLoading } = useQuery({
    queryKey: ['wearableData', selectedDevice?.id, dateRange],
    queryFn: () => wearables.getWearableData(
      user?.id,
      selectedDevice?.data_type,
      dateRange.startDate,
      dateRange.endDate
    ),
    enabled: !!selectedDevice && !!user,
    onError: (error) => {
      toast.error('Failed to load device data');
      console.error('Error fetching device data:', error);
    }
  });
  
  // Mutation for connecting Withings
  const connectWithingsMutation = useMutation({
    mutationFn: () => wearables.connectWithings(),
    onSuccess: (data) => {
      // Redirect to Withings authorization page
      window.location.href = data.authorization_url;
    },
    onError: (error) => {
      toast.error('Failed to connect to Withings');
      console.error('Error connecting to Withings:', error);
    }
  });
  
  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
  };
  
  const handleConnectWithings = () => {
    connectWithingsMutation.mutate();
  };
  
  const handleDateRangeChange = (e, field) => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value
    });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Health Devices</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Health Devices</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading health devices. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Health Devices</h1>
      
      {/* Withings Connection Status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Withings Integration</h2>
        
        {withingsProfile ? (
          <div>
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <p className="text-green-600 font-medium">Connected</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Account</p>
                <p className="font-medium">{withingsProfile.user_email}</p>
              </div>
              <div>
                <p className="text-gray-600">Connected Since</p>
                <p className="font-medium">{new Date(withingsProfile.connected_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Last Sync</p>
                <p className="font-medium">{new Date(withingsProfile.last_sync).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium">{withingsProfile.status}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mr-4"
                onClick={() => wearables.fetchWithingsData(dateRange.startDate, dateRange.endDate)}
              >
                Sync Data
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg">
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-4">Connect your Withings account to sync your health data.</p>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              onClick={handleConnectWithings}
              disabled={connectWithingsMutation.isPending}
            >
              {connectWithingsMutation.isPending ? 'Connecting...' : 'Connect Withings'}
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Devices List */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Connected Devices</h2>
            
            {devices && devices.results && devices.results.length > 0 ? (
              <div className="space-y-4">
                {devices.results.map((device) => (
                  <div 
                    key={device.id} 
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedDevice?.id === device.id 
                        ? 'bg-blue-100 border border-blue-300' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                    onClick={() => handleDeviceSelect(device)}
                  >
                    <p className="font-medium">{device.name}</p>
                    <p className="text-sm text-gray-600">
                      {device.device_type}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <p className="text-xs text-gray-500">Connected</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No devices connected yet.</p>
            )}
          </div>
        </div>
        
        {/* Device Data */}
        <div className="md:col-span-2">
          {selectedDevice ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedDevice.name} Data
              </h2>
              
              {/* Date range selector */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange(e, 'startDate')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange(e, 'endDate')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                    onClick={() => queryClient.invalidateQueries(['wearableData', selectedDevice.id, dateRange])}
                  >
                    Apply
                  </button>
                </div>
              </div>
              
              {isDataLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : deviceData && deviceData.results && deviceData.results.length > 0 ? (
                <div>
                  {/* Data visualization would go here */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Data Summary</p>
                    <p className="text-sm text-gray-600">
                      {deviceData.results.length} data points collected between {dateRange.startDate} and {dateRange.endDate}
                    </p>
                  </div>
                  
                  {/* Data table */}
                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Metric
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {deviceData.results.slice(0, 10).map((dataPoint, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(dataPoint.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {dataPoint.metric_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {dataPoint.value}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {dataPoint.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {deviceData.results.length > 10 && (
                      <div className="py-3 flex items-center justify-center">
                        <p className="text-sm text-gray-500">
                          Showing 10 of {deviceData.results.length} records
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No data available for the selected date range.</p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-full">
              <p className="text-gray-500">Select a device to view data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
