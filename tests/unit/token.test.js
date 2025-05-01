// test/token.test.js
// Test script for token refresh mechanism

const assert = require('assert');
const { token } = require('../api');

// Mock fetch for testing
global.fetch = jest.fn();

describe('Token Refresh Mechanism', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('refreshToken should call the correct endpoint', async () => {
    // Mock successful response
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access: 'new-access-token' })
      })
    );

    const refreshToken = 'test-refresh-token';
    const result = await token.refreshToken(refreshToken);
    
    // Check that fetch was called with the correct arguments
    expect(fetch).toHaveBeenCalledWith('/api/users/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
      credentials: 'same-origin'
    });
    
    // Check the result
    expect(result).toEqual({ access: 'new-access-token' });
  });

  test('refreshToken should handle errors correctly', async () => {
    // Mock error response
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ detail: 'Invalid token' })
      })
    );

    const refreshToken = 'invalid-refresh-token';
    
    // The function should throw an error
    await expect(token.refreshToken(refreshToken)).rejects.toThrow();
    
    // Check that fetch was called
    expect(fetch).toHaveBeenCalled();
  });
});
