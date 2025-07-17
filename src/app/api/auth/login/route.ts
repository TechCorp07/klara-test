// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * POST /api/auth/login
 * 
 * Updated to support both cookie-based and tab-specific authentication
 * Automatically detects the authentication type from request headers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Detect authentication type
    const authType = request.headers.get('X-Auth-Type') || 'cookie';
    const tabId = body.tabId || request.headers.get('X-Tab-ID');
    const isTabSpecific = authType === 'tab-specific' || !!tabId;

    // Forward request to backend
    const backendUrl = `${config.apiBaseUrl}/users/auth/login/`;
    console.log(`🔗 Forwarding ${isTabSpecific ? 'tab-specific' : 'cookie-based'} login to:`, backendUrl);
    
    const backendHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const backendBody: Record<string, unknown> = {
      username: body.username,
      password: body.password,
    };

    // Add tab-specific headers and data if needed
    if (isTabSpecific && tabId) {
      backendHeaders['X-Tab-ID'] = tabId;
      backendHeaders['X-Auth-Type'] = 'tab-specific';
      backendBody.tab_id = tabId;
      backendBody.auth_type = 'tab_specific';
    }
    
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify(backendBody),
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend login failed:', responseData);
      return NextResponse.json(
        { 
          error: responseData.detail || responseData.message || 'Login failed',
          details: responseData 
        },
        { status: backendResponse.status }
      );
    }

    console.log(`✅ Backend login successful (${isTabSpecific ? 'tab-specific' : 'cookie-based'})`);

    // Extract JWT token
    const jwtToken = responseData.access_token;
    
    if (!jwtToken) {
      return NextResponse.json(
        { error: 'No access token received from backend' },
        { status: 500 }
      );
    }

    // Create response with user data
    const loginResponse = {
      token: jwtToken,
      refresh_token: responseData.refresh_token,
      user: responseData.user,
      requires_2fa: responseData.requires_2fa || false,
      session: responseData.session,
      permissions: responseData.permissions,
      ...(tabId && { tab_id: tabId }),
    };

    const response = NextResponse.json(loginResponse);
    
    // Set cookies only for non-tab-specific authentication
    if (!isTabSpecific) {
      response.cookies.set({
        name: config.authCookieName,
        value: jwtToken,
        httpOnly: true,
        secure: config.secureCookies,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      // Set refresh token cookie if provided
      if (responseData.refresh_token) {
        response.cookies.set({
          name: config.refreshCookieName,
          value: responseData.refresh_token,
          httpOnly: true,
          secure: config.secureCookies,
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }
    }

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during login',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}