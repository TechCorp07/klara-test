// /api/auth/reset-password.js
import { NextResponse } from 'next/server';
import authAPI from '@/api/auth';

/**
 * API route handler for password reset
 * 
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - The response object
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body;
    
    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      );
    }
    
    // Call the auth API to reset password
    const response = await authAPI.resetPassword({ token, password });
    
    return NextResponse.json(
      { message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    
    return NextResponse.json(
      { message: error.response?.data?.detail || 'Failed to reset password' },
      { status: error.response?.status || 500 }
    );
  }
}
