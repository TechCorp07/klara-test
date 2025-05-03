import { fetchWithAuth } from "./client"
import { API_ENDPOINTS } from "@/lib/config"

export const getWearableDevices = async (userId) => {
  try {
    const endpoint = userId ? `${API_ENDPOINTS.WEARABLES.DEVICES}?userId=${userId}` : API_ENDPOINTS.WEARABLES.DEVICES

    return await fetchWithAuth(endpoint)
  } catch (error) {
    console.error("Error fetching wearable devices:", error)
    throw error
  }
}

export const connectWearableDevice = async (deviceData) => {
  try {
    return await fetchWithAuth(API_ENDPOINTS.WEARABLES.CONNECT, {
      method: "POST",
      body: JSON.stringify(deviceData),
    })
  } catch (error) {
    console.error("Error connecting wearable device:", error)
    throw error
  }
}

export const disconnectWearableDevice = async (deviceId) => {
  try {
    return await fetchWithAuth(`${API_ENDPOINTS.WEARABLES.DISCONNECT}/${deviceId}`, {
      method: "DELETE",
    })
  } catch (error) {
    console.error("Error disconnecting wearable device:", error)
    throw error
  }
}

export const getWearableData = async (deviceId, dataType, startDate, endDate) => {
  try {
    let endpoint = `${API_ENDPOINTS.WEARABLES.DATA}/${deviceId}?dataType=${dataType}`

    if (startDate) {
      endpoint += `&startDate=${startDate}`
    }

    if (endDate) {
      endpoint += `&endDate=${endDate}`
    }

    return await fetchWithAuth(endpoint)
  } catch (error) {
    console.error("Error fetching wearable data:", error)
    throw error
  }
}

export const syncWearableData = async (deviceId) => {
  try {
    return await fetchWithAuth(`${API_ENDPOINTS.WEARABLES.SYNC}/${deviceId}`, {
      method: "POST",
    })
  } catch (error) {
    console.error("Error syncing wearable data:", error)
    throw error
  }
}

export const getWithingsAuthUrl = async () => {
  try {
    return await fetchWithAuth(API_ENDPOINTS.WEARABLES.WITHINGS_AUTH_URL)
  } catch (error) {
    console.error("Error getting Withings auth URL:", error)
    throw error
  }
}

export const handleWithingsCallback = async (code, state) => {
  try {
    return await fetchWithAuth(API_ENDPOINTS.WEARABLES.WITHINGS_CALLBACK, {
      method: "POST",
      body: JSON.stringify({ code, state }),
    })
  } catch (error) {
    console.error("Error handling Withings callback:", error)
    throw error
  }
}
