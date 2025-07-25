// src/app/(dashboard)/patient/devices/connect/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Watch, Activity, Heart, Thermometer, Scale } from 'lucide-react';

interface DeviceConnection {
  device_type: string;
  brand: string;
  model: string;
  device_id: string;
  sync_frequency: 'real-time' | 'hourly' | 'daily';
  data_types: string[];
  share_with_providers: boolean;
  share_with_researchers: boolean;
  emergency_alerts: boolean;
}

export default function ConnectDevicePage() {
  const router = useRouter();
  const [connection, setConnection] = useState<DeviceConnection>({
    device_type: '',
    brand: '',
    model: '',
    device_id: '',
    sync_frequency: 'hourly',
    data_types: [],
    share_with_providers: true,
    share_with_researchers: false,
    emergency_alerts: true
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<'select' | 'configure' | 'connect'>('select');

  const deviceTypes = [
    {
      type: 'smartwatch',
      name: 'Smart Watch',
      icon: Watch,
      description: 'Track heart rate, activity, sleep, and more',
      brands: ['Apple Watch', 'Samsung Galaxy Watch', 'Fitbit', 'Garmin', 'Wear OS']
    },
    {
      type: 'fitness_tracker',
      name: 'Fitness Tracker',
      icon: Activity,
      description: 'Monitor daily activity and basic health metrics',
      brands: ['Fitbit', 'Garmin', 'Xiaomi Mi Band', 'WHOOP', 'Oura Ring']
    },
    {
      type: 'heart_monitor',
      name: 'Heart Rate Monitor',
      icon: Heart,
      description: 'Continuous heart rate and rhythm monitoring',
      brands: ['Polar', 'Garmin', 'Wahoo', 'Suunto', 'Medical Devices']
    },
    {
      type: 'blood_pressure',
      name: 'Blood Pressure Monitor',
      icon: Thermometer,
      description: 'Regular blood pressure monitoring',
      brands: ['Omron', 'Welch Allyn', 'A&D Medical', 'Philips', 'iHealth']
    },
    {
      type: 'smart_scale',
      name: 'Smart Scale',
      icon: Scale,
      description: 'Weight, BMI, and body composition tracking',
      brands: ['Withings', 'Fitbit', 'Garmin', 'Tanita', 'Eufy']
    }
  ];

  const dataTypesAvailable = [
    'heart_rate', 'blood_pressure', 'weight', 'sleep_patterns',
    'activity_levels', 'steps', 'calories', 'temperature',
    'blood_oxygen', 'stress_levels', 'medication_reminders'
  ];

  const handleDeviceTypeSelect = (type: string) => {
    setConnection({...connection, device_type: type});
    setConnectionStep('configure');
  };

  const handleDataTypeChange = (dataType: string, checked: boolean) => {
    if (checked) {
      setConnection({
        ...connection,
        data_types: [...connection.data_types, dataType]
      });
    } else {
      setConnection({
        ...connection,
        data_types: connection.data_types.filter(type => type !== dataType)
      });
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Device connected successfully! Your health data will now be automatically synced.');
      router.push('/patient?tab=health');
    } catch (error) {
      console.error('Failed to connect device:', error);
      alert('Failed to connect device. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  if (connectionStep === 'select') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Connect Health Device</h1>
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-green-900 mb-2">Benefits for Rare Disease Patients</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Continuous monitoring helps track disease progression</li>
                <li>• Real-time data sharing with your care team</li>
                <li>• Early detection of health changes or medication side effects</li>
                <li>• Contribute valuable data to rare disease research</li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your Device Type</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deviceTypes.map((device) => {
                const Icon = device.icon;
                return (
                  <div
                    key={device.type}
                    onClick={() => handleDeviceTypeSelect(device.type)}
                    className="border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <Icon className="w-12 h-12 text-blue-600 mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">{device.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{device.description}</p>
                    <div className="text-xs text-gray-500">
                      Popular brands: {device.brands.slice(0, 3).join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedDeviceType = deviceTypes.find(d => d.type === connection.device_type);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Configure {selectedDeviceType?.name}</h1>
            <button
              onClick={() => setConnectionStep('select')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Device Selection
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Brand *
                </label>
                <select
                  value={connection.brand}
                  onChange={(e) => setConnection({...connection, brand: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select brand</option>
                  {selectedDeviceType?.brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  value={connection.model}
                  onChange={(e) => setConnection({...connection, model: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., Series 9, Galaxy Watch 6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device ID (if available)
              </label>
              <input
                type="text"
                value={connection.device_id}
                onChange={(e) => setConnection({...connection, device_id: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Found in device settings or companion app"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Sync Frequency
              </label>
              <select
                value={connection.sync_frequency}
                onChange={(e) => setConnection({...connection, sync_frequency: e.target.value as any})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="real-time">Real-time (recommended for critical conditions)</option>
                <option value="hourly">Every hour</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Data Types to Monitor
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {dataTypesAvailable.map((dataType) => (
                  <label key={dataType} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={connection.data_types.includes(dataType)}
                      onChange={(e) => handleDataTypeChange(dataType, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">
                      {dataType.replace(/_/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-medium text-gray-900 mb-4">Data Sharing Preferences</h4>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={connection.share_with_providers}
                    onChange={(e) => setConnection({...connection, share_with_providers: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">Share data with my healthcare providers</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={connection.share_with_researchers}
                    onChange={(e) => setConnection({...connection, share_with_researchers: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">Contribute anonymized data to rare disease research</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={connection.emergency_alerts}
                    onChange={(e) => setConnection({...connection, emergency_alerts: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">Enable emergency alerts for critical values</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={isConnecting || !connection.brand}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect Device'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}