// src/jwt-middleware.ts
/**
 * JWT Authentication Middleware - Local Token Validation
 * 
 */

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

// Role-based route access mapping - this will be replaced by permission-based routing
// but provides backward compatibility during migration
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
 * JWT Token Structure Interface
 * 
 * This defines the expected structure of your JWT payload based on your backend
 * implementation. We validate this structure locally without requiring the secret.
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
 * Local JWT Validation Function
 * 
 * This function validates JWT structure and expiration WITHOUT requiring the secret.
 * We're using Option A approach - structure validation only. The backend will
 * handle signature validation when API calls are made.
 * 
 * Think of this like checking an ID card's format and expiration date without
 * calling the issuing authority to verify authenticity. It's fast and eliminates
 * timing issues while still providing good security.
 */
function validateJWTStructure(token: string): {
  isValid: boolean;
  payload?: JWTPayload;
  error?: string;
} {
  try {
    // Split JWT into parts (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, error: 'Invalid JWT format - missing parts' };
    }

    // Decode payload (this doesn't verify signature, just extracts data)
    const payloadBase64 = parts[1];
    
    // Add padding if needed for proper base64 decoding
    const paddedPayload = payloadBase64.padEnd(
      payloadBase64.length + (4 - payloadBase64.length % 4) % 4, 
      '='
    );
    
    const payloadJson = atob(paddedPayload);
    const payload: JWTPayload = JSON.parse(payloadJson);

    // Validate required fields exist
    if (!payload.user_id || !payload.email || !payload.role || !payload.exp) {
      return { isValid: false, error: 'JWT missing required fields' };
    }

    // Check expiration (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp < currentTime) {
      return { isValid: false, error: 'JWT token expired' };
    }

    // Validate role is a known role
    if (!Object.keys(ROLE_ROUTES).includes(payload.role)) {
      return { isValid: false, error: 'Invalid user role' };
    }

    return { isValid: true, payload };

  } catch (error) {
    return { 
      isValid: false, 
      error: `JWT parsing error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Check if user has access to a specific route based on their role and permissions
 * 
 * This function will be enhanced with permission-based routing in Phase 2,
 * but for now provides role-based access control for backward compatibility.
 */
function hasRouteAccess(userRole: UserRole, pathname: string, permissions?: JWTPayload['permissions']): boolean {
  // First check role-based access
  const allowedRoutes = ROLE_ROUTES[userRole] || [];
  const hasRoleAccess = allowedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Enhanced permission checks for admin routes
  if (pathname.startsWith('/admin')) {
    // Require admin access permission for any admin route
    if (!permissions?.has_admin_access) {
      return false;
    }

    // Specific admin route permission checks
    if (pathname.startsWith('/admin/users') && !permissions?.has_user_management_access) {
      return false;
    }
    
    if (pathname.startsWith('/admin/audit-logs') && !permissions?.has_audit_access) {
      return false;
    }
    
    if (pathname.startsWith('/admin/system-settings') && !permissions?.has_system_settings_access) {
      return false;
    }
    
    if (pathname.startsWith('/admin/compliance') && !permissions?.has_compliance_access) {
      return false;
    }
  }

  return hasRoleAccess;
}

/**
 * Main middleware function
 * 
 * This function runs for every request and determines authentication status
 * using ONLY local validation. No HTTP requests are made, eliminating race conditions.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for excluded paths (static assets, API routes, etc.)
  const isExcludedPath = EXCLUDED_PATHS.some(excluded => 
    pathname === excluded || pathname.startsWith(excluded + '/')
  );
  
  if (isExcludedPath) {
    return NextResponse.next();
  }

  // Allow access to public routes without authentication
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Extract JWT token from HttpOnly cookie
  // This is the ONLY source of authentication - no localStorage or other sources
  const token = request.cookies.get(appConfig.authCookieName)?.value;

  if (!token) {
    console.log(`🔐 No JWT token found for ${pathname} - redirecting to login`);
    const loginUrl = new URL('/login', request.url);
    
    // Add return URL for non-root paths to enable redirect after login
    if (pathname !== '/' && 
        pathname !== '/dashboard' && 
        pathname.length < 100 && // Prevent extremely long URLs
        !pathname.includes('logout')) {
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
  // This allows pages and API routes to access user info without additional validation
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
 * 
 * This tells Next.js which routes to run the middleware on.
 * We exclude API routes and static assets for performance.
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