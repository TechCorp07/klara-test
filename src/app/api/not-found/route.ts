// src/app/api/not-found/route.ts - Handle DevTools and other problematic requests
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to handle requests for missing or problematic routes
 * This prevents Chrome DevTools requests from causing middleware issues
 * and reduces 404 noise in logs
 */

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only log non-DevTools requests to reduce noise
  if (!pathname.includes('.well-known') && 
      !pathname.includes('chrome.devtools') && 
      !pathname.includes('appspecific')) {
    console.log('🔍 API not-found route accessed:', pathname);
  }
  
  // Return a clean 404 response
  return NextResponse.json(
    { 
      error: 'Not found',
      message: 'The requested resource was not found.',
      status: 404
    }, 
    { 
      status: 404,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json',
      }
    }
  );
}

// Handle all HTTP methods to catch any type of request
export async function POST(request: NextRequest) {
  return GET(request);
}

export async function PUT(request: NextRequest) {
  return GET(request);
}

export async function DELETE(request: NextRequest) {
  return GET(request);
}

export async function PATCH(request: NextRequest) {
  return GET(request);
}

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 404 });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { 
    status: 404,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  });
}