// src/app/(dashboard)/patient/components/dashboard/SmartWatchDataWidget.tsx
import { useEffect, useState } from 'react';
import { patientService } from '@/lib/api/services/patient.service';
import { useCommonDashboard } from '@/app/(dashboard)/_shared/hooks/useCommonDashboard';
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
  const [samsungIntegration, setSamsungIntegration] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useCommonDashboard();

  const loadWatchData = async () => {
    // This function can be used to refresh the main wearable data if needed
    // For now, it's just a placeholder since wearableData comes from props
    try {
      // Could potentially refresh the parent component's data here
      console.log('Loading watch data...');
    } catch (error) {
      console.error('Failed to load watch data:', error);
    }
  };

  const loadSamsungStatus = async () => {
    try {
      const devices = await patientService.getWearableDevices();
      const samsung = devices.find((i: any) => i.integration_type === 'samsung_health');
      setSamsungIntegration(samsung);
    } catch (error) {
      console.error('Failed to load Samsung status:', error);
    }
  };

  const handleSamsungSync = async () => {
    try {
      setLoading(true);
      const result = await patientService.syncWearableData('samsung_health');
      showToast(`Synced ${result.measurements_synced} measurements from Samsung Watch.`, 'success');
      // Reload data after sync
      loadSamsungStatus();
    } catch (error) {
      showToast("Failed to sync Samsung data. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchData();
    loadSamsungStatus();
  }, []);

  const safeWearableData = {
    connected_devices: wearableData?.connected_devices || [],
    today_summary: wearableData?.today_summary || {
      steps: 0,
      heart_rate_avg: 0,
      sleep_hours: 0,
      active_minutes: 0
    },
    medication_reminders_sent: wearableData?.medication_reminders_sent || 0
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'apple_watch':
        return '⌚';
      case 'fitbit':
        return '📱';
      case 'garmin':
        return '⌚';
      case 'samsung_health':
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

  // Include Samsung when checking for connected devices
  const hasConnectedDevices = safeWearableData.connected_devices.length > 0 || samsungIntegration?.status === 'connected';

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
            {/* Include Samsung if connected */}
            {samsungIntegration?.status === 'connected' && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⌚</span>
                  <div>
                    <div className="font-medium text-gray-900">Samsung Galaxy Watch</div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="flex items-center">
                        <Wifi className="w-3 h-3 text-green-600 mr-1" />
                        <span>Connected</span>
                      </div>
                      <span className="mx-2">•</span>
                      <span>{samsungIntegration.last_sync ? formatLastSync(samsungIntegration.last_sync) : 'Never'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSamsungSync}
                    disabled={loading}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Syncing...' : 'Sync'}
                  </button>
                </div>
              </div>
            )}

            {/* Existing connected devices */}
            {safeWearableData.connected_devices.map((device) => (
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
            <h4 className="font-medium text-gray-900 mb-3">Today&apos;s Activity</h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Steps */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">Steps</span>
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {safeWearableData.today_summary.steps.toLocaleString()}
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
                  {safeWearableData.today_summary.heart_rate_avg}
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
                  {safeWearableData.today_summary.active_minutes}
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
                  {safeWearableData.today_summary.sleep_hours}h
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
                  {safeWearableData.medication_reminders_sent}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No devices connected */
        <div className="text-center py-6 text-gray-500">
          <Smartphone className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm mb-2">No wearable devices connected</p>
          <p className="text-xs text-gray-400 mb-4">
            Connect your Samsung Watch or other devices to enable automated health monitoring and medication reminders
          </p>
          
          {/* Show Samsung connection status */}
          {samsungIntegration && samsungIntegration.status !== 'connected' ? (
            <div className="mb-4 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
              Samsung Watch: {samsungIntegration.status}
            </div>
          ) : null}
          
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