// src/app/(dashboard)/patient/components/dashboard/SmartWatchDataWidget.tsx
import React from 'react';
import { Watch, Battery, Wifi, Smartphone, Activity, TrendingUp } from 'lucide-react';

interface SmartWatchDataProps {
  wearableData: {
    connected_devices: Array<{
      id: number;
      type: 'fitbit' | 'apple_watch' | 'garmin' | 'other';
      name: string;
      last_sync: string;
      battery_level?: number;
    }>;
    today_summary: {
      steps: number;
      heart_rate_avg: number;
      sleep_hours: number;
      active_minutes: number;
    };
    medication_reminders_sent: number;
  };
  onConnectDevice: () => void;
}

export function SmartWatchDataWidget({ wearableData, onConnectDevice }: SmartWatchDataProps) {
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'apple_watch':
        return '⌚';
      case 'fitbit':
        return '📱';
      case 'garmin':
        return '⌚';
      default:
        return '📱';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatLastSync = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 5) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const hasConnectedDevices = wearableData.connected_devices.length > 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Watch className="w-5 h-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Smart Watch Data</h3>
        </div>
        {!hasConnectedDevices && (
          <button
            onClick={onConnectDevice}
            className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            Connect
          </button>
        )}
      </div>

      {hasConnectedDevices ? (
        <div className="space-y-4">
          {/* Connected Devices */}
          <div className="space-y-2">
            {wearableData.connected_devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getDeviceIcon(device.type)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{device.name}</div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="flex items-center">
                        <Wifi className="w-3 h-3 text-green-600 mr-1" />
                        <span>Connected</span>
                      </div>
                      <span className="mx-2">•</span>
                      <span>{formatLastSync(device.last_sync)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {device.battery_level && (
                    <div className="flex items-center">
                      <Battery className={`w-4 h-4 ${getBatteryColor(device.battery_level)} mr-1`} />
                      <span className={`text-sm ${getBatteryColor(device.battery_level)}`}>
                        {device.battery_level}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Today's Activity Summary */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Today's Activity</h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Steps */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">Steps</span>
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {wearableData.today_summary.steps.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">steps taken</div>
              </div>

              {/* Heart Rate */}
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">Avg Heart Rate</span>
                  <Activity className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {wearableData.today_summary.heart_rate_avg}
                </div>
                <div className="text-xs text-gray-600">bpm</div>
              </div>

              {/* Active Minutes */}
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">Active Minutes</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {wearableData.today_summary.active_minutes}
                </div>
                <div className="text-xs text-gray-600">minutes</div>
              </div>

              {/* Sleep */}
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">Sleep</span>
                  <span className="text-purple-600">😴</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {wearableData.today_summary.sleep_hours}h
                </div>
                <div className="text-xs text-gray-600">last night</div>
              </div>
            </div>
          </div>

          {/* Medication Reminders Summary */}
          <div className="border-t border-gray-200 pt-3">
            <h4 className="font-medium text-gray-900 mb-2">Health Monitoring</h4>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Medication Reminders</div>
                  <div className="text-xs text-gray-600">Sent today via smartwatch</div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {wearableData.medication_reminders_sent}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Smartphone className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm mb-2">No wearable devices connected</p>
          <p className="text-xs text-gray-400 mb-4">
            Connect your smartwatch to enable automated health monitoring and medication reminders
          </p>
          <button
            onClick={onConnectDevice}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Connect Device
          </button>
        </div>
      )}
    </div>
  );
}