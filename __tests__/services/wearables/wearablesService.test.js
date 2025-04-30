import { describe, it, expect, vi, beforeEach } from "vitest"
import { wearablesService } from "../../../lib/services/wearablesService"

// Mock the API client
vi.mock("../../../api/client", () => ({
  apiRequest: vi.fn(),
}))

// Mock individual wearable services
vi.mock("../../../lib/services/wearables/withingsService", () => ({
  default: {
    authorize: vi.fn(),
    getDevices: vi.fn(),
    getMeasurements: vi.fn(),
  },
}))

vi.mock("../../../lib/services/wearables/appleHealthService", () => ({
  default: {
    authorize: vi.fn(),
    getDevices: vi.fn(),
    getMeasurements: vi.fn(),
  },
}))

vi.mock("../../../lib/services/wearables/samsungHealthService", () => ({
  default: {
    authorize: vi.fn(),
    getDevices: vi.fn(),
    getMeasurements: vi.fn(),
  },
}))

vi.mock("../../../lib/services/wearables/fitbitService", () => ({
  default: {
    authorize: vi.fn(),
    getDevices: vi.fn(),
    getMeasurements: vi.fn(),
  },
}))

vi.mock("../../../lib/services/wearables/garminService", () => ({
  default: {
    authorize: vi.fn(),
    getDevices: vi.fn(),
    getMeasurements: vi.fn(),
  },
}))

import { apiRequest } from "../../../api/client"
import withingsService from "../../../lib/services/wearables/withingsService"
import appleHealthService from "../../../lib/services/wearables/appleHealthService"
import samsungHealthService from "../../../lib/services/wearables/samsungHealthService"
import fitbitService from "../../../lib/services/wearables/fitbitService"
import garminService from "../../../lib/services/wearables/garminService"

describe("Wearables Service", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe("getConnectedDevices", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ devices: [] })
      const userId = "user123"

      // Execute
      await wearablesService.getConnectedDevices(userId)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith("GET", `/wearables/users/${userId}/devices`, null, expect.any(Object))
    })
  })

  describe("connectDevice", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ success: true })
      const userId = "user123"
      const deviceData = { type: "withings", deviceId: "device123" }

      // Execute
      await wearablesService.connectDevice(userId, deviceData)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith(
        "POST",
        `/wearables/users/${userId}/devices`,
        deviceData,
        expect.any(Object),
      )
    })
  })

  describe("disconnectDevice", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ success: true })
      const userId = "user123"
      const deviceId = "device123"

      // Execute
      await wearablesService.disconnectDevice(userId, deviceId)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith(
        "DELETE",
        `/wearables/users/${userId}/devices/${deviceId}`,
        null,
        expect.any(Object),
      )
    })
  })

  describe("getMeasurements", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ measurements: [] })
      const userId = "user123"
      const deviceId = "device123"
      const measurementType = "heartrate"
      const startDate = "2023-01-01"
      const endDate = "2023-01-31"

      // Execute
      await wearablesService.getMeasurements(userId, deviceId, measurementType, startDate, endDate)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith(
        "GET",
        `/wearables/users/${userId}/devices/${deviceId}/measurements/${measurementType}`,
        null,
        expect.objectContaining({
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        }),
      )
    })
  })

  describe("authorizeWithings", () => {
    it("should call the withings service authorize method", async () => {
      // Setup
      withingsService.authorize.mockResolvedValueOnce({ authUrl: "https://withings.com/auth" })
      const userId = "user123"
      const redirectUri = "https://example.com/callback"

      // Execute
      await wearablesService.authorizeWithings(userId, redirectUri)

      // Verify
      expect(withingsService.authorize).toHaveBeenCalledWith(userId, redirectUri)
    })
  })

  describe("authorizeAppleHealth", () => {
    it("should call the Apple Health service authorize method", async () => {
      // Setup
      appleHealthService.authorize.mockResolvedValueOnce({ success: true })
      const userId = "user123"
      const authData = { token: "abc123" }

      // Execute
      await wearablesService.authorizeAppleHealth(userId, authData)

      // Verify
      expect(appleHealthService.authorize).toHaveBeenCalledWith(userId, authData)
    })
  })

  describe("authorizeSamsungHealth", () => {
    it("should call the Samsung Health service authorize method", async () => {
      // Setup
      samsungHealthService.authorize.mockResolvedValueOnce({ success: true })
      const userId = "user123"
      const authData = { token: "abc123" }

      // Execute
      await wearablesService.authorizeSamsungHealth(userId, authData)

      // Verify
      expect(samsungHealthService.authorize).toHaveBeenCalledWith(userId, authData)
    })
  })

  describe("authorizeFitbit", () => {
    it("should call the Fitbit service authorize method", async () => {
      // Setup
      fitbitService.authorize.mockResolvedValueOnce({ authUrl: "https://fitbit.com/auth" })
      const userId = "user123"
      const redirectUri = "https://example.com/callback"

      // Execute
      await wearablesService.authorizeFitbit(userId, redirectUri)

      // Verify
      expect(fitbitService.authorize).toHaveBeenCalledWith(userId, redirectUri)
    })
  })

  describe("authorizeGarmin", () => {
    it("should call the Garmin service authorize method", async () => {
      // Setup
      garminService.authorize.mockResolvedValueOnce({ authUrl: "https://garmin.com/auth" })
      const userId = "user123"
      const redirectUri = "https://example.com/callback"

      // Execute
      await wearablesService.authorizeGarmin(userId, redirectUri)

      // Verify
      expect(garminService.authorize).toHaveBeenCalledWith(userId, redirectUri)
    })
  })

  describe("getSupportedDeviceTypes", () => {
    it("should return all supported device types", () => {
      // Execute
      const deviceTypes = wearablesService.getSupportedDeviceTypes()

      // Verify
      expect(deviceTypes).toContain("withings")
      expect(deviceTypes).toContain("apple_health")
      expect(deviceTypes).toContain("samsung_health")
      expect(deviceTypes).toContain("fitbit")
      expect(deviceTypes).toContain("garmin")
    })
  })
})
