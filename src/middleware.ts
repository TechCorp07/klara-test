// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from './types/auth.types';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register', 
  '/verify-email',
  '/reset-password',
  '/forgot-password',
  '/two-factor',
  '/approval-pending',
  '/unauthorized',
  '/compliance-violation',
  '/terms-of-service',
  '/privacy-policy', 
  '/hipaa-notice',
  '/contact',
  '/about',
  '/help',
  '/support',
  '/faq',
];

// Paths to exclude from middleware processing entirely
const EXCLUDED_PATHS = [
  '/_next',
  '/favicon.ico',
  '/api',
  '/assets',
  '/images', 
  '/fonts',
  '/.well-known',
  '/logout',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
];

// Role-based route access mapping
const ROLE_ROUTES: Record<UserRole, string[]> = {
  patient: ['/patient', '/profile', '/settings', '/messages', '/health-records', '/appointments', '/telemedicine', '/research', '/clinical-trials', '/medications'],
  provider: ['/provider', '/profile', '/settings', '/messages', '/clinical-trials', '/patients', '/health-records', '/appointments', '/telemedicine', '/medications'],
  admin: ['/admin', '/profile', '/settings', '/messages', '/users', '/reports', '/approvals', '/audit-logs', '/system-settings', '/monitoring'],
  pharmco: ['/pharmco', '/profile', '/settings', '/messages', '/medications', '/clinical-trials', '/reports', '/research'],
  caregiver: ['/caregiver', '/profile', '/settings', '/messages', '/health-records', '/appointments', '/patients'],
  researcher: ['/researcher', '/profile', '/settings', '/messages', '/research', '/clinical-trials', '/studies', '/data-analysis'],
  superadmin: ['/admin', '/patient', '/provider', '/pharmco', '/caregiver', '/researcher', '/compliance'],
  compliance: ['/compliance', '/profile', '/settings', '/messages', '/audit-logs', '/emergency-access', '/consent-management', '/reports'],
};

/**
 * JWT Token Structure Interface for local validation
 */
interface JWTPayload {
  user_id: number;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
  jti: string;
  session_id: string;
  jwt_version: number;
  primary_tenant_id?: number;
  permissions?: {
    has_admin_access?: boolean;
    has_user_management_access?: boolean;
    has_audit_access?: boolean;
    has_compliance_access?: boolean;
    has_system_settings_access?: boolean;
    has_export_access?: boolean;
    is_superadmin?: boolean;
  };
  emergency_access?: boolean;
  last_password_change?: number;
}

/**
 * Get JWT token from Authorization header ONLY (no cookie fallback)
 */
function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null; // NO COOKIE FALLBACK
}

/**
 * Validate JWT token structure and expiration locally
 */
function validateJWTStructure(token: string): { isValid: boolean; payload?: JWTPayload; error?: string } {
  try {
    // Basic format validation
    if (!token || typeof token !== 'string') {
      return { isValid: false, error: 'Invalid token format' };
    }

    // JWT structure validation (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, error: 'Invalid JWT structure' };
    }

    // Decode payload without signature verification
    const payload = decodeJWTPayload(parts[1]);
    if (!payload) {
      return { isValid: false, error: 'Failed to decode payload' };
    }

    // Validate required fields
    const requiredFields = ['user_id', 'email', 'role', 'exp', 'iat', 'jti'];
    for (const field of requiredFields) {
      if (!(field in payload)) {
        return { isValid: false, error: `Missing required field: ${field}` };
      }
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp <= currentTime) {
      return { isValid: false, error: 'Token expired' };
    }

    // Check if token was issued in the future (clock skew protection)
    if (payload.iat > currentTime + 60) { // Allow 60 seconds of clock skew
      return { isValid: false, error: 'Token issued in future' };
    }

    return { isValid: true, payload };

  } catch (error) {
    return { 
      isValid: false, 
      error: `Token validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Decode JWT payload from base64
 */
function decodeJWTPayload(payloadBase64: string): JWTPayload | null {
  try {
    // Handle base64 padding
    const paddedPayload = payloadBase64.padEnd(
      payloadBase64.length + (4 - payloadBase64.length % 4) % 4,
      '='
    );

    const payloadJson = atob(paddedPayload);
    return JSON.parse(payloadJson) as JWTPayload;
  } catch (error) {
    console.error('JWT payload decode error:', error);
    return null;
  }
}

/**
 * Check if user role has access to the requested route
 */
function hasRouteAccess(
  role: UserRole, 
  pathname: string, 
  permissions?: JWTPayload['permissions']
): boolean {
  // Superadmin has access to everything
  if (role === 'superadmin' || permissions?.is_superadmin) {
    return true;
  }

  // Check admin routes with permission-based access
  if (pathname.startsWith('/admin')) {
    return permissions?.has_admin_access === true;
  }

  // Check role-based access for other routes
  const allowedRoutes = ROLE_ROUTES[role] || [];
  return allowedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if the path should be excluded from middleware processing
 */
function shouldExcludePath(pathname: string): boolean {
  return EXCLUDED_PATHS.some(path => pathname.startsWith(path));
}

/**
 * Check if the path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname) || 
         pathname.startsWith('/verify-email/') || 
         pathname.startsWith('/reset-password/');
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldExcludePath(pathname)) {
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const token = getAuthToken(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const validationResult = validateJWTStructure(token);
    if (!validationResult.isValid || !validationResult.payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|images|fonts).*)',
  ],
};