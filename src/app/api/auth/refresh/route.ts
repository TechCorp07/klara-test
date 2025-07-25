// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * POST /api/auth/refresh
 * 
 * Refresh JWT access token for tab-specific authentication
 * Expects refresh_token in body and optional tabId
 */
export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json();
    const refreshToken = body.refresh_token;
    const tabId = body.tabId;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Forward refresh request to backend
    const backendUrl = `${config.apiBaseUrl}/users/auth/refresh/`;

    // GET THE AUTHORIZATION HEADER FROM THE INCOMING REQUEST
    const authHeader = request.headers.get('authorization');

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // FORWARD THE AUTHORIZATION HEADER
        ...(authHeader && { 'Authorization': authHeader }),
        ...(tabId && { 'X-Tab-ID': tabId }),
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
        ...(tabId && { tab_id: tabId }),
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.error('❌ Backend refresh failed:', errorData);
      return NextResponse.json(
        { 
          error: errorData.detail || 'Token refresh failed',
          details: errorData 
        },
        { status: backendResponse.status }
      );
    }

    const responseData = await backendResponse.json();
    
    if (!responseData.access_token) {
      return NextResponse.json(
        { error: 'No access token received from backend' },
        { status: 500 }
      );
    }

    // Return new tokens (no cookies set)
    const refreshResponse = {
      token: responseData.access_token,
      refresh_token: responseData.refresh_token || refreshToken,
      expires_in: responseData.expires_in,
      token_type: 'Bearer',
      ...(tabId && { tab_id: tabId }),
    };

    const response = NextResponse.json(refreshResponse);
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;

  } catch (error) {
    console.error('❌ Token refresh API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during token refresh',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}