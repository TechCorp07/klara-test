// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * Server-side API route for handling login and setting secure HttpOnly cookies
 * 
 * This route receives authentication data (access token, refresh token, user info)
 * from the client and sets secure cookies to store the tokens.
 * 
 * The tokens are stored in HttpOnly cookies for security, while non-sensitive
 * user information is stored in regular cookies for client-side access.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { access, refresh, user } = await request.json();
    
    // Validate required data
    if (!access || !refresh || !user) {
      return NextResponse.json(
        { error: 'Missing required authentication data' },
        { status: 400 }
      );
    }
    
    // Create the response
    const response = NextResponse.json({ 
      success: true, 
      user 
    });
    
    // Set secure HttpOnly cookie for access token
    response.cookies.set({
      name: config.authCookieName,
      value: access,
      httpOnly: true,
      secure: config.secureCookies,
      sameSite: 'strict',
      domain: config.cookieDomain,
      path: '/',
      maxAge: 60 * config.accessTokenExpiryMinutes // Match JWT expiration
    });
    
    // Set secure HttpOnly cookie for refresh token
    response.cookies.set({
      name: config.refreshCookieName,
      value: refresh,
      httpOnly: true,
      secure: config.secureCookies,
      sameSite: 'strict',
      domain: config.cookieDomain,
      path: '/',
      maxAge: 60 * 60 * 24 * config.refreshTokenExpiryDays // Match refresh token expiration
    });
    
    // Set non-HttpOnly cookies for information needed client-side
    // User role for role-based UI rendering
    response.cookies.set({
      name: config.userRoleCookieName,
      value: user.role,
      httpOnly: false,
      secure: config.secureCookies,
      sameSite: 'strict',
      domain: config.cookieDomain,
      path: '/',
      maxAge: 60 * 60 * 24 * config.refreshTokenExpiryDays
    });
    
    // Email verification status for UI feedback
    response.cookies.set({
      name: config.emailVerifiedCookieName,
      value: user.email_verified.toString(),
      httpOnly: false,
      secure: config.secureCookies,
      sameSite: 'strict',
      domain: config.cookieDomain,
      path: '/',
      maxAge: 60 * 60 * 24 * config.refreshTokenExpiryDays
    });
    
    // Account approval status for UI feedback
    response.cookies.set({
      name: config.isApprovedCookieName,
      value: (user.is_approved === false ? 'false' : 'true'),
      httpOnly: false,
      secure: config.secureCookies,
      sameSite: 'strict',
      domain: config.cookieDomain,
      path: '/',
      maxAge: 60 * 60 * 24 * config.refreshTokenExpiryDays
    });
    
    return response;
  } catch (error) {
    console.error('Error in login API route:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}