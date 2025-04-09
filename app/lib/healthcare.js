// lib/healthcare.js
import api from './api';

// Healthcare API service for medical records, medications, etc.
export const healthcare = {
  // Medical Records
  getMedicalRecord: async (id) => {
    const response = await api.get(`/healthcare/medical-records/${id}/`);
    return response.data;
  },
  
  getMedicalRecords: async (patientId, options = {}) => {
    const params = new URLSearchParams();
    if (patientId) params.append('patient', patientId);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const response = await api.get(`/healthcare/medical-records/?${params.toString()}`);
    return response.data;
  },
  
  createMedicalRecord: async (recordData) => {
    const response = await api.post('/healthcare/medical-records/', recordData);
    return response.data;
  },
  
  updateMedicalRecord: async (id, recordData) => {
    const response = await api.patch(`/healthcare/medical-records/${id}/`, recordData);
    return response.data;
  },
  
  // Medications
  getMedication: async (id) => {
    const response = await api.get(`/healthcare/medications/${id}/`);
    return response.data;
  },
  
  getMedications: async (medicalRecordId, options = {}) => {
    const params = new URLSearchParams();
    if (medicalRecordId) params.append('medical_record', medicalRecordId);
    if (options.active !== undefined) params.append('active', options.active.toString());
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const response = await api.get(`/healthcare/medications/?${params.toString()}`);
    return response.data;
  },
  
  createMedication: async (medicationData) => {
    const response = await api.post('/healthcare/medications/', medicationData);
    return response.data;
  },
  
  updateMedication: async (id, medicationData) => {
    const response = await api.patch(`/healthcare/medications/${id}/`, medicationData);
    return response.data;
  },
  
  // Allergies
  getAllergy: async (id) => {
    const response = await api.get(`/healthcare/allergies/${id}/`);
    return response.data;
  },
  
  getAllergies: async (medicalRecordId, options = {}) => {
    const params = new URLSearchParams();
    if (medicalRecordId) params.append('medical_record', medicalRecordId);
    if (options.severity) params.append('severity', options.severity);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const response = await api.get(`/healthcare/allergies/?${params.toString()}`);
    return response.data;
  },
  
  createAllergy: async (allergyData) => {
    const response = await api.post('/healthcare/allergies/', allergyData);
    return response.data;
  },
  
  updateAllergy: async (id, allergyData) => {
    const response = await api.patch(`/healthcare/allergies/${id}/`, allergyData);
    return response.data;
  },
  
  // Conditions
  getCondition: async (id) => {
    const response = await api.get(`/healthcare/conditions/${id}/`);
    return response.data;
  },
  
  getConditions: async (medicalRecordId, options = {}) => {
    const params = new URLSearchParams();
    if (medicalRecordId) params.append('medical_record', medicalRecordId);
    if (options.status) params.append('status', options.status);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const response = await api.get(`/healthcare/conditions/?${params.toString()}`);
    return response.data;
  },
  
  createCondition: async (conditionData) => {
    const response = await api.post('/healthcare/conditions/', conditionData);
    return response.data;
  },
  
  updateCondition: async (id, conditionData) => {
    const response = await api.patch(`/healthcare/conditions/${id}/`, conditionData);
    return response.data;
  },
  
  // Immunizations
  getImmunization: async (id) => {
    const response = await api.get(`/healthcare/immunizations/${id}/`);
    return response.data;
  },
  
  getImmunizations: async (medicalRecordId, options = {}) => {
    const params = new URLSearchParams();
    if (medicalRecordId) params.append('medical_record', medicalRecordId);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const response = await api.get(`/healthcare/immunizations/?${params.toString()}`);
    return response.data;
  },
  
  createImmunization: async (immunizationData) => {
    const response = await api.post('/healthcare/immunizations/', immunizationData);
    return response.data;
  },
  
  // Lab Tests and Results
  getLabTest: async (id) => {
    const response = await api.get(`/healthcare/lab-tests/${id}/`);
    return response.data;
  },
  
  getLabTests: async (medicalRecordId, options = {}) => {
    const params = new URLSearchParams();
    if (medicalRecordId) params.append('medical_record', medicalRecordId);
    if (options.status) params.append('status', options.status);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const response = await api.get(`/healthcare/lab-tests/?${params.toString()}`);
    return response.data;
  },
  
  getLabResults: async (testId) => {
    const response = await api.get(`/healthcare/lab-results/?lab_test=${testId}`);
    return response.data;
  },
  
  // Vital Signs
  getVitalSigns: async (medicalRecordId, options = {}) => {
    const params = new URLSearchParams();
    if (medicalRecordId) params.append('medical_record', medicalRecordId);
    if (options.measurement_type) params.append('measurement_type', options.measurement_type);
    if (options.measurement_ids) params.append('measurement_ids', options.measurement_ids);
    if (options.start_date) params.append('start_date', options.start_date);
    if (options.end_date) params.append('end_date', options.end_date);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const response = await api.get(`/healthcare/vital-signs/?${params.toString()}`);
    return response.data;
  },
  
  createVitalSign: async (vitalSignData) => {
    const response = await api.post('/healthcare/vital-signs/', vitalSignData);
    return response.data;
  },
  
  // FHIR Resources
  getFHIRResource: async (resourceType, id) => {
    const response = await api.get(`/fhir/${resourceType}/${id}/`);
    return response.data;
  },
  
  searchFHIRResources: async (resourceType, searchParams) => {
    const params = new URLSearchParams(searchParams);
    const response = await api.get(`/fhir/${resourceType}/?${params.toString()}`);
    return response.data;
  },
  
  createFHIRResource: async (resourceType, resourceData) => {
    const response = await api.post(`/fhir/${resourceType}/`, resourceData);
    return response.data;
  },
  
  updateFHIRResource: async (resourceType, id, resourceData) => {
    const response = await api.patch(`/fhir/${resourceType}/${id}/`, resourceData);
    return response.data;
  },
  
  // Patient Portal
  getPatientProfile: async (patientId) => {
    const response = await api.get(`/fhir/Patient/${patientId}/`);
    return response.data;
  },
  
  updatePatientProfile: async (patientId, profileData) => {
    const response = await api.patch(`/fhir/Patient/${patientId}/`, profileData);
    return response.data;
  },
  
  getPatientAccessHistory: async (patientId, options = {}) => {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const response = await api.get(`/audit/compliance/patient-access/${patientId}/?${params.toString()}`);
    return response.data;
  },
};

export default healthcare;
