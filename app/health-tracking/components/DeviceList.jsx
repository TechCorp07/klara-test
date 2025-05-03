"use client"

export default function DeviceList({ devices, selectedDevice, onDeviceSelect, onDisconnect, onSync }) {
  if (!devices || devices.length === 0) {
    return (
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Connected Devices</h2>
          <p className="text-gray-500">No devices connected yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="md:col-span-1">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Connected Devices</h2>

        <div className="space-y-4">
          {devices.map((device) => (
            <div
              key={device.id}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedDevice?.id === device.id
                  ? "bg-blue-100 border border-blue-300"
                  : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <div className="flex justify-between">
                <div className="flex-1" onClick={() => onDeviceSelect(device)}>
                  <p className="font-medium">{device.name}</p>
                  <p className="text-sm text-gray-600">{device.device_type}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <p className="text-xs text-gray-500">Connected</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    className="text-sm px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded"
                    onClick={() => onSync(device.id)}
                  >
                    Sync
                  </button>
                  <button
                    className="text-sm px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded"
                    onClick={() => onDisconnect(device.id)}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
