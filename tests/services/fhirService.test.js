// __tests__/services/fhirService.test.js
import { fhirService } from "../../lib/services/ehr/fhirService";
import { apiRequest } from "../../api/client";

// Mock the apiRequest function
jest.mock("../../api/client", () => ({
  apiRequest: jest.fn(),
}));

describe("FHIR Service", () => {
  beforeEach(() => {
    apiRequest.mockClear();
  });

  test("get calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ resourceType: "Patient", id: "p1" });
    await fhirService.get("Patient", "p1");

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/fhir/Patient/p1",
      null,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("search calls the correct endpoint with params", async () => {
    apiRequest.mockResolvedValueOnce({ resourceType: "Bundle" });
    await fhirService.search("Observation", { patient: "p1", code: "8867-4" });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/fhir/Observation",
      null,
      expect.objectContaining({ 
        params: { patient: "p1", code: "8867-4" },
        errorMessage: expect.any(String) 
      })
    );
  });

  test("create calls the correct endpoint with data", async () => {
    const resource = { resourceType: "Observation", status: "final" };
    apiRequest.mockResolvedValueOnce(resource);
    await fhirService.create("Observation", resource);

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/fhir/Observation",
      resource,
      expect.objectContaining({ 
        errorMessage: expect.any(String),
        successMessage: expect.any(String)
      })
    );
  });

  test("update calls the correct endpoint with data", async () => {
    const resource = { resourceType: "Patient", id: "p1", name: [{ family: "Smith" }] };
    apiRequest.mockResolvedValueOnce(resource);
    await fhirService.update("Patient", "p1", resource);

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "PUT",
      "/fhir/Patient/p1",
      resource,
      expect.objectContaining({ 
        errorMessage: expect.any(String),
        successMessage: expect.any(String)
      })
    );
  });

  test("delete calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({});
    await fhirService.delete("Observation", "obs1");

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "DELETE",
      "/fhir/Observation/obs1",
      null,
      expect.objectContaining({ 
        errorMessage: expect.any(String),
        successMessage: expect.any(String)
      })
    );
  });

  test("operation calls the correct endpoint for instance-level operation", async () => {
    const parameters = { parameter: [{ name: "start", valueDate: "2023-01-01" }] };
    apiRequest.mockResolvedValueOnce({ resourceType: "Bundle" });
    await fhirService.operation("Patient", "p1", "everything", "GET");

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/fhir/Patient/p1/$everything",
      null,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("operation calls the correct endpoint for type-level operation with parameters", async () => {
    const parameters = { parameter: [{ name: "count", valueInteger: 100 }] };
    apiRequest.mockResolvedValueOnce({ resourceType: "Bundle" });
    await fhirService.operation("Patient", null, "match", "POST", parameters);

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/fhir/Patient/$match",
      parameters,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getPatientResources calls the correct endpoint with params", async () => {
    apiRequest.mockResolvedValueOnce({ resourceType: "Bundle" });
    await fhirService.getPatientResources("p1", "Observation", { _count: 50 });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/fhir/Observation",
      null,
      expect.objectContaining({ 
        params: { patient: "p1", _count: 50 },
        errorMessage: expect.any(String) 
      })
    );
  });

  test("getPatientEverything calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ resourceType: "Bundle" });
    await fhirService.getPatientEverything("p1");

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/fhir/Patient/p1/$everything",
      null,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("export calls the correct endpoint for system export", async () => {
    apiRequest.mockResolvedValueOnce({});
    await fhirService.export("system", null, { _type: "Patient,Observation" });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/fhir/$export",
      null,
      expect.objectContaining({ 
        params: { _type: "Patient,Observation" },
        errorMessage: expect.any(String) 
      })
    );
  });

  test("export calls the correct endpoint for patient export", async () => {
    apiRequest.mockResolvedValueOnce({});
    await fhirService.export("patient", "p1");

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/fhir/Patient/p1/$export",
      null,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("validate calls the correct endpoint with resource", async () => {
    const resource = { resourceType: "Patient", name: [{ family: "Smith" }] };
    apiRequest.mockResolvedValueOnce({ resourceType: "OperationOutcome" });
    await fhirService.validate("Patient", resource);

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/fhir/Patient/$validate",
      resource,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("transaction calls the correct endpoint with bundle", async () => {
    const bundle = {
      resourceType: "Bundle",
      type: "transaction",
      entry: [
        {
          request: { method: "POST", url: "Patient" },
          resource: { resourceType: "Patient", name: [{ family: "Smith" }] }
        }
      ]
    };
    apiRequest.mockResolvedValueOnce({ resourceType: "Bundle", type: "transaction-response" });
    await fhirService.transaction(bundle);

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/fhir",
      bundle,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  // Test error handling
  test("get handles API errors", async () => {
    const error = new Error("Not found");
    apiRequest.mockRejectedValueOnce(error);

    await expect(fhirService.get("Patient", "nonexistent")).rejects.toThrow(
      "Failed to fetch Patient"
    );
  });
});
