// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * 🔒 SECURE: Server-side API route for handling login and setting ONLY HttpOnly cookies
 * 
 * This route receives authentication data (token and user info)
 * from the client and sets ONLY secure HttpOnly cookies.
 * 
 * Security Benefits:
 * - HttpOnly cookies cannot be accessed by JavaScript (XSS protection)
 * - Secure flag ensures HTTPS-only transmission
 * - SameSite=Strict prevents CSRF attacks
 */

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    console.log('🔒 Secure login API route received request'); // Don't log sensitive data
    
    // Extract data from request body
    const { token, user } = body;
    
    // Validate required data
    if (!token || !user) {
      console.error('Missing required authentication data', { token: !!token, user: !!user });
      return NextResponse.json(
        { error: 'Missing required authentication data' },
        { status: 400 }
      );
    }
    
    // Create the response
    const response = NextResponse.json({ 
      success: true, 
      message: 'Authentication cookies set successfully'
    });
    
    // 🔒 SECURE: Set ONLY HttpOnly cookie for access token
    response.cookies.set({
      name: config.authCookieName,
      value: token,
      httpOnly: true,  // 🔒 SECURE: Cannot be accessed by JavaScript
      secure: config.secureCookies,  // 🔒 SECURE: HTTPS only in production
      sameSite: 'strict',  // 🔒 SECURE: CSRF protection
      path: '/',
      maxAge: 60 * 60 * 24 * config.tokenExpiryDays, // Set proper expiry
      ...(config.cookieDomain && { domain: config.cookieDomain })
    });
    
    console.log('✅ Secure HttpOnly authentication cookie set');
    
    return response;
  } catch (error) {
    console.error('Error in secure login API route:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
