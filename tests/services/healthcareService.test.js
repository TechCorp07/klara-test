// __tests__/services/healthcareService.test.js
import { healthcare } from "../../lib/services/healthcareService";
import { apiRequest } from "../../api/client";

// Mock the apiRequest function
jest.mock("../../api/client", () => ({
  apiRequest: jest.fn(),
}));

describe("Healthcare Service", () => {
  beforeEach(() => {
    // Clear mock calls before each test
    apiRequest.mockClear();
  });

  test("getPendingApprovals calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] }); // Mock response
    await healthcare.getPendingApprovals({ status: "pending" });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/users/pending-approvals",
      { status: "pending" }, // Changed from null to params for GET
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getUserData calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: { id: "user123" } });
    await healthcare.getUserData("user123");

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/users/users/user123",
      null,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getUserList calls the correct endpoint with params", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await healthcare.getUserList({ role: "patient", page: 2 });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/users/users",
      { role: "patient", page: 2 }, // Changed from null to params for GET
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getMedicalRecords calls the correct endpoint with params", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await healthcare.getMedicalRecords({ patient_id: "patient456", limit: 10 });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/healthcare/medical-records",
      { patient_id: "patient456", limit: 10 }, // Changed from null to params for GET
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getMedicalRecordById calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: { id: "rec789" } });
    await healthcare.getMedicalRecordById("rec789");

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/healthcare/medical-records/rec789",
      null,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("createMedicalRecord calls the correct endpoint with data", async () => {
    const recordData = { patient_id: "patient456", notes: "Test notes" };
    apiRequest.mockResolvedValueOnce({ data: { id: "newRec1" } });
    await healthcare.createMedicalRecord(recordData);

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/healthcare/medical-records",
      recordData,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("updateMedicalRecord calls the correct endpoint with data", async () => {
    const updateData = { notes: "Updated notes" };
    apiRequest.mockResolvedValueOnce({ data: { id: "rec789" } });
    await healthcare.updateMedicalRecord("rec789", updateData);

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "PUT",
      "/healthcare/medical-records/rec789",
      updateData,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getMedications calls the correct endpoint with params", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await healthcare.getMedications({ patient_id: "patient456" });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/medication/medications",
      { patient_id: "patient456" }, // Changed from null to params for GET
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getProviders calls the correct endpoint with params", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await healthcare.getProviders({ role: "provider", specialty: "cardiology" });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/users/users",
      { role: "provider", specialty: "cardiology" }, // Changed from null to params for GET
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("approveUser calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: { status: "approved" } });
    await healthcare.approveUser("user789");

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/users/users/user789/approve",
      {},
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  // Test error handling
  test("getUserData handles API errors", async () => {
    const error = new Error("Failed to fetch");
    apiRequest.mockRejectedValueOnce(error);

    await expect(healthcare.getUserData("user123")).rejects.toThrow(
      "Failed to fetch user data"
    );
  });
});

