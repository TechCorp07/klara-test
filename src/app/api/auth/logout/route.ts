// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * Server-side API route for handling logout and clearing secure HttpOnly cookies
 * 
 * This route clears all authentication-related cookies to ensure complete logout
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Logout API route called');
    
    // Create the response - always return success for logout
    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully'
    });
    
    // Clear the main auth token (HttpOnly) - this is the critical part
    response.cookies.set({
      name: config.authCookieName,
      value: '',
      httpOnly: true,
      secure: config.secureCookies,
      sameSite: 'strict' as const,
      path: '/',
      expires: new Date(0), // Expire immediately
      ...(config.cookieDomain && { domain: config.cookieDomain })
    });
    
    console.log('✅ Authentication cookies cleared');
    
    return response;
  } catch (error) {
    console.error('Error in logout API route:', error);
    
    // 🔧 CRITICAL: Even if there's an error, return success for logout
    // We don't want logout to fail and trap users
    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out (with errors but cookies cleared)' 
    });
    
    // Still try to clear the cookie even if there was an error
    try {
      response.cookies.set({
        name: config.authCookieName,
        value: '',
        httpOnly: true,
        secure: config.secureCookies,
        sameSite: 'strict' as const,
        path: '/',
        expires: new Date(0),
        ...(config.cookieDomain && { domain: config.cookieDomain })
      });
    } catch {
      // Ignore cookie clearing errors
    }
    
    return response;
  }
}