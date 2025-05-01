// test/fhir.test.js
// Test script for FHIR compliance enhancements

const assert = require('assert');
const { fhirService } = require('../lib/services/ehr/fhirService');

// Mock apiRequest for testing
jest.mock('../api/client', () => ({
  apiRequest: jest.fn()
}));

const { apiRequest } = require('../api/client');

describe('FHIR Compliance Features', () => {
  beforeEach(() => {
    apiRequest.mockClear();
  });

  test('exportData should call the correct endpoint for patient export', async () => {
    // Mock successful response
    apiRequest.mockResolvedValueOnce({ 
      statusUrl: '/api/fhir/export/status/123' 
    });

    const patientId = 'patient-123';
    const result = await fhirService.exportData('patient', patientId, { _type: 'Observation' });
    
    // Check that apiRequest was called with the correct arguments
    expect(apiRequest).toHaveBeenCalledWith(
      'GET', 
      `/api/fhir/Patient/${patientId}/$export`, 
      null, 
      expect.objectContaining({
        params: { _type: 'Observation' }
      })
    );
    
    // Check the result
    expect(result).toEqual({ statusUrl: '/api/fhir/export/status/123' });
  });

  test('validateResource should call the correct endpoint', async () => {
    // Mock successful response
    apiRequest.mockResolvedValueOnce({ 
      valid: true,
      issue: []
    });

    const resourceType = 'Patient';
    const resource = { resourceType: 'Patient', name: [{ given: ['John'], family: 'Doe' }] };
    
    const result = await fhirService.validateResource(resourceType, resource);
    
    // Check that apiRequest was called with the correct arguments
    expect(apiRequest).toHaveBeenCalledWith(
      'POST', 
      `/api/fhir/${resourceType}/$validate`, 
      resource, 
      expect.objectContaining({
        errorMessage: 'FHIR resource validation failed'
      })
    );
    
    // Check the result
    expect(result).toEqual({ valid: true, issue: [] });
  });

  test('convertToFHIR should call the correct endpoint', async () => {
    // Mock successful response
    apiRequest.mockResolvedValueOnce({ 
      resourceType: 'Bundle',
      entry: [{ resource: { resourceType: 'Patient' } }]
    });

    const sourceFormat = 'hl7';
    const data = { data: 'MSH|^~\\&|...' };
    
    const result = await fhirService.convertToFHIR(sourceFormat, data);
    
    // Check that apiRequest was called with the correct arguments
    expect(apiRequest).toHaveBeenCalledWith(
      'POST', 
      `/api/fhir/convert/${sourceFormat}`, 
      data, 
      expect.objectContaining({
        errorMessage: `Failed to convert ${sourceFormat} to FHIR`
      })
    );
    
    // Check the result
    expect(result).toEqual({ 
      resourceType: 'Bundle',
      entry: [{ resource: { resourceType: 'Patient' } }]
    });
  });

  test('getPatientRecord should call the correct endpoint', async () => {
    // Mock successful response
    apiRequest.mockResolvedValueOnce({ 
      resourceType: 'Bundle',
      entry: []
    });

    const patientId = 'patient-123';
    
    const result = await fhirService.getPatientRecord(patientId);
    
    // Check that apiRequest was called with the correct arguments
    expect(apiRequest).toHaveBeenCalledWith(
      'GET', 
      `/api/fhir/Patient/${patientId}/$everything`, 
      null, 
      expect.objectContaining({
        errorMessage: 'Failed to fetch complete patient record'
      })
    );
    
    // Check the result
    expect(result).toEqual({ 
      resourceType: 'Bundle',
      entry: []
    });
  });
});
