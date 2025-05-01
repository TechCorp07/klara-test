// __tests__/services/ehrService.test.js
import { ehrService } from "../../lib/services/ehr/ehrService";
import { healthcare } from "../../lib/services/healthcareService";
import { medicationService } from "../../lib/services/medicationService";
import { fhirService } from "../../lib/services/ehr/fhirService";

// Mock the underlying services
jest.mock("../../lib/services/healthcareService", () => ({
  healthcare: {
    getUserData: jest.fn(),
    getMedicalRecords: jest.fn(),
    getUserList: jest.fn(),
    createMedicalRecord: jest.fn(),
    updateMedicalRecord: jest.fn(),
    createUser: jest.fn(), // Assuming this exists or maps to POST /users/users
    updateUser: jest.fn(), // Assuming this exists or maps to PUT /users/users/{id}
  },
}));
jest.mock("../../lib/services/medicationService", () => ({
  medicationService: {
    getMedications: jest.fn(),
    createMedication: jest.fn(),
  },
}));
jest.mock("../../lib/services/ehr/fhirService", () => ({
  fhirService: {
    search: jest.fn(),
    create: jest.fn(),
    operation: jest.fn(),
    getPatientEverything: jest.fn(),
  },
}));

describe("EHR Service", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("getPatientData calls underlying services", async () => {
    healthcare.getUserData.mockResolvedValueOnce({ id: "p1", name: "Test Patient" });
    healthcare.getMedicalRecords.mockResolvedValueOnce([{ id: "rec1" }]);

    const data = await ehrService.getPatientData("p1");

    expect(healthcare.getUserData).toHaveBeenCalledWith("p1");
    expect(healthcare.getMedicalRecords).toHaveBeenCalledWith({ patient_id: "p1" });
    expect(data).toEqual(expect.objectContaining({ id: "p1", medicalRecords: [{ id: "rec1" }] }));
  });

  test("searchPatients calls healthcare.getUserList", async () => {
    healthcare.getUserList.mockResolvedValueOnce([{ id: "p1" }]);
    await ehrService.searchPatients({ name: "Test" });

    expect(healthcare.getUserList).toHaveBeenCalledWith({ role: "patient", name: "Test" });
  });

  test("getPatientMedications calls medicationService.getMedications", async () => {
    medicationService.getMedications.mockResolvedValueOnce([{ id: "med1" }]);
    await ehrService.getPatientMedications("p1");

    expect(medicationService.getMedications).toHaveBeenCalledWith({ patient_id: "p1" });
  });

  test("getPatientAllergies calls fhirService.search", async () => {
    fhirService.search.mockResolvedValueOnce({ entry: [] });
    await ehrService.getPatientAllergies("p1");

    expect(fhirService.search).toHaveBeenCalledWith("AllergyIntolerance", { patient: "p1" });
  });

  test("getPatientConditions calls fhirService.search", async () => {
    fhirService.search.mockResolvedValueOnce({ entry: [] });
    await ehrService.getPatientConditions("p1");

    expect(fhirService.search).toHaveBeenCalledWith("Condition", { patient: "p1" });
  });

  test("getPatientLabResults calls fhirService.search", async () => {
    fhirService.search.mockResolvedValueOnce({ entry: [] });
    await ehrService.getPatientLabResults("p1");

    expect(fhirService.search).toHaveBeenCalledWith("Observation", { patient: "p1", category: "laboratory" });
  });

  test("getPatientVitals calls fhirService.search", async () => {
    fhirService.search.mockResolvedValueOnce({ entry: [] });
    await ehrService.getPatientVitals("p1");

    expect(fhirService.search).toHaveBeenCalledWith("Observation", { patient: "p1", category: "vital-signs" });
  });

  test("getPatientEncounters calls fhirService.search", async () => {
    fhirService.search.mockResolvedValueOnce({ entry: [] });
    await ehrService.getPatientEncounters("p1");

    expect(fhirService.search).toHaveBeenCalledWith("Encounter", { patient: "p1" });
  });

  test("getPatientImmunizations calls fhirService.search", async () => {
    fhirService.search.mockResolvedValueOnce({ entry: [] });
    await ehrService.getPatientImmunizations("p1");

    expect(fhirService.search).toHaveBeenCalledWith("Immunization", { patient: "p1" });
  });

  test("getPatientCarePlans calls fhirService.search", async () => {
    fhirService.search.mockResolvedValueOnce({ entry: [] });
    await ehrService.getPatientCarePlans("p1");

    expect(fhirService.search).toHaveBeenCalledWith("CarePlan", { patient: "p1" });
  });

  test("createPatient calls healthcare.createUser", async () => {
    const patientData = { name: "New Patient" };
    healthcare.createUser.mockResolvedValueOnce({ id: "newP1" });
    await ehrService.createPatient(patientData);

    expect(healthcare.createUser).toHaveBeenCalledWith({ ...patientData, role: "patient" });
  });

  test("updatePatient calls healthcare.updateUser", async () => {
    const patientData = { name: "Updated Patient" };
    healthcare.updateUser.mockResolvedValueOnce({ id: "p1" });
    await ehrService.updatePatient("p1", patientData);

    expect(healthcare.updateUser).toHaveBeenCalledWith("p1", patientData);
  });

  test("createMedication calls medicationService.createMedication", async () => {
    const medData = { name: "New Med" };
    medicationService.createMedication.mockResolvedValueOnce({ id: "newM1" });
    await ehrService.createMedication(medData);

    expect(medicationService.createMedication).toHaveBeenCalledWith(medData);
  });

  test("createAllergy calls fhirService.create", async () => {
    const allergyData = { resourceType: "AllergyIntolerance" };
    fhirService.create.mockResolvedValueOnce({ id: "newA1" });
    await ehrService.createAllergy(allergyData);

    expect(fhirService.create).toHaveBeenCalledWith("AllergyIntolerance", allergyData);
  });

  test("createCondition calls fhirService.create", async () => {
    const conditionData = { resourceType: "Condition" };
    fhirService.create.mockResolvedValueOnce({ id: "newC1" });
    await ehrService.createCondition(conditionData);

    expect(fhirService.create).toHaveBeenCalledWith("Condition", conditionData);
  });

  test("exportToFHIR calls fhirService.getPatientEverything", async () => {
    fhirService.getPatientEverything.mockResolvedValueOnce({ resourceType: "Bundle" });
    await ehrService.exportToFHIR("p1");

    expect(fhirService.getPatientEverything).toHaveBeenCalledWith("p1");
  });
});

