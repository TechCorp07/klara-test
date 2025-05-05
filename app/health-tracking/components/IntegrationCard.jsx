"use client";

export default function IntegrationCard({
  name,
  type,
  status,
  connectedAt,
  lastSync,
  onSync,
  onDisconnect
}) {
  // Get logo and colors based on device type
  const getDeviceIcon = () => {
    const typeLower = type.toLowerCase();
    
    const icons = {
      'fitbit': 'F',
      'apple_health': 'A',
      'garmin': 'G',
      'samsung_health': 'S',
      'withings': 'W',
      'google_fit': 'G',
      'oura': 'O',
      'whoop': 'W'
    };
    
    const colors = {
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
    
    return {
      letter: icons[typeLower] || name.charAt(0),
      colorClasses: colors[typeLower] || colors.default
    };
  };
  
  const { letter, colorClasses } = getDeviceIcon();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-10 w-10 rounded-md ${colorClasses} flex items-center justify-center`}>
            <span className="text-lg font-semibold">
              {letter}
            </span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">{name}</h3>
            <div className="flex items-center mt-1">
              <div className={`w-2 h-2 ${status === 'active' ? 'bg-green-500' : 'bg-yellow-500'} rounded-full mr-2`}></div>
              <p className="text-xs text-gray-500 capitalize">{status}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div>
          <p className="text-gray-500">Connected Since</p>
          <p className="font-medium">{new Date(connectedAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Last Sync</p>
          <p className="font-medium">{lastSync ? new Date(lastSync).toLocaleString() : 'Never'}</p>
        </div>
      </div>
      
      <div className="flex justify-between space-x-2">
        <button
          onClick={onSync}
          className="flex-1 text-xs py-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors"
        >
          Sync Now
        </button>
        <button
          onClick={onDisconnect}
          className="flex-1 text-xs py-1 px-2 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}