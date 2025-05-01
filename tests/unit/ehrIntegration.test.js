// test/ehrIntegration.test.js
// Test script for healthcare system integration

const assert = require('assert');
const { ehr } = require('../api');

// Mock apiRequest for testing
jest.mock('../api/client', () => ({
  apiRequest: jest.fn()
}));

const { apiRequest } = require('../api/client');

describe('Healthcare System Integration', () => {
  beforeEach(() => {
    apiRequest.mockClear();
  });

  test('getAvailableSystems should call the correct endpoint', async () => {
    // Mock successful response
    apiRequest.mockResolvedValueOnce({ 
      systems: [
        { id: 'epic', name: 'Epic' },
        { id: 'cerner', name: 'Cerner' },
        { id: 'meditech', name: 'Meditech' }
      ]
    });

    const result = await ehr.getAvailableSystems();
    
    // Check that apiRequest was called with the correct arguments
    expect(apiRequest).toHaveBeenCalledWith(
      'GET', 
      '/api/ehr/systems', 
      null, 
      expect.objectContaining({
        errorMessage: 'Failed to fetch available EHR systems'
      })
    );
    
    // Check the result
    expect(result).toEqual({ 
      systems: [
        { id: 'epic', name: 'Epic' },
        { id: 'cerner', name: 'Cerner' },
        { id: 'meditech', name: 'Meditech' }
      ]
    });
  });

  test('configureIntegration should call the correct endpoint', async () => {
    // Mock successful response
    apiRequest.mockResolvedValueOnce({ 
      success: true,
      message: 'Integration configured successfully'
    });

    const systemId = 'epic';
    const config = {
      apiUrl: 'https://api.epic.com/fhir',
      apiKey: 'test-api-key',
      useOAuth: false
    };
    
    const result = await ehr.configureIntegration(systemId, config);
    
    // Check that apiRequest was called with the correct arguments
    expect(apiRequest).toHaveBeenCalledWith(
      'POST', 
      `/api/ehr/systems/${systemId}/configure`, 
      config, 
      expect.objectContaining({
        errorMessage: 'Failed to configure EHR integration',
        successMessage: 'EHR integration configured successfully'
      })
    );
    
    // Check the result
    expect(result).toEqual({ 
      success: true,
      message: 'Integration configured successfully'
    });
  });

  test('testConnection should call the correct endpoint', async () => {
    // Mock successful response
    apiRequest.mockResolvedValueOnce({ 
      success: true,
      message: 'Connection successful'
    });

    const systemId = 'cerner';
    
    const result = await ehr.testConnection(systemId);
    
    // Check that apiRequest was called with the correct arguments
    expect(apiRequest).toHaveBeenCalledWith(
      'POST', 
      `/api/ehr/systems/${systemId}/test`, 
      null, 
      expect.objectContaining({
        errorMessage: 'Failed to test EHR connection'
      })
    );
    
    // Check the result
    expect(result).toEqual({ 
      success: true,
      message: 'Connection successful'
    });
  });

  test('syncData should call the correct endpoint', async () => {
    // Mock successful response
    apiRequest.mockResolvedValueOnce({ 
      success: true,
      recordCount: 150,
      message: 'Data synchronized successfully'
    });

    const systemId = 'meditech';
    const options = { resourceTypes: ['Patient', 'Observation'] };
    
    const result = await ehr.syncData(systemId, options);
    
    // Check that apiRequest was called with the correct arguments
    expect(apiRequest).toHaveBeenCalledWith(
      'POST', 
      `/api/ehr/systems/${systemId}/sync`, 
      options, 
      expect.objectContaining({
        errorMessage: 'Failed to sync data with EHR system'
      })
    );
    
    // Check the result
    expect(result).toEqual({ 
      success: true,
      recordCount: 150,
      message: 'Data synchronized successfully'
    });
  });

  test('updateDataMappings should call the correct endpoint', async () => {
    // Mock successful response
    apiRequest.mockResolvedValueOnce({ 
      success: true,
      message: 'Data mappings updated successfully'
    });

    const systemId = 'epic';
    const mappings = {
      Patient: {
        name: 'PatientName',
        birthDate: 'DOB'
      }
    };
    
    const result = await ehr.updateDataMappings(systemId, mappings);
    
    // Check that apiRequest was called with the correct arguments
    expect(apiRequest).toHaveBeenCalledWith(
      'PUT', 
      `/api/ehr/systems/${systemId}/mappings`, 
      mappings, 
      expect.objectContaining({
        errorMessage: 'Failed to update data mappings',
        successMessage: 'Data mappings updated successfully'
      })
    );
    
    // Check the result
    expect(result).toEqual({ 
      success: true,
      message: 'Data mappings updated successfully'
    });
  });
});
