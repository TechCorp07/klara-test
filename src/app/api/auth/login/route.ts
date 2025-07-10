// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Extract data from request body
    const { token, user } = body;
    
    // Validate required data
    if (!token || !user) {
      console.error('❌ Missing required authentication data', { 
        token: !!token, 
        user: !!user,
        tokenType: typeof token,
        userType: typeof user,
        bodyKeys: Object.keys(body || {})
      });
      return NextResponse.json(
        { error: 'Missing required authentication data' },
        { status: 400 }
      );
    }
    
    // Additional validation
    if (!user.email || !user.id) {
      console.error('❌ Invalid user data', { 
        hasEmail: !!user.email, 
        hasId: !!user.id,
        userKeys: Object.keys(user || {})
      });
      return NextResponse.json(
        { error: 'Invalid user data' },
        { status: 400 }
      );
    }
    
    // Create the response
    const response = NextResponse.json({ 
      success: true, 
      message: 'Authentication cookies set successfully'
    });
    
    // Set HttpOnly cookie for access token
    response.cookies.set({
      name: config.authCookieName,
      value: token,
      httpOnly: true,
      secure: config.secureCookies,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * config.tokenExpiryDays,
      ...(config.cookieDomain && config.isProduction && { domain: config.cookieDomain })
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}