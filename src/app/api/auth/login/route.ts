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

    const contentType = backendResponse.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      responseData = await backendResponse.json();
    } else {
      // Handle plain text responses (security blocks, etc.)
      const textResponse = await backendResponse.text();
      responseData = {
        detail: textResponse,
        error_type: backendResponse.status === 403 ? 'BLOCKED' : 'ERROR',
        status_code: backendResponse.status
      };
    }

    if (!backendResponse.ok) {
      console.error('❌ Backend login failed:', responseData);
      
      // Enhanced error handling for different scenarios
      let errorMessage = 'Login failed';
      let errorType = 'GENERAL_ERROR';
      
      if (responseData.detail) {
        const detail = responseData.detail.toLowerCase();
        
        // Check for IP blacklisting
        if (detail.includes('ip address blacklisted') || detail.includes('blacklisted')) {
          errorMessage = 'Your IP address has been temporarily blocked due to security concerns. Please contact support if you believe this is an error.';
          errorType = 'IP_BLACKLISTED';
        }
        // Check for rate limiting
        else if (detail.includes('rate limit') || detail.includes('too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
          errorType = 'RATE_LIMITED';
        }
        // Check for account lockout
        else if (detail.includes('account locked') || detail.includes('locked')) {
          errorMessage = 'Your account has been temporarily locked. Please contact support or try again later.';
          errorType = 'ACCOUNT_LOCKED';
        }
        // Default to original message
        else {
          errorMessage = responseData.detail || responseData.message || 'Login failed';
        }
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          error_type: errorType,
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