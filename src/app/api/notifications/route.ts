// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Notifications API Route - Proxy to Django Backend
 * 
 * This route forwards notification requests to the Django backend
 * following the established proxy pattern used throughout the system.
 * 
 * All requests are forwarded to `/api/communication/notifications/` on Django backend.
 */

/**
 * GET /api/notifications
 * Proxy to Django: /api/communication/notifications/
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const proxyUrl = `/api/proxy/communication/notifications/${queryString ? `?${queryString}` : ''}`;
  
  return fetch(new URL(proxyUrl, request.url), {
    method: 'GET',
    headers: request.headers,
  });
}

/**
 * POST /api/notifications 
 * Proxy to Django: /api/communication/notifications/
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const proxyUrl = `/api/proxy/communication/notifications/`;
  
  return fetch(new URL(proxyUrl, request.url), {
    method: 'POST',
    headers: request.headers,
    body,
  });
}

/**
 * PATCH /api/notifications
 * Proxy to Django: /api/communication/notifications/ (bulk operations)
 */
export async function PATCH(request: NextRequest) {
  const body = await request.text();
  const proxyUrl = `/api/proxy/communication/notifications/`;
  
  return fetch(new URL(proxyUrl, request.url), {
    method: 'PATCH',
    headers: request.headers,
    body,
  });
}

/**
 * DELETE /api/notifications
 * Proxy to Django: /api/communication/notifications/ (bulk operations)
 */
export async function DELETE(request: NextRequest) {
  const body = await request.text();
  const proxyUrl = `/api/proxy/communication/notifications/`;
  
  return fetch(new URL(proxyUrl, request.url), {
    method: 'DELETE',
    headers: request.headers,
    body,
  });
}