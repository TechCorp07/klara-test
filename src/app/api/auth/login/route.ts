// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * POST /api/auth/login
 * 
 * Handles user login by forwarding to the backend and setting JWT cookies
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

    // Forward request to backend
    const backendUrl = `${config.apiBaseUrl}/users/auth/login/`;
    console.log('🔗 Forwarding login request to:', backendUrl);
    
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        username: body.username,
        password: body.password,
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

    console.log('✅ Backend login successful');

    // Extract JWT token and set HTTP-only cookie
    const jwtToken = responseData.access_token;
    
    if (!jwtToken) {
      return NextResponse.json(
        { error: 'No access token received from backend' },
        { status: 500 }
      );
    }

    // Create response with user data (frontend expects `token` field)
    const loginResponse = {
      token: jwtToken,
      user: responseData.user,
      requires_2fa: responseData.requires_2fa || false,
      session: responseData.session,
      permissions: responseData.permissions,
    };

    // Set JWT cookie
    const response = NextResponse.json(loginResponse);
    
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

/**
 * GET method not allowed - this endpoint should only be called via POST
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}