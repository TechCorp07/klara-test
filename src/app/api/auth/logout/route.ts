// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * POST /api/auth/logout
 * 
 * Handles user logout by clearing JWT cookies and notifying backend
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Logout API: Starting logout process...');
    
    // Get JWT token from cookie to authenticate the backend request
    const jwtToken = request.cookies.get(config.authCookieName)?.value;
    
    // Try to notify backend about logout if token exists
    if (jwtToken) {
      try {
        const backendUrl = `${config.apiBaseUrl}/users/auth/logout/`;
        console.log('🔗 Calling backend logout:', backendUrl);
        
        const backendResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
            'Accept': 'application/json',
          },
        });

        if (backendResponse.ok) {
          console.log('✅ Backend logout successful');
        } else {
          console.warn('⚠️ Backend logout failed, but continuing with frontend logout');
        }
      } catch (backendError) {
        console.warn('⚠️ Backend logout error, but continuing with frontend logout:', backendError);
      }
    } else {
      console.log('ℹ️ No JWT token found, skipping backend logout call');
    }
    
    // Create response
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

    console.log('✅ Logout API: Cookies cleared, logout complete');
    return response;

  } catch (error) {
    console.error('❌ Logout API error:', error);
    
    // Even if there's an error, still clear cookies and return success
    // because logout should always succeed on the client side
    const response = NextResponse.json({
      success: true,
      message: 'Logout completed (with errors)',
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    // Clear cookies even on error
    response.cookies.set({
      name: config.authCookieName,
      value: '',
      httpOnly: true,
      secure: config.secureCookies,
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    });

    response.cookies.set({
      name: config.refreshCookieName,
      value: '',
      httpOnly: true,
      secure: config.secureCookies,
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    });

    return response;
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