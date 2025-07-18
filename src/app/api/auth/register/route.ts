// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * POST /api/auth/register
 * 
 * Forward registration request to Django backend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward request to backend
    const backendUrl = `${config.apiBaseUrl}/users/auth/register/`;
    console.log('🔗 Forwarding registration to:', backendUrl);
    
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const contentType = backendResponse.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      responseData = await backendResponse.json();
    } else {
      const textResponse = await backendResponse.text();
      responseData = {
        detail: textResponse,
        error_type: 'ERROR',
        status_code: backendResponse.status
      };
    }

    if (!backendResponse.ok) {
      console.error('❌ Backend registration failed:', responseData);
      return NextResponse.json(responseData, { status: backendResponse.status });
    }

    console.log('✅ Registration successful');
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Registration API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during registration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}