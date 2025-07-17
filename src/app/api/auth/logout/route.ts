// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * POST /api/auth/logout
 * 
 * Handles tab-specific logout (replaces cookie-based logout)
 * Now expects Authorization header instead of cookies
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Tab logout API: Starting logout...');
    
    const body = await request.json().catch(() => ({}));
    const tabId = body.tabId;
    
    // Get JWT token from Authorization header (tab-specific auth)
    const authHeader = request.headers.get('authorization');
    const jwtToken = authHeader?.replace('Bearer ', '');
    
    if (!jwtToken) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    console.log('📋 Logout for tab ID:', tabId || 'unknown');
    
    // Notify backend about logout
    try {
      const backendUrl = `${config.apiBaseUrl}/users/auth/logout/`;
      console.log('🔗 Calling backend logout:', backendUrl);
      
      const backendResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
          'Accept': 'application/json',
          ...(tabId && { 'X-Tab-ID': tabId }),
        },
        body: JSON.stringify({
          ...(tabId && { tab_id: tabId }),
          logout_type: 'tab_specific',
        }),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        console.log('✅ Backend logout successful:', backendData.detail);
      } else {
        const errorText = await backendResponse.text();
        console.warn('⚠️ Backend logout failed:', backendResponse.status, errorText);
        console.warn('⚠️ Continuing with frontend logout...');
      }
    } catch (backendError) {
      console.warn('⚠️ Backend logout error:', backendError);
      console.warn('⚠️ Continuing with frontend logout...');
    }
    
    // Create response with success (no cookies to clear)
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
      ...(tabId && { tab_id: tabId }),
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    console.log('✅ Tab logout completed');
    
    return response;

  } catch (error) {
    console.error('❌ Logout API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during logout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}