// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * POST /api/auth/logout
 * 
 * Handles user logout by clearing JWT cookies and optionally notifying backend
 */
export async function POST(request: NextRequest) {
  try {
    // Optionally notify backend about logout
    // You can add backend logout logic here if needed
    
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    // Clear JWT cookies
    response.cookies.set({
      name: config.authCookieName,
      value: '',
      httpOnly: true,
      secure: config.secureCookies,
      sameSite: 'strict',
      path: '/',
      expires: new Date(0), // Expire immediately
    });

    // Clear refresh token cookie if it exists
    response.cookies.set({
      name: config.refreshCookieName,
      value: '',
      httpOnly: true,
      secure: config.secureCookies,
      sameSite: 'strict',
      path: '/',
      expires: new Date(0), // Expire immediately
    });

    return response;

  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during logout',
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