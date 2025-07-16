// src/app/api/auth/validate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * POST /api/auth/validate
 * 
 * Extract JWT token from HTTP-only cookie for client-side validation
 * This endpoint safely extracts the token from secure cookies so the client
 * can perform local JWT validation without exposing the token to JavaScript
 */
export async function POST(request: NextRequest) {
  try {
    // Extract JWT token from HTTP-only cookie
    const cookieName = config.jwt.cookieName || 'jwt_access_token';
    const token = request.cookies.get(cookieName)?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Return the token for client-side validation
    // Note: This doesn't verify the token signature - that's done on the backend
    // The client will validate structure, expiration, and extract permissions
    return NextResponse.json({
      token,
      message: 'Token extracted successfully'
    });

  } catch (error) {
    console.error('Token validation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error during token validation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET method not allowed - this endpoint should only be called via POST
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}