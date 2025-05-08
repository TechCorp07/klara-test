// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { config as appConfig } from './lib/config';
import { UserRole } from './types/auth.types';

// Define route permissions by role
// This maps user roles to the routes they are allowed to access
const routePermissions: Record<UserRole, string[]> = {
  patient: [
    '/dashboard',
    '/profile',
    '/settings',
    '/healthcare',
    '/appointments',
    '/prescriptions',
    '/medical-records',
    '/telemedicine',
    '/medication',
    '/wearables',
    '/communication',
    '/community',
  ],
  
  provider: [
    '/dashboard',
    '/profile',
    '/settings',
    '/healthcare',
    '/patients',
    '/appointments',
    '/prescriptions',
    '/medical-records',
    '/telemedicine',
    '/medication',
    '/communication',
  ],
  
  pharmco: [
    '/dashboard',
    '/profile',
    '/settings',
    '/research',
    '/clinical-trials',
    '/data-analytics',
    '/communication',
  ],
  
  caregiver: [
    '/dashboard',
    '/profile',
    '/settings',
    '/patients',
    '/healthcare',
    '/appointments',
    '/medication',
    '/communication',
  ],
  
  researcher: [
    '/dashboard',
    '/profile',
    '/settings',
    '/research',
    '/clinical-trials',
    '/data-analytics',
    '/communication',
  ],
  
  admin: [
    '/dashboard',
    '/profile',
    '/settings',
    '/admin',
    '/users',
    '/approvals',
    '/healthcare',
    '/patients',
    '/appointments',
    '/prescriptions',
    '/medical-records',
    '/telemedicine',
    '/medication',
    '/communication',
    '/reports',
    '/research',
    '/clinical-trials',
    '/data-analytics',
    '/system',
  ],
  
  superadmin: [
    '/', // Superadmin can access all routes
  ],
  
  compliance: [
    '/dashboard',
    '/profile',
    '/settings',
    '/compliance',
    '/audits',
    '/reports',
    '/users',
  ],
};

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/verify-email',
  '/reset-password',
  '/forgot-password',
  '/approval-pending',
  '/two-factor',
  '/unauthorized',
  '/terms-of-service',
  '/privacy-policy',
  '/hipaa-notice',
  '/_next',
  '/favicon.ico',
  '/api/auth',
  '/assets',
  '/images',
  '/fonts',
];

/**
 * Middleware function for route protection based on authentication and user roles
 * 
 * This middleware intercepts all requests and:
 * 1. Allows public routes without authentication
 * 2. Checks for authentication tokens in cookies
 * 3. Verifies if the user has permission to access the requested route
 * 4. Redirects unauthorized users appropriately
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes and static assets
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check if user is authenticated (using cookies)
  const token = request.cookies.get(appConfig.authCookieName)?.value;
  const userRole = request.cookies.get(appConfig.userRoleCookieName)?.value as UserRole | undefined;
  const isEmailVerified = request.cookies.get(appConfig.emailVerifiedCookieName)?.value === 'true';
  const isApproved = request.cookies.get(appConfig.isApprovedCookieName)?.value !== 'false';
  
  // If no token, redirect to login
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // If not approved, redirect to approval pending page
  if (!isApproved) {
    return NextResponse.redirect(new URL('/approval-pending', request.url));
  }
  
  // If email not verified, redirect to verify email page
  if (!isEmailVerified) {
    return NextResponse.redirect(new URL('/verify-email', request.url));
  }
  
  // If no role or invalid role, redirect to login to re-authenticate
  if (!userRole || !Object.keys(routePermissions).includes(userRole)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check if superadmin (has access to all routes)
  if (userRole === 'superadmin') {
    return NextResponse.next();
  }
  
  // Check if user has permission to access the route
  const hasPermission = routePermissions[userRole].some(route => 
    pathname === route || // Exact match
    pathname.startsWith(`${route}/`) // Path starts with the route followed by a slash
  );
  
  // If no permission, redirect to unauthorized page
  if (!hasPermission) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  // Add security headers for HIPAA compliance
  const response = NextResponse.next();
  
  // Content security policy to prevent XSS attacks
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.klararety.com; " +
    "frame-src 'self'; " +
    "object-src 'none';"
  );
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Enable browser XSS protections
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Enforce HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Prevent browser from sending Referer header
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/((?!api/auth/login|api/auth/logout|_next/static|_next/image|favicon.ico).*)'],
};