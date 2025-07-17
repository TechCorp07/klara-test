// src/app/api/auth/logout-all/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * POST /api/auth/logout-all
 * 
 * Handles logout for all tabs (global logout)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Global logout API: Starting logout for all tabs...');
    
    // Get JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    const jwtToken = authHeader?.replace('Bearer ', '');
    
    // Try to notify backend about global logout if token exists
    if (jwtToken) {
      try {
        const backendUrl = `${config.apiBaseUrl}/users/auth/logout/`;
        console.log('🔗 Calling backend global logout:', backendUrl);
        
        const backendResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
            'Accept': 'application/json',
            'X-Auth-Type': 'global-logout',
          },
          body: JSON.stringify({
            logout_type: 'global',
          }),
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (backendResponse.ok) {
          const backendData = await backendResponse.json();
          console.log('✅ Backend global logout successful:', backendData.detail);
        } else {
          const errorText = await backendResponse.text();
          console.warn('⚠️ Backend global logout failed:', backendResponse.status, errorText);
          console.warn('⚠️ Continuing with frontend global logout...');
        }
      } catch (backendError) {
        console.warn('⚠️ Backend global logout error:', backendError);
        console.warn('⚠️ Continuing with frontend global logout...');
      }
    } else {
      console.log('ℹ️ No JWT token found, skipping backend logout call');
    }
    
    // Create response with success
    const response = NextResponse.json({
      success: true,
      message: 'Global logout successful',
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    console.log('✅ Global logout completed');
    
    return response;

  } catch (error) {
    console.error('❌ Global logout API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during global logout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}