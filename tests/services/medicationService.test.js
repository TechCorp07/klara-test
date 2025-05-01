// __tests__/services/medicationService.test.js
import { medicationService } from "../../lib/services/medicationService";
import { apiRequest } from "../../api/client";

// Mock the apiRequest function
jest.mock("../../api/client", () => ({
  apiRequest: jest.fn(),
}));

describe("Medication Service", () => {
  beforeEach(() => {
    apiRequest.mockClear();
  });

  test("getMedications calls the correct endpoint with params", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await medicationService.getMedications({ patient_id: "p1", status: "active" });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/medication/medications",
      { patient_id: "p1", status: "active" }, // Changed from null to params
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getMedicationById calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: { id: "med1" } });
    await medicationService.getMedicationById("med1");

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/medication/medications/med1",
      null,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("createMedication calls the correct endpoint with data", async () => {
    const medData = { name: "Aspirin", dosage: "100mg" };
    apiRequest.mockResolvedValueOnce({ data: { id: "newMed1" } });
    await medicationService.createMedication(medData);

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/medication/medications",
      medData,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("updateMedication calls the correct endpoint with data", async () => {
    const updateData = { dosage: "200mg" };
    apiRequest.mockResolvedValueOnce({ data: { id: "med1" } });
    await medicationService.updateMedication("med1", updateData);

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "PUT",
      "/medication/medications/med1",
      updateData,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("deleteMedication calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: {} });
    await medicationService.deleteMedication("med1");

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "DELETE",
      "/medication/medications/med1",
      null,
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getAdherence calls the correct endpoint with params", async () => {
    apiRequest.mockResolvedValueOnce({ data: {} });
    await medicationService.getAdherence({ patient_id: "p1" });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/medication/adherence",
      { patient_id: "p1" }, // Changed from null to params
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getReminders calls the correct endpoint with params", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await medicationService.getReminders({ patient_id: "p1" });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/medication/reminders",
      { patient_id: "p1" }, // Changed from null to params
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getInteractions calls the correct endpoint with params", async () => {
    apiRequest.mockResolvedValueOnce({ data: {} });
    await medicationService.getInteractions({ patient_id: "p1" });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/medication/interactions",
      { patient_id: "p1" }, // Changed from null to params
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  test("getSideEffects calls the correct endpoint with params", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await medicationService.getSideEffects({ medication_id: "med1" });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/medication/side-effects",
      { medication_id: "med1" }, // Changed from null to params
      expect.objectContaining({ errorMessage: expect.any(String) })
    );
  });

  // Test error handling
  test("getMedications handles API errors", async () => {
    const error = new Error("Failed to fetch meds");
    apiRequest.mockRejectedValueOnce(error);

    await expect(medicationService.getMedications()).rejects.toThrow(
      "Failed to fetch medications"
    );
  });
});

