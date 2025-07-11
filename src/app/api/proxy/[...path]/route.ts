// src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

// Define allowed API path prefixes for security
// Using prefixes to cover all sub-paths
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
 * Proxy API requests to Django backend with proper authentication
 * This route reads the HttpOnly cookie and adds the Authorization header
 */
async function handler(request: NextRequest) {
  try {
    // Extract the API path from the URL
    const { pathname } = request.nextUrl;
    const apiPath = pathname.replace('/api/proxy/', '');
    
    console.log(`🔄 Proxying request to: ${apiPath}`);
    
    // Security check: Ensure the path is allowed
    if (!isPathAllowed(apiPath)) {
      console.error(`❌ Blocked unauthorized path: ${apiPath}`);
      return NextResponse.json(
        { error: 'Unauthorized path' },
        { status: 403 }
      );
    }
    
    // Get the authentication token from HttpOnly cookie
    const token = request.cookies.get(config.authCookieName)?.value;
    
    if (!token) {
      console.log('❌ No authentication token found in proxy');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Prepare headers for the backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`, // Django expects this format
      'X-Requested-With': 'XMLHttpRequest',
    };
    
    // Preserve any additional headers from the original request
    const contentType = request.headers.get('content-type');
    if (contentType && contentType !== 'application/json') {
      headers['Content-Type'] = contentType;
    }
    
    // Build the full backend URL
    const backendUrl = `${config.apiBaseUrl}/${apiPath}`;
    console.log(`📤 Forwarding to backend: ${request.method} ${backendUrl}`);
    
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
    
    // Log the response status
    console.log(`📥 Backend response: ${backendResponse.status}`);
    
    // Get response body
    const contentTypeHeader = backendResponse.headers.get('content-type');
    let responseBody;
    
    if (contentTypeHeader?.includes('application/json')) {
      responseBody = await backendResponse.json();
    } else {
      responseBody = await backendResponse.text();
    }
    
    // Create the response with the same status code
    const response = NextResponse.json(
      responseBody,
      { status: backendResponse.status }
    );
    
    // Forward any important headers from the backend
    const headersToForward = ['x-request-id', 'x-response-time'];
    headersToForward.forEach(header => {
      const value = backendResponse.headers.get(header);
      if (value) {
        response.headers.set(header, value);
      }
    });
    
    return response;
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error' },
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