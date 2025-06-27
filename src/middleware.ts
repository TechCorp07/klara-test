// src/middleware.ts - WITH DEBUG LOGGING
import { NextRequest, NextResponse } from 'next/server';
import { config as appConfig } from './lib/config';
import { UserRole } from './types/auth.types';

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
  '/_next', '/favicon.ico', '/api', '/assets', '/images', '/fonts',
];

const ROLE_ROUTES: Record<UserRole, string[]> = {
  patient: ['/dashboard', '/profile', '/settings', '/messages', 
    '/health-records', '/appointments','/settings/password',
     '/telemedicine', '/research', '/clinical-trials', '/medications'],
  provider: ['/dashboard', '/profile', '/settings', '/settings/password',
     '/messages', '/clinical-trials', '/patients',
      '/health-records', '/appointments', '/telemedicine', 
      '/medications'], // Provider-specific patient management
  admin: ['/dashboard', '/profile', '/settings', '/settings/password',
     '/messages', '/users', '/reports',  '/admin',
    '/approvals', '/users', '/audit-logs', '/system-settings'],
  pharmco: ['/dashboard', '/profile', '/settings', '/settings/password',
     '/messages', '/medications', '/clinical-trials', '/reports', // Pharmaceutical reports
     '/research'],
  caregiver: ['/dashboard', '/profile', '/settings', '/settings/password',
    '/messages', '/health-records', '/appointments', '/telemedicine',
    '/medications', '/patients'], // For their assigned patients
  researcher: ['/dashboard', '/profile', '/settings', '/settings/password',
    '/messages', '/research', '/clinical-trials', '/reports'], // Research reports
  superadmin: ['/'],
  compliance: ['/dashboard', '/profile', '/settings', '/settings/password',
    '/messages', '/audit-logs', '/compliance-reports', '/emergency-access',
    '/consent-records', '/compliance'], // HIPAA consent tracking, // Review emergency access
};

function hasRedirectLoop(returnUrl: string): boolean {
  try {
    if (returnUrl.includes('/login') || 
        returnUrl.includes('%2Flogin') || 
        returnUrl.includes('%252Flogin')) {
      return true;
    }
    
    const returnUrlCount = (returnUrl.match(/returnUrl/g) || []).length;
    if (returnUrlCount > 1) {
      return true;
    }
    
    if (returnUrl.length > 500) {
      return true;
    }
    
    const encodingLevels = returnUrl.split('%25').length - 1;
    if (encodingLevels > 5) {
      return true;
    }
    
    return false;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const returnUrl = searchParams.get('returnUrl');

  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (returnUrl && hasRedirectLoop(returnUrl)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname === '/login' && returnUrl) {
    try {
      const decodedUrl = decodeURIComponent(returnUrl);
      
      if (decodedUrl.includes('/login') || 
          decodedUrl.includes('/register') ||
          decodedUrl.includes('/verify-email') ||
          decodedUrl.includes('/reset-password')) {
        console.warn('🚫 Login page with auth returnUrl - redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      console.warn('🚫 Failed to decode returnUrl - redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  const token   = request.cookies.get(appConfig.authCookieName)?.value;
  const role    = request.cookies.get(appConfig.userRoleCookieName)?.value as UserRole | undefined;
  const verified = request.cookies.get(appConfig.emailVerifiedCookieName)?.value === 'true';
  const approved = request.cookies.get(appConfig.isApprovedCookieName)?.value !== 'false';

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    
    if (!pathname.includes('/login') && 
        pathname.length < 100 && 
        !hasRedirectLoop(pathname)) {
      loginUrl.searchParams.set('returnUrl', pathname);
    }
    
    return NextResponse.redirect(loginUrl);
  }

  if (!approved) {
    return NextResponse.redirect(new URL('/approval-pending', request.url));
  }
  
  if (!verified) {
    return NextResponse.redirect(new URL('/verify-email', request.url));
  }

  if (!role || !(role in ROLE_ROUTES)) {
    const response = NextResponse.redirect(new URL('/login', request.url));
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

  const res = NextResponse.next();
  
  if (process.env.NODE_ENV === 'production') {
    // Production CSP - Still secure but allows Next.js to function
    res.headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.klararety.com; " +
      "frame-ancestors 'none';"
    );
  } else {
    // Development CSP - More permissive for Next.js dev features
    res.headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "connect-src 'self' http://localhost:* ws://localhost:* https://api.klararety.com; " +
      "frame-ancestors 'none';"
    );
  }
  
  // Other security headers
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HIPAA-specific headers
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};