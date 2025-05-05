// /api/auth/setup-2fa.js
import { NextResponse } from 'next/server';
import authAPI from '@/api/auth';

/**
 * API route handler for setting up 2FA
 * Generates a QR code for Google Authenticator
 * 
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - The response object with QR code data
 */
export async function POST(request) {
  try {
    // Call the auth API to setup 2FA
    const response = await authAPI.setup2FA();
    
    // Return the QR code and secret
    return NextResponse.json({
      secret: response.secret,
      qr_code_url: response.qr_code_url
    }, { status: 200 });
  } catch (error) {
    console.error('2FA setup error:', error);
    
    return NextResponse.json(
      { message: error.response?.data?.detail || 'Failed to setup 2FA' },
      { status: error.response?.status || 500 }
    );
  }
}
