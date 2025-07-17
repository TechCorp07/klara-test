// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * POST /api/auth/login
 * 
 * Tab-specific authentication only - NO cookies
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

    // Get tab ID (required for tab-specific auth)
    const tabId = body.tabId || request.headers.get('X-Tab-ID');
    
    if (!tabId) {
      return NextResponse.json(
        { error: 'Tab ID is required for authentication' },
        { status: 400 }
      );
    }

    // Forward request to backend
    const backendUrl = `${config.apiBaseUrl}/users/auth/login/`;
    console.log('🔗 Forwarding tab-specific login to:', backendUrl);
    
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Tab-ID': tabId,
        'X-Auth-Type': 'tab-specific',
      },
      body: JSON.stringify({
        username: body.username,
        password: body.password,
        tab_id: tabId,
        auth_type: 'tab_specific',
      }),
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

    console.log('✅ Backend tab-specific login successful');

    // Extract JWT token
    const jwtToken = responseData.access_token;
    
    if (!jwtToken) {
      return NextResponse.json(
        { error: 'No access token received from backend' },
        { status: 500 }
      );
    }

    // Create response with user data (NO COOKIES SET)
    const loginResponse = {
      token: jwtToken,
      refresh_token: responseData.refresh_token,
      user: responseData.user,
      requires_2fa: responseData.requires_2fa || false,
      session: responseData.session,
      permissions: responseData.permissions,
      tab_id: tabId,
    };

    const response = NextResponse.json(loginResponse);
    
    // Add security headers (NO COOKIES)
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