// lib/env.js

/**
 * Environment variables export file
 * Validation is handled in next.config.js at build time
 */

// Export environment variables with type safety
export const API_URL = process.env.NEXT_PUBLIC_API_URL
export const ZOOM_SDK_KEY = process.env.ZOOM_SDK_KEY || ""
export const WITHINGS_CLIENT_ID = process.env.WITHINGS_CLIENT_ID || ""

// Add constants for feature flags
export const FEATURES = {
  enableTwoFactor: true,
  enableDeviceIntegration: !!process.env.WITHINGS_CLIENT_ID,
  enableTelehealth: !!process.env.ZOOM_SDK_KEY,
  maintenanceMode: process.env.MAINTENANCE_MODE === "true",
}

export default {
  API_URL,
  ZOOM_SDK_KEY,
  WITHINGS_CLIENT_ID,
  FEATURES,
}
