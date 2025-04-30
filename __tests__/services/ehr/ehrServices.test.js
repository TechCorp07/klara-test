import { describe, it, expect, vi, beforeEach } from "vitest"
import { ehrService, fhirService } from "../../../lib/services/ehr"

// Mock the API client
vi.mock("../../../api/client", () => ({
  apiRequest: vi.fn(),
}))

import { apiRequest } from "../../../api/client"

describe("EHR Service", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe("getPatientData", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ demographics: {}, medications: [] })
      const patientId = "patient123"
      const dataType = "all"

      // Execute
      await ehrService.getPatientData(patientId, dataType)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith(
        "GET",
        `/ehr/patients/${patientId}/data`,
        null,
        expect.objectContaining({
          params: { data_type: dataType },
        }),
      )
    })
  })

  describe("getPatientMedications", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ medications: [] })
      const patientId = "patient123"
      const includeInactive = true

      // Execute
      await ehrService.getPatientMedications(patientId, includeInactive)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith(
        "GET",
        `/ehr/patients/${patientId}/medications`,
        null,
        expect.objectContaining({
          params: { include_inactive: includeInactive },
        }),
      )
    })
  })

  describe("exportToFHIR", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ resourceType: "Bundle" })
      const patientId = "patient123"

      // Execute
      await ehrService.exportToFHIR(patientId)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith("GET", `/ehr/patients/${patientId}/export/fhir`, null, expect.any(Object))
    })
  })

  describe("importFromFHIR", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ success: true })
      const fhirData = { resourceType: "Bundle", entry: [] }

      // Execute
      await ehrService.importFromFHIR(fhirData)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith("POST", "/ehr/import/fhir", fhirData, expect.any(Object))
    })
  })
})

describe("FHIR Service", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe("getResource", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ resourceType: "Patient", id: "patient123" })
      const resourceType = "Patient"
      const id = "patient123"

      // Execute
      await fhirService.getResource(resourceType, id)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith("GET", `/fhir/${resourceType}/${id}`, null, expect.any(Object))
    })
  })

  describe("searchResources", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ resourceType: "Bundle", entry: [] })
      const resourceType = "Observation"
      const searchParams = { patient: "patient123", code: "code123" }

      // Execute
      await fhirService.searchResources(resourceType, searchParams)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith(
        "GET",
        `/fhir/${resourceType}`,
        null,
        expect.objectContaining({
          params: searchParams,
        }),
      )
    })
  })

  describe("createResource", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ resourceType: "Patient", id: "patient123" })
      const resourceType = "Patient"
      const resource = { resourceType: "Patient", name: [{ given: ["John"], family: "Doe" }] }

      // Execute
      await fhirService.createResource(resourceType, resource)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith("POST", `/fhir/${resourceType}`, resource, expect.any(Object))
    })
  })

  describe("updateResource", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ resourceType: "Patient", id: "patient123" })
      const resourceType = "Patient"
      const id = "patient123"
      const resource = { resourceType: "Patient", id, name: [{ given: ["John"], family: "Doe" }] }

      // Execute
      await fhirService.updateResource(resourceType, id, resource)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith("PUT", `/fhir/${resourceType}/${id}`, resource, expect.any(Object))
    })
  })

  describe("executeOperation", () => {
    it("should call the API with correct parameters for resource-level operation", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ result: "success" })
      const resourceType = "Patient"
      const id = "patient123"
      const operation = "everything"
      const parameters = { _count: 100 }

      // Execute
      await fhirService.executeOperation(resourceType, id, operation, parameters)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith(
        "POST",
        `/fhir/${resourceType}/${id}/$${operation}`,
        parameters,
        expect.any(Object),
      )
    })

    it("should call the API with correct parameters for type-level operation", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ result: "success" })
      const resourceType = "Patient"
      const operation = "match"
      const parameters = { onlyCertainMatches: true }

      // Execute
      await fhirService.executeOperation(resourceType, null, operation, parameters)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith(
        "POST",
        `/fhir/${resourceType}/$${operation}`,
        parameters,
        expect.any(Object),
      )
    })
  })

  describe("validateResource", () => {
    it("should call the API with correct parameters", async () => {
      // Setup
      apiRequest.mockResolvedValueOnce({ resourceType: "OperationOutcome", issue: [] })
      const resourceType = "Patient"
      const resource = { resourceType: "Patient", name: [{ given: ["John"], family: "Doe" }] }

      // Execute
      await fhirService.validateResource(resourceType, resource)

      // Verify
      expect(apiRequest).toHaveBeenCalledWith("POST", `/fhir/${resourceType}/$validate`, resource, expect.any(Object))
    })
  })
})
