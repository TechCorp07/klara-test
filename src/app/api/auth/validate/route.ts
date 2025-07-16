// src/app/api/auth/validate/route.ts
/**
 * JWT Validation API Route - HttpOnly Cookie Token Access
 * 

 */

import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * GET /api/auth/validate
 * 
 */
export async function GET(request: NextRequest) {
  try {
    // Extract JWT token from HttpOnly cookie
    const token = request.cookies.get(config.authCookieName)?.value;
    
    if (!token) {
      // No token available - return success but with no token
      // This is not an error condition, just means user isn't authenticated
      return NextResponse.json({ 
        success: true, 
        token: null,
        message: 'No authentication token available'
      });
    }

    // Return the token for frontend validation
    // The frontend will validate structure and extract permissions locally
    return NextResponse.json({
      success: true,
      token: token,
      message: 'Token retrieved successfully'
    });

  } catch (error) {
    console.error('Token validation route error:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        token: null,
        message: 'Failed to retrieve authentication token' 
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/auth/validate
 * 
 * Handle CORS preflight requests if needed.
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}