// lib/services/ehr/ehrService.js
// Service wrapper for EHR-related operations
// NOTE: This service is being refactored significantly based on API documentation analysis.
// The original /ehr/ endpoints do not exist in the backend documentation.
// Functionality is mapped to /users, /healthcare, /medication, and /fhir endpoints.

import { apiRequest } from "../../../api/client";
import fhirService from "./fhirService"; // Assuming fhirService is updated separately
import { healthcare } from "../healthcareService"; // Use updated healthcare service
import { medicationService } from "../medicationService"; // Use updated medication service

/**
 * EHR service providing access to patient data via documented API endpoints.
 */
export const ehrService = {
  /**
   * Get comprehensive patient data by calling multiple relevant endpoints.
   * Original: GET /ehr/patients/{patientId}/data
   * Mapped: Calls getUserData, getMedicalRecords, etc.
   * @param {string} userId - User ID (assuming patientId maps to userId)
   * @returns {Promise<Object>} Combined patient data (structure TBD)
   */
  getPatientData: async (userId) => {
    try {
      // Example: Fetch user details and medical records
      // This needs refinement based on actual data requirements
      const [userData, medicalRecords] = await Promise.all([
        healthcare.getUserData(userId), // Mapped to GET /users/users/{userId}
        healthcare.getMedicalRecords({ patient_id: userId }), // Mapped to GET /healthcare/medical-records
      ]);
      return { ...userData, medicalRecords }; // Combine results (adjust structure as needed)
    } catch (error) {
      console.error("Failed to fetch comprehensive patient data:", error);
      throw new Error("Failed to fetch patient EHR data");
    }
  },

  /**
   * Search for patients (Mapped from /ehr/patients/search)
   * @param {Object} searchParams - Search parameters (e.g., name, dob)
   * @returns {Promise<Object>} Search results (Users with role=\'patient\')
   */
  searchPatients: (searchParams) =>
    healthcare.getUserList({ ...searchParams, role: "patient" }), // Mapped to GET /users/users

  /**
   * Get patient medications (Mapped from /ehr/patients/{patientId}/medications)
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Patient medications
   */
  getPatientMedications: (patientId) =>
    medicationService.getMedications({ patient_id: patientId }), // Mapped to GET /medication/medications

  /**
   * Get patient allergies (Mapped from /ehr/patients/{patientId}/allergies)
   * Assumes backend supports FHIR AllergyIntolerance resource.
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Patient allergies (FHIR Bundle)
   */
  getPatientAllergies: (patientId) =>
    fhirService.search("AllergyIntolerance", { patient: patientId }, {
        errorMessage: "Failed to fetch patient allergies via FHIR",
      }
    ),

  /**
   * Get patient conditions (Mapped from /ehr/patients/{patientId}/conditions)
   * Assumes backend supports FHIR Condition resource.
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Patient conditions (FHIR Bundle)
   */
  getPatientConditions: (patientId) =>
    fhirService.search("Condition", { patient: patientId }, {
        errorMessage: "Failed to fetch patient conditions via FHIR",
      }
    ),

  /**
   * Get patient lab results (Mapped from /ehr/patients/{patientId}/lab-results)
   * Assumes backend supports FHIR Observation resource with category=\'laboratory\'.
   * @param {string} patientId - Patient ID
   * @param {string} startDate - Start date for results range (ISO format)
   * @param {string} endDate - End date for results range (ISO format)
   * @returns {Promise<Object>} Patient lab results (FHIR Bundle)
   */
  getPatientLabResults: (patientId, startDate = null, endDate = null) => {
    const params = { patient: patientId, category: "laboratory" };
    if (startDate) params.date = `ge${startDate}`;
    if (endDate) params.date = `${params.date ? params.date + "&" : ""}le${endDate}`;
    return fhirService.search("Observation", params, {
      errorMessage: "Failed to fetch patient lab results via FHIR",
    });
  },

  /**
   * Get patient vital signs (Mapped from /ehr/patients/{patientId}/vitals)
   * Assumes backend supports FHIR Observation resource with category=\'vital-signs\'.
   * @param {string} patientId - Patient ID
   * @param {string} startDate - Start date for vitals range (ISO format)
   * @param {string} endDate - End date for vitals range (ISO format)
   * @returns {Promise<Object>} Patient vital signs (FHIR Bundle)
   */
  getPatientVitals: (patientId, startDate = null, endDate = null) => {
    const params = { patient: patientId, category: "vital-signs" };
    if (startDate) params.date = `ge${startDate}`;
    if (endDate) params.date = `${params.date ? params.date + "&" : ""}le${endDate}`;
    return fhirService.search("Observation", params, {
      errorMessage: "Failed to fetch patient vital signs via FHIR",
    });
  },

  /**
   * Get patient encounters (Mapped from /ehr/patients/{patientId}/encounters)
   * Assumes backend supports FHIR Encounter resource.
   * @param {string} patientId - Patient ID
   * @param {string} startDate - Start date for encounters range (ISO format)
   * @param {string} endDate - End date for encounters range (ISO format)
   * @returns {Promise<Object>} Patient encounters (FHIR Bundle)
   */
  getPatientEncounters: (patientId, startDate = null, endDate = null) => {
    const params = { patient: patientId };
    if (startDate) params.date = `ge${startDate}`;
    if (endDate) params.date = `${params.date ? params.date + "&" : ""}le${endDate}`;
    return fhirService.search("Encounter", params, {
      errorMessage: "Failed to fetch patient encounters via FHIR",
    });
  },

  /**
   * Get patient immunizations (Mapped from /ehr/patients/{patientId}/immunizations)
   * Assumes backend supports FHIR Immunization resource.
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Patient immunizations (FHIR Bundle)
   */
  getPatientImmunizations: (patientId) =>
    fhirService.search("Immunization", { patient: patientId }, {
        errorMessage: "Failed to fetch patient immunizations via FHIR",
      }
    ),

  /**
   * Get patient care plans (Mapped from /ehr/patients/{patientId}/care-plans)
   * Assumes backend supports FHIR CarePlan resource.
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Patient care plans (FHIR Bundle)
   */
  getPatientCarePlans: (patientId) =>
    fhirService.search("CarePlan", { patient: patientId }, {
        errorMessage: "Failed to fetch patient care plans via FHIR",
      }
    ),

  /**
   * Create a new patient user record (Mapped from /ehr/patients)
   * @param {Object} patientData - Patient data (ensure role=\'patient\' is included or set by backend)
   * @returns {Promise<Object>} Created user record
   */
  createPatient: (patientData) =>
    apiRequest("POST", "/users/users", patientData, {
      errorMessage: "Failed to create patient user record",
      successMessage: "Patient user record created successfully",
    }),

  /**
   * Update a patient user record (Mapped from /ehr/patients/{patientId})
   * @param {string} userId - User ID (assuming patientId maps to userId)
   * @param {Object} patientData - Updated patient data
   * @returns {Promise<Object>} Updated user record
   */
  updatePatient: (userId, patientData) =>
    apiRequest("PUT", `/users/users/${userId}`, patientData, {
      errorMessage: "Failed to update patient user record",
      successMessage: "Patient user record updated successfully",
    }),

  /**
   * Create a new medication record (Mapped from /ehr/patients/{patientId}/medications)
   * @param {Object} medicationData - Medication data (should include patient reference)
   * @returns {Promise<Object>} Created medication record
   */
  createMedication: (medicationData) =>
    medicationService.createMedication(medicationData), // Use updated medication service

  /**
   * Create a new allergy record (Mapped from /ehr/patients/{patientId}/allergies)
   * Assumes backend supports POST /fhir/AllergyIntolerance
   * @param {Object} allergyData - FHIR AllergyIntolerance resource
   * @returns {Promise<Object>} Created allergy record
   */
  createAllergy: (allergyData) =>
    fhirService.create("AllergyIntolerance", allergyData, {
      errorMessage: "Failed to create allergy record via FHIR",
      successMessage: "Allergy record created successfully",
    }),

  /**
   * Create a new condition record (Mapped from /ehr/patients/{patientId}/conditions)
   * Assumes backend supports POST /fhir/Condition
   * @param {Object} conditionData - FHIR Condition resource
   * @returns {Promise<Object>} Created condition record
   */
  createCondition: (conditionData) =>
    fhirService.create("Condition", conditionData, {
      errorMessage: "Failed to create condition record via FHIR",
      successMessage: "Condition record created successfully",
    }),

  /**
   * Export patient data to FHIR format (Mapped from /ehr/patients/{patientId}/export/fhir)
   * Assumes backend supports GET /fhir/Patient/{id}/$export
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} FHIR Bundle or export status
   */
  exportToFHIR: (patientId) =>
    fhirService.operation("Patient", patientId, "$export", "GET", null, {
      errorMessage: "Failed to initiate FHIR export for patient",
    }),

  /**
   * Import FHIR data into EHR (Mapped from /ehr/import/fhir)
   * NOTE: No direct backend endpoint documented. Assumes POST /fhir with a Bundle.
   * This needs verification with the backend team.
   * @param {Object} fhirBundle - FHIR Bundle resource
   * @returns {Promise<Object>} Import result
   */
  // importFromFHIR: (fhirBundle) =>
  //   fhirService.create("Bundle", fhirBundle, { // Or potentially fhirService.transaction(fhirBundle)
  //     errorMessage: "Failed to import FHIR data",
  //     successMessage: "FHIR data import initiated successfully",
  //   }),

  /**
   * FHIR service instance for direct FHIR operations
   */
  fhir: fhirService,
};

export default ehrService;

