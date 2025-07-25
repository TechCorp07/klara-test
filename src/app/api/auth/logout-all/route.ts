// src/app/api/auth/logout-all/route.ts

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/logout-all
 */
export async function POST(_request: NextRequest) {
  try {
    // Create response with success
    const response = NextResponse.json({
      success: true,
      message: 'Global logout successful',
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;

  } catch (error) {
    console.error('❌ Global logout API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during global logout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}