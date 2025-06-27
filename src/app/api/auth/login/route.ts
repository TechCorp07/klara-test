// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * Server-side API route for handling login and setting secure HttpOnly cookies
 * 
 * This route receives authentication data (token and user info)
 * from the client and sets secure cookies to store the token.
 * 
 * The tokens are stored in HttpOnly cookies for security, while non-sensitive
 * user information is stored in regular cookies for client-side access.
 */

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    console.error('Login API route received:', body); // For debugging
    
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
      user 
    });
    
    // Set secure HttpOnly cookie for access token
    response.cookies.set({
      name: config.authCookieName,
      value: token,
      httpOnly: true,
      secure: config.secureCookies,
      sameSite: 'strict' as const,
      path: '/',
      ...(config.cookieDomain && { domain: config.cookieDomain })
    });
    
    // Set non-HttpOnly cookies for information needed client-side
    // User role for role-based UI rendering
    if (user.role) {
      response.cookies.set({
        name: config.userRoleCookieName,
        value: user.role,
        httpOnly: false,
        secure: config.secureCookies,
        sameSite: 'strict',
        domain: config.cookieDomain,
        path: '/',
        //maxAge: 60 * config.accessTokenExpiryMinutes
      });
    }
    
    // Email verification status for UI feedback
    // Note: Your API response may not include this field, so check first
    if (user.email_verified !== undefined) {
      response.cookies.set({
        name: config.emailVerifiedCookieName,
        value: String(user.email_verified),
        httpOnly: false,
        secure: config.secureCookies,
        sameSite: 'strict',
        domain: config.cookieDomain,
        path: '/',
        //maxAge: 60 * config.accessTokenExpiryMinutes
      });
    }
    
    // Account approval status for UI feedback
    if (user.is_approved !== undefined) {
      response.cookies.set({
        name: config.isApprovedCookieName,
        value: String(user.is_approved),
        httpOnly: false,
        secure: config.secureCookies,
        sameSite: 'strict',
        domain: config.cookieDomain,
        path: '/',
        //maxAge: 60 * config.accessTokenExpiryMinutes
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error in login API route:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}