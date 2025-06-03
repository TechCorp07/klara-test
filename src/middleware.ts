// src/middleware.ts - Enhanced with better loop prevention
import { NextRequest, NextResponse } from 'next/server';
import { config as appConfig } from './lib/config';
import { UserRole } from './types/auth.types';

/*───────────────────────────────────────────────────────
  1.  ENHANCED PUBLIC ROUTES with better coverage
────────────────────────────────────────────────────────*/
const PUBLIC_ROUTES = [
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
  // assets & APIs
  '/_next', '/favicon.ico', '/api', '/assets', '/images', '/fonts',
];

/*───────────────────────────────────────────────────────
  2.  ROLE-BASED PERMISSIONS (unchanged)
────────────────────────────────────────────────────────*/
const ROLE_ROUTES: Record<UserRole, string[]> = {
  patient: [
    '/dashboard', '/profile', '/settings', '/healthcare',
    '/appointments', '/prescriptions', '/medical-records',
    '/telemedicine', '/medication', '/wearables',
    '/communication', '/community',
  ],
  provider: [
    '/dashboard', '/profile', '/settings', '/healthcare',
    '/patients', '/appointments', '/prescriptions',
    '/medical-records', '/telemedicine', '/medication',
    '/communication',
  ],
  pharmco: [
    '/dashboard', '/profile', '/settings', '/research',
    '/clinical-trials', '/data-analytics', '/communication',
  ],
  caregiver: [
    '/dashboard', '/profile', '/settings', '/patients',
    '/healthcare', '/appointments', '/medication', '/communication',
  ],
  researcher: [
    '/dashboard', '/profile', '/settings', '/research',
    '/clinical-trials', '/data-analytics', '/communication',
  ],
  admin: [
    '/dashboard', '/profile', '/settings', '/admin', '/users',
    '/approvals', '/healthcare', '/patients', '/appointments',
    '/prescriptions', '/medical-records', '/telemedicine',
    '/medication', '/communication', '/reports',
    '/research', '/clinical-trials', '/data-analytics', '/system',
  ],
  superadmin: ['/'],           // wildcard
  compliance: [
    '/dashboard', '/profile', '/settings',
    '/compliance', '/audits', '/reports', '/users',
  ],
};

/*───────────────────────────────────────────────────────
  3.  CRITICAL FIX: Enhanced loop detection function
────────────────────────────────────────────────────────*/
function hasRedirectLoop(returnUrl: string): boolean {
  try {
    // Check for basic loop patterns
    if (returnUrl.includes('/login') || 
        returnUrl.includes('%2Flogin') || 
        returnUrl.includes('%252Flogin')) {
      return true;
    }
    
    // Check for nested returnUrl parameters
    const returnUrlCount = (returnUrl.match(/returnUrl/g) || []).length;
    if (returnUrlCount > 1) {
      return true;
    }
    
    // Check for excessive URL length (indicates recursive encoding)
    if (returnUrl.length > 500) {
      return true;
    }
    
    // Check for multiple levels of URL encoding
    const encodingLevels = returnUrl.split('%25').length - 1;
    if (encodingLevels > 5) {
      return true;
    }
    
    return false;
  } catch {
    // If we can't parse the URL, assume it's problematic
    return true;
  }
}

/*───────────────────────────────────────────────────────
  4.  ENHANCED MIDDLEWARE FUNCTION with better loop detection
────────────────────────────────────────────────────────*/
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  /*-- CRITICAL FIX: Better public route detection --*/
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // CRITICAL: Let all public routes through WITHOUT any auth checks
  if (isPublicRoute) {
    return NextResponse.next();
  }

  /*-- CRITICAL FIX: Enhanced loop detection for returnUrl parameters --*/
  const returnUrl = searchParams.get('returnUrl');
  if (returnUrl && hasRedirectLoop(returnUrl)) {
    console.warn('Detected redirect loop in middleware, breaking cycle');
    // Clear the problematic returnUrl and redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  /*-- CRITICAL FIX: Prevent login page from redirecting to itself --*/
  if (pathname === '/login' && returnUrl) {
    try {
      const decodedUrl = decodeURIComponent(returnUrl);
      
      // If returnUrl points to login or other auth pages, redirect to dashboard
      if (decodedUrl.includes('/login') || 
          decodedUrl.includes('/register') ||
          decodedUrl.includes('/verify-email') ||
          decodedUrl.includes('/reset-password')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      // If decoding fails, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  /*-- Grab session info from signed cookies --*/
  const token   = request.cookies.get(appConfig.authCookieName)?.value;
  const role    = request.cookies.get(appConfig.userRoleCookieName)
                        ?.value as UserRole | undefined;
  const verified = request.cookies
                        .get(appConfig.emailVerifiedCookieName)?.value === 'true';
  const approved = request.cookies
                        .get(appConfig.isApprovedCookieName)?.value !== 'false';

  /*─────────────────────────────────
      4a  NOT LOGGED-IN  → /login
  ─────────────────────────────────*/
  if (!token) {
    // ENHANCED: Better returnUrl handling with loop prevention
    const loginUrl = new URL('/login', request.url);
    
    // Only add returnUrl if it's safe and not too long
    if (!pathname.includes('/login') && 
        pathname.length < 100 && 
        !hasRedirectLoop(pathname)) {
      loginUrl.searchParams.set('returnUrl', pathname);
    }
    
    return NextResponse.redirect(loginUrl);
  }

  /*─────────────────────────────────
      4b  HOUSE-KEEPING GATES
  ─────────────────────────────────*/
  if (!approved)  return NextResponse.redirect(new URL('/approval-pending', request.url));
  if (!verified)  return NextResponse.redirect(new URL('/verify-email', request.url));

  /*─────────────────────────────────
      4c  AUTHORISATION by ROLE
  ─────────────────────────────────*/
  if (!role || !(role in ROLE_ROUTES)) {
    // corrupted or missing role cookie – force re-login
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Clear corrupted cookies
    response.cookies.delete(appConfig.authCookieName);
    response.cookies.delete(appConfig.userRoleCookieName);
    return response;
  }

  if (role !== 'superadmin') {
    const allowed = ROLE_ROUTES[role].some(base =>
      pathname === base || pathname.startsWith(base + '/')
    );
    if (!allowed) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  /*─────────────────────────────────
      4d  SUCCESS  → add security headers
  ─────────────────────────────────*/
  const res = NextResponse.next();
  
  // HIPAA-compliant security headers
  res.headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; " +
    "style-src  'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src   'self' https://fonts.gstatic.com; " +
    "img-src    'self' data: https:; " +
    "connect-src 'self' https://api.klararety.com http://localhost:8000 http://127.0.0.1:8000/; " +
    "frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';");
    
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add cache control for sensitive pages
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.headers.set('Pragma', 'no-cache');

  return res;
}

/*───────────────────────────────────────────────────────
  5.  MIDDLEWARE MATCHER (unchanged but documented)
────────────────────────────────────────────────────────*/
export const config = {
  matcher: [
    // Apply to all routes except static files and API routes that should bypass
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};