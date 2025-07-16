// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { config as appConfig } from './lib/config';
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
 * Validate JWT token structure and expiration locally
 * This does NOT verify the signature - that's done on the backend
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

  // Skip middleware for excluded paths
  if (shouldExcludePath(pathname)) {
    return NextResponse.next();
  }

  // Allow public routes to proceed without authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Extract JWT token from HTTP-only cookie
  const token = request.cookies.get(appConfig.authCookieName)?.value;
  
  if (!token) {
    console.log(`🔐 No authentication token found for ${pathname}`);
    
    // Store the attempted URL for post-login redirect
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/login') {
      loginUrl.searchParams.set('returnUrl', pathname);
    }

    return NextResponse.redirect(loginUrl);
  }

  // Validate JWT token structure and expiration locally
  const validationResult = validateJWTStructure(token);
  
  if (!validationResult.isValid || !validationResult.payload) {
    console.log(`🔐 Invalid JWT token for ${pathname}: ${validationResult.error}`);
    
    // Clear invalid cookie and redirect to login
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    
    // Clear the invalid cookie
    response.cookies.set({
      name: appConfig.authCookieName,
      value: '',
      httpOnly: true,
      secure: appConfig.secureCookies,
      sameSite: 'strict',
      path: '/',
      expires: new Date(0), // Expire immediately
    });
    
    return response;
  }

  const { payload } = validationResult;

  // Check if user has access to the requested route
  if (!hasRouteAccess(payload.role, pathname, payload.permissions)) {
    console.log(`🔐 Access denied for ${payload.role} to ${pathname}`);
    
    // Redirect to appropriate dashboard based on role
    const dashboardPath = `/${payload.role}`;
    const unauthorizedUrl = new URL(dashboardPath, request.url);
    
    return NextResponse.redirect(unauthorizedUrl);
  }

  // User is authenticated and authorized - allow request to proceed
  console.log(`✅ Access granted for ${payload.role} to ${pathname}`);
  
  // Add user context to request headers for downstream use
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.user_id.toString());
  response.headers.set('x-user-role', payload.role);
  response.headers.set('x-user-email', payload.email);
  response.headers.set('x-session-id', payload.session_id);
  
  if (payload.permissions) {
    response.headers.set('x-user-permissions', JSON.stringify(payload.permissions));
  }

  return response;
}

/**
 * Middleware Configuration
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any file with an extension (images, css, js, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};