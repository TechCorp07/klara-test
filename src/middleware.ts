// middleware.ts  (Next 13/14, Edge runtime)
import { NextRequest, NextResponse } from 'next/server';
import { config as appConfig } from './lib/config';
import { UserRole } from './types/auth.types';

/*───────────────────────────────────────────────────────
  1.  PUBLIC ROUTES (skip auth entirely)
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
  '/terms-of-service',
  '/privacy-policy',
  '/hipaa-notice',
  '/contact',
  // assets & APIs
  '/_next', '/favicon.ico', '/api/auth', '/assets', '/images', '/fonts',
];

/*───────────────────────────────────────────────────────
  2.  ROLE-BASED PERMISSIONS
────────────────────────────────────────────────────────*/
const ROLE_ROUTES: Record<UserRole, string[]> = {
  /* … exactly the list you posted … */
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
  3.  MIDDLEWARE FUNCTION
────────────────────────────────────────────────────────*/
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  /*-- Public pages, static assets, and API calls – straight through --*/
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
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
      3a  NOT LOGGED-IN  → /login
  ─────────────────────────────────*/
  if (!token) {
    // If already on the login page or other public routes, don't redirect
    if (pathname === '/login' || PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }
    
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  /*─────────────────────────────────
      3b  HOUSE-KEEPING GATES
  ─────────────────────────────────*/
  if (!approved)  return NextResponse.redirect(new URL('/approval-pending', request.url));
  if (!verified)  return NextResponse.redirect(new URL('/verify-email',      request.url));

  /*─────────────────────────────────
      3c  AUTHORISATION by ROLE
  ─────────────────────────────────*/
  if (!role || !(role in ROLE_ROUTES)) {
    // corrupted or missing role cookie – force re-login
    return NextResponse.redirect(new URL('/login', request.url));
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
      3d  SUCCESS  → add security headers
  ─────────────────────────────────*/
  const res = NextResponse.next();
  res.headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; " +
    "style-src  'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src   'self' https://fonts.gstatic.com; " +
    "img-src    'self' data: https:; " +
    "connect-src 'self' https://api.klararety.com; frame-src 'self'; object-src 'none';");
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options',         'DENY');
  res.headers.set('X-XSS-Protection',        '1; mode=block');
  res.headers.set('Strict-Transport-Security','max-age=31536000; includeSubDomains; preload');
  res.headers.set('Referrer-Policy',         'strict-origin-when-cross-origin');

  return res;
}

/*───────────────────────────────────────────────────────
  4.  LIMIT THE SCOPE OF THE MIDDLEWARE
────────────────────────────────────────────────────────*/
export const config = {
  matcher: [
    // everything except Next internals, static assets, API, and the public pages above
    '/((?!_next/static|_next/image|favicon.ico|api|login|register|verify-email|' +
      'reset-password|forgot-password|two-factor|approval-pending|unauthorized).*)',
  ],
};