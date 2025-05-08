// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * Server-side API route for handling logout and clearing authentication cookies
 * 
 * This route clears all authentication-related cookies, effectively logging
 * the user out of the application by removing their authentication tokens.
 * 
 * Both HttpOnly secure cookies (containing tokens) and non-HttpOnly cookies
 * (containing user info for UI) are cleared.
 */
export async function POST(request: NextRequest) {
  try {
    // Create the response
    const response = NextResponse.json({ 
      success: true
    });
    
    // Clear secure HttpOnly cookie for access token
    response.cookies.set({
      name: config.authCookieName,
      value: '',
      httpOnly: true,
      secure: config.secureCookies,
      sameSite: 'strict',
      domain: config.cookieDomain,
      path: '/',
      maxAge: 0 // Expire immediately
    });
    
    // Clear secure HttpOnly cookie for refresh token
    response.cookies.set({
      name: config.refreshCookieName,
      value: '',
      httpOnly: true,
      secure: config.secureCookies,
      sameSite: 'strict',
      domain: config.cookieDomain,
      path: '/',
      maxAge: 0 // Expire immediately
    });
    
    // Clear non-HttpOnly cookies for user information
    // User role cookie
    response.cookies.set({
      name: config.userRoleCookieName,
      value: '',
      httpOnly: false,
      secure: config.secureCookies,
      sameSite: 'strict',
      domain: config.cookieDomain,
      path: '/',
      maxAge: 0 // Expire immediately
    });
    
    // Email verification status cookie
    response.cookies.set({
      name: config.emailVerifiedCookieName,
      value: '',
      httpOnly: false,
      secure: config.secureCookies,
      sameSite: 'strict',
      domain: config.cookieDomain,
      path: '/',
      maxAge: 0 // Expire immediately
    });
    
    // Account approval status cookie
    response.cookies.set({
      name: config.isApprovedCookieName,
      value: '',
      httpOnly: false,
      secure: config.secureCookies,
      sameSite: 'strict',
      domain: config.cookieDomain,
      path: '/',
      maxAge: 0 // Expire immediately
    });
    
    // Add cache control headers to prevent caching of this response
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error in logout API route:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}