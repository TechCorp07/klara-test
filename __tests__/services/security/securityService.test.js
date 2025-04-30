import { describe, it, expect, vi, beforeEach } from "vitest"
import { securityService } from "../../../lib/services/securityService"

// Mock the API client
vi.mock("../../../api/client", () => ({
  apiRequest: vi.fn(),
}))

import { apiRequest } from "../../../api/client"

describe("Security Service", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe("runSecurityScan", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ id: "scan123", status: "running" })
      const scanType = "vulnerability"
      const scanOptions = { depth: "full" }

      // Execute
      await securityService.runSecurityScan(scanType, scanOptions)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith(
        "POST",
        "/security/scans",
        { type: scanType, options: scanOptions },
        expect.any(Object),
      )
    })

    it("should handle errors properly", async () => {
      // Setup
      apiRequest.mockRejectedValueOnce(new Error("API Error"))
      const scanType = "vulnerability"

      // Execute & Verify
      await expect(securityService.runSecurityScan(scanType)).rejects.toThrow("API Error")
    })
  })

  describe("getScanResults", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ id: "scan123", status: "completed", results: [] })
      const scanId = "scan123"

      // Execute
      await securityService.getScanResults(scanId)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith("GET", `/security/scans/${scanId}`, null, expect.any(Object))
    })
  })

  describe("getVulnerabilities", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ vulnerabilities: [] })
      const filters = { severity: "high" }

      // Execute
      await securityService.getVulnerabilities(filters)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith(
        "GET",
        "/security/vulnerabilities",
        null,
        expect.objectContaining({
          params: filters,
        }),
      )
    })
  })

  describe("getVulnerabilityDetails", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ id: "vuln123", name: "Test Vulnerability" })
      const vulnerabilityId = "vuln123"

      // Execute
      await securityService.getVulnerabilityDetails(vulnerabilityId)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith(
        "GET",
        `/security/vulnerabilities/${vulnerabilityId}`,
        null,
        expect.any(Object),
      )
    })
  })

  describe("createRemediationPlan", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ id: "plan123", status: "created" })
      const vulnerabilityId = "vuln123"
      const planData = { steps: ["Update library"], assignee: "user123" }

      // Execute
      await securityService.createRemediationPlan(vulnerabilityId, planData)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith(
        "POST",
        `/security/vulnerabilities/${vulnerabilityId}/remediation`,
        planData,
        expect.any(Object),
      )
    })
  })

  describe("getComplianceStatus", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ status: "compliant", details: {} })
      const standard = "hipaa"

      // Execute
      await securityService.getComplianceStatus(standard)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith("GET", `/security/compliance/${standard}`, null, expect.any(Object))
    })
  })
})
