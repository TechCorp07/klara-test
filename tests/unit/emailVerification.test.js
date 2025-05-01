// test/emailVerification.test.js
// Test script for email verification flow

const assert = require('assert');
const { auth } = require('../api');

// Mock fetch for testing
global.fetch = jest.fn();

describe('Email Verification Flow', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('requestEmailVerification should call the correct endpoint', async () => {
    // Mock successful response
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Verification email sent' })
      })
    );

    const email = 'test@example.com';
    const result = await auth.requestEmailVerification({ email });
    
    // Check that fetch was called with the correct arguments
    expect(fetch).toHaveBeenCalledWith('/api/users/request-email-verification/', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ email }),
    }));
    
    // Check the result
    expect(result).toEqual({ success: true, message: 'Verification email sent' });
  });

  test('verifyEmail should call the correct endpoint', async () => {
    // Mock successful response
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Email verified successfully' })
      })
    );

    const token = 'test-verification-token';
    const result = await auth.verifyEmail({ token });
    
    // Check that fetch was called with the correct arguments
    expect(fetch).toHaveBeenCalledWith('/api/users/verify-email/', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ token }),
    }));
    
    // Check the result
    expect(result).toEqual({ success: true, message: 'Email verified successfully' });
  });

  test('verifyEmail should handle invalid tokens', async () => {
    // Mock error response
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ detail: 'Invalid verification token' })
      })
    );

    const token = 'invalid-token';
    
    // The function should throw an error
    await expect(auth.verifyEmail({ token })).rejects.toThrow();
    
    // Check that fetch was called
    expect(fetch).toHaveBeenCalled();
  });
});
