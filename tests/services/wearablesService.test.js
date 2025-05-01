// __tests__/services/wearablesService.test.js
import { wearablesService } from "../../lib/services/wearablesService";
import { apiRequest } from "../../api/client";

// Mock the apiRequest function
jest.mock("../../api/client", () => ({
  apiRequest: jest.fn(),
}));

// Mock the provider-specific services (optional, could test integration)
jest.mock("../../lib/services/wearables/withingsService");
jest.mock("../../lib/services/wearables/appleHealthService");
jest.mock("../../lib/services/wearables/fitbitService");
jest.mock("../../lib/services/wearables/garminService");

describe("Wearables Service (Main)", () => {
  beforeEach(() => {
    apiRequest.mockClear();
  });

  test("getConnectedDevices calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await wearablesService.getConnectedDevices();

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/wearables/devices",
      null,
      expect.objectContaining({ params: {}, errorMessage: expect.any(String) })
    );
  });

  test("getDeviceById calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: { id: "dev1" } });
    await wearablesService.getDeviceById("dev1");

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/wearables/devices/dev1",
      null,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("disconnectDevice calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({});
    await wearablesService.disconnectDevice("dev1");

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "DELETE",
      "/wearables/devices/dev1",
      null,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getMeasurements calls the correct endpoint with params", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await wearablesService.getMeasurements({ type: "steps", start_date: "2023-01-01" });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/wearables/measurements",
      null,
      expect.objectContaining({
        params: { type: "steps", start_date: "2023-01-01" },
        errorMessage: expect.any(String),
      })
    );
  });

  test("getSupportedProviders calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: ["withings", "fitbit"] });
    await wearablesService.getSupportedProviders();

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/wearables/providers",
      null,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  // Test error handling
  test("getConnectedDevices handles API errors", async () => {
    const error = new Error("Failed to fetch devices");
    apiRequest.mockRejectedValueOnce(error);

    await expect(wearablesService.getConnectedDevices()).rejects.toThrow(
      "Failed to fetch connected devices"
    );
  });
});

