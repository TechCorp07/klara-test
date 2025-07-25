// src/app/api/not-found/route.ts - Handle DevTools and other problematic requests
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to handle requests for missing or problematic routes
 * This prevents Chrome DevTools requests from causing middleware issues
 * and reduces 404 noise in logs
 */

export async function GET(_request: NextRequest) {
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