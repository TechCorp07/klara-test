// __tests__/services/auditService.test.js
import { auditService } from "../../lib/services/auditService";
import { apiRequest } from "../../api/client";

// Mock the apiRequest function
jest.mock("@/api/client", () => ({
  apiRequest: jest.fn(),
}));

describe("Audit Service", () => {
  beforeEach(() => {
    apiRequest.mockClear();
  });

  test("getSystemStats calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: { users: 100, logs: 5000 } });
    await auditService.getSystemStats();

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/audit/system-stats",
      null,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getAuditLogs calls the correct endpoint with params", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await auditService.getAuditLogs({ user_id: "u1", action: "login" });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/audit/logs",
      null,
      expect.objectContaining({
        params: { user_id: "u1", action: "login" },
        errorMessage: expect.any(String),
      })
    );
  });

  test("getAuditLogDetails calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: { id: "log1" } });
    await auditService.getAuditLogDetails("log1");

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/audit/logs/log1",
      null,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("createAuditLog calls the correct endpoint with data", async () => {
    const logData = { user_id: "u1", action: "update_profile" };
    apiRequest.mockResolvedValueOnce({ data: { id: "newLog1" } });
    await auditService.createAuditLog(logData);

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/audit/logs",
      logData,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getComplianceReport calls the correct endpoint with params", async () => {
    apiRequest.mockResolvedValueOnce({ data: {} });
    await auditService.getComplianceReport({ report_type: "hipaa" });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/audit/compliance-report",
      null,
      expect.objectContaining({
        params: { report_type: "hipaa" },
        errorMessage: expect.any(String),
      })
    );
  });

  // Test error handling
  test("getAuditLogs handles API errors", async () => {
    const error = new Error("Failed to fetch logs");
    apiRequest.mockRejectedValueOnce(error);

    await expect(auditService.getAuditLogs()).rejects.toThrow(
      "Failed to fetch audit logs"
    );
  });
});

