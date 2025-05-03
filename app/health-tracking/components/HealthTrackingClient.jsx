"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "react-toastify"
import { wearablesService } from "@/lib/services/wearablesService"
import { useSearchParams, useRouter } from "next/navigation"

// Component imports
import DeviceList from "./DeviceList"
import DeviceData from "./DeviceData"
import ConnectDevice from "./ConnectDevice"
import IntegrationCard from "./IntegrationCard"

// Constants for wearable device types
const WEARABLE_TYPES = [
  {
    id: "fitbit",
    name: "Fitbit",
    logo: "/images/wearables/fitbit.png",
    description: "Connect your Fitbit device to track steps, heart rate, sleep, and more.",
    oauth: true,
  },
  {
    id: "apple_health",
    name: "Apple Health",
    logo: "/images/wearables/apple-health.png",
    description: "Sync data from your Apple Watch and Apple Health app. Requires iPhone app.",
    mobileOnly: true,
  },
  {
    id: "garmin",
    name: "Garmin",
    logo: "/images/wearables/garmin.png",
    description: "Connect your Garmin device to track activities, heart rate, and sleep.",
    oauth: true,
  },
  {
    id: "samsung_health",
    name: "Samsung Health",
    logo: "/images/wearables/samsung-health.png",
    description: "Sync data from your Samsung Galaxy Watch and Samsung Health app. Requires Android app.",
    mobileOnly: true,
  },
  {
    id: "withings",
    name: "Withings",
    logo: "/images/wearables/withings.png",
    description: "Connect your Withings devices for weight, blood pressure, and activity tracking.",
    oauth: true,
  },
  {
    id: "google_fit",
    name: "Google Fit",
    logo: "/images/wearables/google-fit.png",
    description: "Sync data from Google Fit and compatible devices.",
    oauth: true,
  },
  {
    id: "oura",
    name: "Oura Ring",
    logo: "/images/wearables/oura.png",
    description: "Connect your Oura Ring to track sleep, readiness, and activity.",
    oauth: true,
  },
  {
    id: "whoop",
    name: "WHOOP",
    logo: "/images/wearables/whoop.png",
    description: "Connect your WHOOP strap to track recovery, strain, and sleep.",
    oauth: true,
  },
]

export default function HealthTrackingClient() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  // State management
  const [activeTab, setActiveTab] = useState("connected-devices") // 'connected-devices', 'add-device', 'health-data'
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days ago
    endDate: new Date().toISOString().split("T")[0], // today
  })

  // Handle OAuth callbacks
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get("code")
      const state = searchParams.get("state")

      if (!code || !state) return

      try {
        // Extract integration type from state (in a real app, you'd verify this is legitimate)
        const integrationType = state.split("_")[0]
        const redirectUri = `${window.location.origin}/health-tracking` // Your actual callback URI

        // Process the OAuth callback
        await wearablesService.handleOAuthCallback(integrationType, code, redirectUri)
        queryClient.invalidateQueries(["wearableDevices"])

        // Remove query params and show success message
        router.replace("/health-tracking")
        toast.success(`Successfully connected ${integrationType} device!`)
      } catch (error) {
        console.error("OAuth callback error:", error)
        toast.error("Failed to connect device. Please try again.")
      }
    }

    if (searchParams.has("code")) {
      handleOAuthCallback()
    }
  }, [searchParams, queryClient, router])

  // Fetch wearable devices
  const {
    data: devices,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wearableDevices", user?.id],
    queryFn: () => wearablesService.getWearableDevices(user?.id),
    enabled: !!user,
    onError: (error) => {
      toast.error("Failed to load connected devices")
      console.error("Error fetching devices:", error)
    },
  })

  // Fetch Withings profile
  const { data: withingsProfile } = useQuery({
    queryKey: ["withingsProfile"],
    queryFn: () => wearablesService.getWithingsProfile(),
    enabled: !!user,
    onError: (error) => {
      console.error("Error fetching Withings profile:", error)
      // Don't show error toast as this might be a normal state (not connected yet)
    },
  })

  // Fetch wearable data for selected device
  const { data: deviceData, isLoading: isDataLoading } = useQuery({
    queryKey: ["wearableData", selectedDevice?.id, dateRange],
    queryFn: () =>
      wearablesService.getWearableData(
        user?.id,
        selectedDevice?.data_type || selectedDevice?.integration_type,
        dateRange.startDate,
        dateRange.endDate,
      ),
    enabled: !!selectedDevice && !!user,
    onError: (error) => {
      toast.error("Failed to load device data")
      console.error("Error fetching device data:", error)
    },
  })

  // Mutation for connecting devices via OAuth
  const connectDeviceMutation = useMutation({
    mutationFn: (deviceType) => wearablesService.connectDevice(deviceType),
    onSuccess: (data) => {
      // For devices that support OAuth flow
      if (data.auth_url) {
        window.location.href = data.auth_url
      }
      // For devices that require mobile app
      else if (data.instructions) {
        toast.info(data.instructions)
      }
    },
    onError: (error) => {
      toast.error(`Failed to connect device: ${error.message}`)
      console.error("Error connecting device:", error)
    },
  })

  // Event Handlers
  const handleDeviceSelect = (device) => {
    setSelectedDevice(device)
    setActiveTab("device-data")
  }

  const handleConnectDevice = (deviceType) => {
    connectDeviceMutation.mutate(deviceType)
  }

  const handleDateRangeChange = (e, field) => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value,
    })
  }

  const handleDisconnectDevice = async (deviceId) => {
    try {
      await wearablesService.disconnectDevice(deviceId)
      queryClient.invalidateQueries(["wearableDevices", user?.id])

      // Reset selected device if it was the one disconnected
      if (selectedDevice && selectedDevice.id === deviceId) {
        setSelectedDevice(null)
      }

      toast.success("Device disconnected successfully")
    } catch (error) {
      toast.error("Failed to disconnect device")
      console.error("Error disconnecting device:", error)
    }
  }

  const handleSyncDevice = async (deviceId) => {
    try {
      await wearablesService.syncDeviceData(deviceId)
      queryClient.invalidateQueries(["wearableData", deviceId, dateRange])
      toast.success("Device data synced successfully")
    } catch (error) {
      toast.error("Failed to sync device data")
      console.error("Error syncing device data:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Health Tracking</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Health Tracking</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading health devices. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Health Tracking</h1>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === "connected-devices" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("connected-devices")}
        >
          Connected Devices
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === "add-device" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("add-device")}
        >
          Add Device
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === "health-data" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("health-data")}
        >
          Health Data
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === "device-data" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => (selectedDevice ? setActiveTab("device-data") : setActiveTab("connected-devices"))}
        >
          Device Data
        </button>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* We'll show up to 3 integration cards here, dynamically based on what's connected */}
        {withingsProfile && (
          <IntegrationCard
            name="Withings"
            type="withings"
            status={withingsProfile.status}
            connectedAt={withingsProfile.connected_at}
            lastSync={withingsProfile.last_sync}
            onSync={() => wearablesService.fetchWithingsData(dateRange.startDate, dateRange.endDate)}
            onDisconnect={() =>
              handleDisconnectDevice(devices?.results.find((d) => d.integration_type === "withings")?.id)
            }
          />
        )}

        {/* Map other common integrations */}
        {devices?.results
          ?.filter((d) => d.integration_type !== "withings")
          .slice(0, withingsProfile ? 2 : 3)
          .map((device) => (
            <IntegrationCard
              key={device.id}
              name={WEARABLE_TYPES.find((w) => w.id === device.integration_type)?.name || device.integration_type}
              type={device.integration_type}
              status={device.is_active ? "active" : "inactive"}
              connectedAt={device.created_at}
              lastSync={device.last_sync}
              onSync={() => handleSyncDevice(device.id)}
              onDisconnect={() => handleDisconnectDevice(device.id)}
            />
          ))}

        {/* If no connected devices yet, show a prompt */}
        {(!devices?.results || devices.results.length === 0) && !withingsProfile && (
          <div className="col-span-full bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-700 font-medium">No health devices connected yet</p>
            <p className="mt-1 text-blue-600">Connect your first device by selecting "Add Device" above.</p>
          </div>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === "connected-devices" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DeviceList
            devices={devices?.results || []}
            selectedDevice={selectedDevice}
            onDeviceSelect={handleDeviceSelect}
            onDisconnect={handleDisconnectDevice}
            onSync={handleSyncDevice}
          />

          {selectedDevice ? (
            <DeviceData
              device={selectedDevice}
              dateRange={dateRange}
              deviceData={deviceData}
              isLoading={isDataLoading}
              onDateRangeChange={handleDateRangeChange}
              onRefresh={() => queryClient.invalidateQueries(["wearableData", selectedDevice.id, dateRange])}
            />
          ) : (
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-64">
              <p className="text-gray-500">Select a device to view data.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "add-device" && (
        <ConnectDevice
          wearableTypes={WEARABLE_TYPES}
          onConnect={handleConnectDevice}
          isPending={connectDeviceMutation.isPending}
        />
      )}

      {activeTab === "health-data" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Health Data Summary</h2>

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
        </div>
      )}

      {activeTab === "device-data" && selectedDevice && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <DeviceData
            device={selectedDevice}
            dateRange={dateRange}
            deviceData={deviceData}
            isLoading={isDataLoading}
            onDateRangeChange={handleDateRangeChange}
            onRefresh={() => queryClient.invalidateQueries(["wearableData", selectedDevice.id, dateRange])}
            fullWidth={true}
          />
        </div>
      )}
    </div>
  )
}
