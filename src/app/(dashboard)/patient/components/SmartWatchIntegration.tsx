import { enhancedPatientService } from "@/lib/api/services/patient.service";
import { useState } from "react";

// src/app/(dashboard)/patient/components/SmartWatchIntegration.tsx
interface SmartWatchIntegrationProps {
    onConnect: () => void;
  }
  
  export function SmartWatchIntegration({ onConnect }: SmartWatchIntegrationProps) {
    const [availableDevices, setAvailableDevices] = useState([
      { type: 'apple_watch', name: 'Apple Watch', supported: true, icon: '⌚' },
      { type: 'fitbit', name: 'Fitbit', supported: true, icon: '📱' },
      { type: 'garmin', name: 'Garmin', supported: true, icon: '⌚' },
      { type: 'samsung', name: 'Samsung Galaxy Watch', supported: true, icon: '⌚' },
      { type: 'other', name: 'Other Device', supported: false, icon: '📟' }
    ]);
  
    const [connecting, setConnecting] = useState<string | null>(null);
  
    const connectDevice = async (deviceType: string) => {
      try {
        setConnecting(deviceType);
        const result = await enhancedPatientService.connectWearableDevice(deviceType);
        
        if (result.authorization_url) {
          // Open authorization URL in new window
          window.open(result.authorization_url, '_blank', 'width=600,height=600');
        }
        
        onConnect();
      } catch (error) {
        console.error('Failed to connect device:', error);
        alert('Failed to connect device. Please try again.');
      } finally {
        setConnecting(null);
      }
    };
  
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Smart Watch</h3>
          <p className="text-gray-600">
            Connect your wearable device to automatically track medication reminders, 
            vital signs, and health metrics for your rare disease management.
          </p>
        </div>
  
        <div className="space-y-3">
          {availableDevices.map((device) => (
            <div key={device.type} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{device.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{device.name}</div>
                    <div className="text-sm text-gray-600">
                      {device.supported ? 'Fully supported' : 'Limited support'}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => connectDevice(device.type)}
                  disabled={!device.supported || connecting === device.type}
                  className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                    device.supported
                      ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {connecting === device.type ? 'Connecting...' : 
                   device.supported ? 'Connect' : 'Coming Soon'}
                </button>
              </div>
  
              {device.supported && (
                <div className="mt-3 text-sm text-gray-600">
                  <p className="font-medium mb-1">Features:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Medication reminders with haptic feedback</li>
                    <li>• Heart rate and activity monitoring</li>
                    <li>• Sleep quality tracking</li>
                    <li>• Emergency contact notifications</li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
  
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">Privacy & Security</h4>
              <p className="text-xs text-blue-700">
                Your health data is encrypted and only shared with your healthcare providers 
                with your explicit consent. You can revoke access at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }