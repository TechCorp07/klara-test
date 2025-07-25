// src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

const ALLOWED_PATH_PREFIXES = [
  'users/',
  'patient/',
  'provider/',
  'caregiver/',
  'hipaa/',
  'emergency-access/',
  'consent/',
  'admin/',
  'compliance/',
  'researcher/',
  'pharmco/',
  'approvals/',
  'profile/',
  'auth/',
];

// Helper function to check if a path is allowed
function isPathAllowed(path: string): boolean {
  return ALLOWED_PATH_PREFIXES.some(prefix => path.startsWith(prefix));
}

/**
 * Proxy API requests to Django backend with tab-specific authentication
 * Now uses Authorization header instead of cookies
 */
async function handler(request: NextRequest) {
  try {
    // Extract the API path from the URL
    const { pathname } = request.nextUrl;
    const apiPath = pathname.replace('/api/proxy/', '');
    
    // Security check: Ensure the path is allowed
    if (!isPathAllowed(apiPath)) {
      console.error(`❌ Blocked unauthorized path: ${apiPath}`);
      return NextResponse.json(
        { error: 'Unauthorized path' },
        { status: 403 }
      );
    }
    
    // Get the authentication token from Authorization header (tab-specific auth)
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Prepare headers for the backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Use Bearer token format
      'X-Requested-With': 'XMLHttpRequest',
    };
    
    // Preserve any additional headers from the original request
    const contentType = request.headers.get('content-type');
    if (contentType && contentType !== 'application/json') {
      headers['Content-Type'] = contentType;
    }
    
    // Forward tab-specific headers
    const tabId = request.headers.get('x-tab-id');
    if (tabId) {
      headers['X-Tab-ID'] = tabId;
    }
    
    // Build the full backend URL
    const backendUrl = `${config.apiBaseUrl}/${apiPath}`;
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method: request.method,
      headers,
      // Only include body for methods that support it
      ...(request.method !== 'GET' && request.method !== 'HEAD' && {
        body: await request.text()
      })
    };
    
    // Make the request to the Django backend
    const backendResponse = await fetch(backendUrl, requestOptions);
    // Check content type before parsing
    const contentType1 = backendResponse.headers.get('content-type');
    let responseData;

    if (contentType1 && contentType1.includes('application/json')) {
      responseData = await backendResponse.json();
    } else {
      const textResponse = await backendResponse.text();
      // For non-JSON responses, create a JSON structure
      responseData = {
        error: textResponse,
        error_type: backendResponse.status === 403 ? 'BLOCKED' : 'ERROR',
        status_code: backendResponse.status
      };
    }

    // Return appropriate response
    if (!backendResponse.ok) {
      return NextResponse.json(responseData, { status: backendResponse.status });
    }

    return NextResponse.json(responseData);
    
    // Get response body
    const responseBody = await backendResponse.text();
    
    
    // Create Next.js response with same status and headers
    const response = new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });
    
    // Copy relevant headers from backend response
    const headersToPreserve = [
      'content-type',
      'cache-control',
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
    ];
    
    headersToPreserve.forEach(headerName => {
      const headerValue = backendResponse.headers.get(headerName);
      if (headerValue) {
        response.headers.set(headerName, headerValue);
      }
    });
    
    // Add CORS headers for frontend
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tab-ID');
    
    return response;
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Export handlers for all HTTP methods
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;