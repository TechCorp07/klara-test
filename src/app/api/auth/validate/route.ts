// src/app/api/auth/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * POST /api/auth/validate
 */ 
export async function POST(request: NextRequest) {
  try {
    // Extract JWT token from HTTP-only cookie using the correct config property
    const cookieName = config.authCookieName;
    const token = request.cookies.get(cookieName)?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

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