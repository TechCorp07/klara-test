// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * POST /api/auth/logout
 * 
 * Handles tab-specific logout (replaces cookie-based logout)
 * Now expects Authorization header instead of cookies
 */
export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json().catch(() => ({}));
    const tabId = body.tabId;
    
    // Get JWT token from Authorization header (tab-specific auth)
    const authHeader = request.headers.get('authorization');
    const jwtToken = authHeader?.replace('Bearer ', '');
    
    if (!jwtToken) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }
    
    // Create response with success (no cookies to clear)
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
      ...(tabId && { tab_id: tabId }),
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;

  } catch (error) {
    console.error('❌ Logout API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during logout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}