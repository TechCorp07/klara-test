// src/app/(dashboard)/patient/components/dashboard/SmartWatchDataWidget.tsx
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
          return (
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L13 5v10l-3 3-3-3V5l3-3z" />
              </svg>
            </div>
          );
        case 'fitbit':
          return (
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
              </svg>
            </div>
          );
        case 'garmin':
          return (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
              </svg>
            </div>
          );
        default:
          return (
            <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
          );
      }
    };
  
    const formatLastSync = (lastSync: string) => {
      const now = new Date();
      const syncTime = new Date(lastSync);
      const diffMinutes = Math.floor((now.getTime() - syncTime.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
      return `${Math.floor(diffMinutes / 1440)}d ago`;
    };
  
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Smart Watch Data</h3>
          {wearableData.connected_devices.length === 0 && (
            <button
              onClick={onConnectDevice}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Connect Device
            </button>
          )}
        </div>
  
        {wearableData.connected_devices.length > 0 ? (
          <>
            {/* Connected Devices */}
            <div className="space-y-3 mb-6">
              {wearableData.connected_devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(device.type)}
                    <div>
                      <div className="font-medium text-gray-900">{device.name}</div>
                      <div className="text-sm text-gray-600">
                        Last sync: {formatLastSync(device.last_sync)}
                      </div>
                    </div>
                  </div>
                  {device.battery_level && (
                    <div className={`text-sm ${device.battery_level > 20 ? 'text-green-600' : 'text-red-600'}`}>
                      {device.battery_level}%
                    </div>
                  )}
                </div>
              ))}
            </div>
  
            {/* Today's Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{wearableData.today_summary.steps.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{wearableData.today_summary.heart_rate_avg}</div>
                <div className="text-sm text-gray-600">Avg HR</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{wearableData.today_summary.sleep_hours}h</div>
                <div className="text-sm text-gray-600">Sleep</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{wearableData.today_summary.active_minutes}</div>
                <div className="text-sm text-gray-600">Active Min</div>
              </div>
            </div>
  
            {/* Medication Reminders */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">Medication Reminders</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{wearableData.medication_reminders_sent} today</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Connect Your Smart Watch</h4>
            <p className="text-gray-600 mb-4">
              Connect your smart watch to track medication adherence, vital signs, and health metrics.
            </p>
            <button
              onClick={onConnectDevice}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect Device
            </button>
          </div>
        )}
      </div>
    );
  }